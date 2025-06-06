import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocalDeviceId } from '@/query/player/getLocalDeviceId'
import { playSpotifyTrack } from '@/query/player/playSpotifyTrack'

const API_BASE = 'https://api.spotify.com/v1'

export type TrackInfo = {
  name: string
  artists: string[]
  albumArtUri: string | null
  uri: string
}

export type PlayerState = {
  playbackPosition: number
  trackDuration:    number
  isPaused:         boolean
  track:            TrackInfo
}

/**
 * Hook pour piloter et récupérer l’état du playback Spotify.
 */
export default function useSpotifyPlayer() {
  const [state, setState] = useState<PlayerState | null>(null)

  const fetchState = async () => {
    try {
      const token = await AsyncStorage.getItem('spotify_access_token')
      if (!token) throw new Error('Token Spotify manquant')

      const res = await fetch(`${API_BASE}/me/player`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if ([204, 404].includes(res.status)) {
          setState(null)
          return
        }
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `Erreur ${res.status}`)
      }

      const json = await res.json()
      const item = json.item as any
      setState({
        playbackPosition: json.progress_ms,
        trackDuration:    item.duration_ms,
        isPaused:         !json.is_playing,
        track: {
          name:        item.name,
          artists:     item.artists.map((a: any) => a.name),
          albumArtUri: item.album.images[0]?.url || null,
          uri:         item.uri,
        },
      })
    } catch {
      setState(null)
    }
  }

  useEffect(() => {
    fetchState()
    const id = setInterval(fetchState, 500)
    return () => clearInterval(id)
  }, [])

  const togglePlayPause = async () => {
    if (!state) return
    const token = await AsyncStorage.getItem('spotify_access_token')
    if (!token) throw new Error('Token Spotify manquant')
    const deviceId = await getLocalDeviceId()
    if (!deviceId) throw new Error('Aucun device Spotify trouvé')

    if (state.isPaused) {
      // relancer la lecture
      await playSpotifyTrack(state.track.uri.split(':').pop()!, deviceId)
    } else {
      // mettre en pause
      await fetch(`${API_BASE}/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
    }
    fetchState()
  }

  return { state, togglePlayPause }
}