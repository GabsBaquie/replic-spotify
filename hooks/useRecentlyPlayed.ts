import { useEffect, useState } from 'react'
import getRecentlyPlayed from '@/query/profile/recentlyPlayed'

export type Track = {
  id: string;
  name: string;
  preview_url: string | null;
  album: { images: { url: string }[] };
}

/**
 * Hook pour récupérer les morceaux récemment joués.
 * @param limit Nombre de morceaux à récupérer
 */
export default function useRecentlyPlayed(limit = 20) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getRecentlyPlayed(limit)
      .then((data: Track[]) => {
        // dédupliquer les morceaux successifs identiques
        const deduped = data.reduce<Track[]>((acc: Track[], cur: Track) => {
          if (!acc.length || acc[0].id !== cur.id) acc.unshift(cur)
          return acc
        }, [] as Track[]).slice(0, limit)
        setTracks(deduped)
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false))
  }, [limit])

  return { tracks, loading }
} 