import { useEffect, useState } from "react";
import getTopArtists from "@/query/profile/topArtists";

export type Artist = {
  id: string;
  name: string;
  images: { url: string }[];
};

/**
 * Hook pour récupérer les top artists.
 * @param limit Nombre d'artistes à récupérer
 */
export default function useTopArtists(limit = 10) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getTopArtists(limit)
      .then((data) => setArtists(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [limit]);

  return { artists, loading };
}
