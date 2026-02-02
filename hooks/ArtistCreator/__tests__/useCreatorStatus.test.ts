// hooks/ArtistCreator/__tests__/useCreatorStatus.test.ts

import { renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCreatorStatus } from "../useCreatorStatus";
import { getArtistBySpotifyUserId } from "@/lib/supabase";

// Mock des dépendances
jest.mock("@react-native-async-storage/async-storage");
jest.mock("@/lib/supabase", () => ({
  getArtistBySpotifyUserId: jest.fn(),
}));

describe("useCreatorStatus", () => {
  const mockArtist = {
    id: "artist-123",
    name: "Test Artist",
    bio: "Test bio",
    image_url: "https://example.com/image.jpg",
    status: "validated",
    created_at: "2024-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.multiSet as jest.Mock).mockReset();
    (AsyncStorage.multiRemove as jest.Mock).mockReset();
    (getArtistBySpotifyUserId as jest.Mock).mockReset();
  });

  describe("Initial loading", () => {
    it("should start with loading true", () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves to keep loading
      );

      const { result } = renderHook(() => useCreatorStatus());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isCreator).toBe(false);
      expect(result.current.artistId).toBeNull();
    });
  });

  describe("User is creator", () => {
    it("should set isCreator to true when artist exists", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(true);
      expect(result.current.artistId).toBe("artist-123");
      expect(getArtistBySpotifyUserId).toHaveBeenCalledWith("spotify-token");
    });

    it("should update AsyncStorage with artist info", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ["user_is_creator", "true"],
        ["creator_artist_id", "artist-123"],
        [
          "creator_profile",
          JSON.stringify({
            stageName: "Test Artist",
            bio: "Test bio",
            photoUri: "https://example.com/image.jpg",
            status: "validated",
            artistId: "artist-123",
          }),
        ],
      ]);
    });

    it("should handle different artist statuses", async () => {
      const pendingArtist = { ...mockArtist, status: "pending" };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(pendingArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(true);
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.arrayContaining([
            "creator_profile",
            expect.stringContaining('"status":"pending"'),
          ]),
        ]),
      );
    });
  });

  describe("User is not creator", () => {
    it("should set isCreator to false when no Spotify token", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(false);
      expect(result.current.artistId).toBeNull();
      expect(getArtistBySpotifyUserId).not.toHaveBeenCalled();
    });

    it("should clean AsyncStorage when no Spotify token", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "user_is_creator",
        "creator_artist_id",
        "creator_profile",
      ]);
    });

    it("should set isCreator to false when artist not found", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(false);
      expect(result.current.artistId).toBeNull();
    });

    it("should clean AsyncStorage when artist not found", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "user_is_creator",
        "creator_artist_id",
        "creator_profile",
      ]);
    });
  });

  describe("Error handling", () => {
    it("should handle errors and clean AsyncStorage", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(false);
      expect(result.current.artistId).toBeNull();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "user_is_creator",
        "creator_artist_id",
        "creator_profile",
      ]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[useCreatorStatus]"),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle AsyncStorage errors gracefully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("AsyncStorage error"),
      );
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(false);
      expect(result.current.artistId).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it("should ignore errors during AsyncStorage cleanup", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );
      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(
        new Error("Cleanup error"),
      );

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still complete without crashing
      expect(result.current.isCreator).toBe(false);
      expect(result.current.artistId).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Refresh functionality", () => {
    it("should provide a refresh function", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.refresh).toBeDefined();
      expect(typeof result.current.refresh).toBe("function");
    });

    it("should reload status when refresh is called", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(false);

      // Change mock to return artist
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      // Call refresh
      await result.current.refresh();

      await waitFor(() => {
        expect(result.current.isCreator).toBe(true);
      });

      expect(result.current.artistId).toBe("artist-123");
    });

    it("should set loading during refresh", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Vérifier l'état initial après chargement
      expect(result.current.isCreator).toBe(true);
      const initialCallCount = (getArtistBySpotifyUserId as jest.Mock).mock
        .calls.length;

      // Trigger refresh
      await result.current.refresh();

      // Vérifier que refresh a bien été appelé
      expect(getArtistBySpotifyUserId).toHaveBeenCalledTimes(
        initialCallCount + 1,
      );

      // État final
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("State transitions", () => {
    it("should transition from loading to loaded (creator)", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      // Initial state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isCreator).toBe(false);

      // Final state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(true);
      expect(result.current.artistId).toBe("artist-123");
    });

    it("should transition from loading to loaded (not creator)", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      // Initial state
      expect(result.current.isLoading).toBe(true);

      // Final state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(false);
      expect(result.current.artistId).toBeNull();
    });

    it("should transition from loading to error state", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockRejectedValue(
        new Error("Error"),
      );
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useCreatorStatus());

      // Initial state
      expect(result.current.isLoading).toBe(true);

      // Final state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(false);
      expect(result.current.artistId).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Edge cases", () => {
    it("should handle artist with null image_url", async () => {
      const artistNoImage = { ...mockArtist, image_url: null };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(artistNoImage);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(true);
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.arrayContaining([
            "creator_profile",
            expect.stringContaining('"photoUri":null'),
          ]),
        ]),
      );
    });

    it("should handle artist with null bio", async () => {
      const artistNoBio = { ...mockArtist, bio: null };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(artistNoBio);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatorStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreator).toBe(true);
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.arrayContaining([
            "creator_profile",
            expect.stringContaining('"bio":null'),
          ]),
        ]),
      );
    });
  });
});
