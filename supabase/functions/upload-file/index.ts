import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration CORS pour autoriser ton front à appeler la fonction
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Spotify-Token',
};

// Point d'entrée de l'Edge Function
serve(async (req) => {
  // Réponse immédiate aux pré‑requêtes CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Vérification de l'authentification Spotify via le header X-Spotify-Token
    const spotifyToken = req.headers.get('X-Spotify-Token');
    if (!spotifyToken) {
      return new Response(JSON.stringify({ error: 'Token manquant' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Appel à l'API Spotify pour valider le token
    const spotifyRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    if (spotifyRes.status !== 200) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // 2. Récupération des données envoyées en multipart/form-data (fichier + infos)
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;           // fichier envoyé
    const bucket = formData.get('bucket') as string | null;     // nom du bucket
    const filename = formData.get('filename') as string | null; // chemin+nom du fichier

    // Vérifie que tous les champs requis sont présents
    if (!file || !bucket || !filename) {
      return new Response(
        JSON.stringify({ error: 'file, bucket, filename requis' }),
        { status: 400, headers: corsHeaders },
      );
    }

    // Log utile pour vérifier que le fichier arrive bien dans la fonction
    console.log('file.size =', (file as any).size, 'file.type =', (file as any).type);

    // 3. Conversion du Blob en bytes (Uint8Array) avant upload dans Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    // Initialisation du client Supabase avec la clé service_role (côté serveur uniquement)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Upload du fichier dans le bucket Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, fileBytes, {
        upsert: true,                                   // écrase si le fichier existe déjà
        contentType: (file as any).type || 'application/octet-stream', // type MIME
      });

    // Gestion d'erreur côté Storage
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 4. Génération de l'URL selon le type de bucket
    let url: string;
    
    if (bucket === 'tracks') {
      // Bucket privé : générer une URL signée (valide 1 an)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 31536000); // 1 an (en secondes)
      
      if (signedError || !signedData?.signedUrl) {
        return new Response(
          JSON.stringify({ error: `Impossible de générer l'URL signée: ${signedError?.message || 'Erreur inconnue'}` }),
          { status: 500, headers: corsHeaders },
        );
      }
      
      url = signedData.signedUrl;
    } else {
      // Bucket public : utiliser l'URL publique
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      url = urlData.publicUrl;
    }

    return new Response(
      JSON.stringify({ path: data.path, url }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (err: any) {
    // Gestion d'erreur générale (exceptions inattendues)
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
