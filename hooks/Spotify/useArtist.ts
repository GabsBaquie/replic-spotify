import { useEffect, useState } from "react";
import { getArtistDetails, getTopTracksByArtist } from "@/query/artist/Artist";

/**
 * Hook pour récupérer l'artiste et ses meilleurs titres.
 * @param id identifiant Spotify de l'artiste
 */
export default function useArtist(id: string | undefined) {
  const [artist, setArtist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getArtistDetails(id), getTopTracksByArtist(id)])
      .then(([details, topTracks]) => {
        setArtist(details);
        setTracks(topTracks);
      })
      .catch(() => {
        setArtist(null);
        setTracks([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { artist, tracks, loading };
}
