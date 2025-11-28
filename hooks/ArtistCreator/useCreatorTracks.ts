import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

const CREATOR_TRACKS_KEY = "creator_tracks";

type CreatorTrack = {
  id: string;
  title: string;
  coverUri: string;
  coCreators: string[];
  status: "pending" | "validated" | "rejected";
  createdAt: number;
};

export const useCreatorTracks = () => {
  const [tracks, setTracks] = useState<CreatorTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTracks = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(CREATOR_TRACKS_KEY);
      const parsed: CreatorTrack[] = raw ? JSON.parse(raw) : [];
      setTracks(parsed);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTracks();
    }, [loadTracks])
  );

  const validatedTracks = tracks.filter(
    (track) => track.status === "validated"
  );
  const pendingTracks = tracks.filter((track) => track.status === "pending");
  const rejectedTracks = tracks.filter((track) => track.status === "rejected");

  return {
    loading,
    tracks,
    validatedTracks,
    pendingTracks,
    rejectedTracks,
    refresh: loadTracks,
  };
};

export type { CreatorTrack };
