import { useCallback, useEffect, useState } from "react";
import getProfile from "@/query/profile/getProfile";

type SpotifyImage = {
  url: string;
};

type SpotifyFollowers = {
  total: number;
};

export type Profile = {
  id: string;
  display_name: string;
  email: string;
  country?: string;
  images?: SpotifyImage[];
  followers?: SpotifyFollowers;
};

type UseProfileState = {
  profile: Profile | null;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
};

export const useProfile = (): UseProfileState => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const fetchProfile = useCallback(() => {
    setIsLoading(true);
    getProfile()
      .then((data) => {
        setProfile(data);
        setError(undefined);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
};
