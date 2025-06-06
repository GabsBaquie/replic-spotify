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
        // dédupliquer tous les morceaux en conservant l'ordre
        const unique: Track[] = []
        const seenIds = new Set<string>()
        data.forEach(track => {
          if (!seenIds.has(track.id)) {
            seenIds.add(track.id)
            unique.push(track)
          }
        })
        setTracks(unique.slice(0, limit))
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false))
  }, [limit])

  return { tracks, loading }
} 