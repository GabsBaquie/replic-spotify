// hooks/ArtistCreator/__tests__/useCreatorProfile.test.ts

import { renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCreatorProfile } from "../useCreatorProfile";
import { getArtistById } from "@/lib/supabase";

// Mock des dépendances
jest.mock("@react-native-async-storage/async-storage");
jest.mock("@/lib/supabase", () => ({
  getArtistById: jest.fn(),
}));

describe("useCreatorProfile", () => {
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
    // Reset AsyncStorage mock
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
    // Reset getArtistById mock
    (getArtistById as jest.Mock).mockReset();
  });

  describe("Loading artist profile", () => {
    it("should load artist profile successfully with artistId in AsyncStorage", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve("artist-123");
        if (key === "spotify_access_token")
          return Promise.resolve("spotify-token");
        return Promise.resolve(null);
      });
      (getArtistById as jest.Mock).mockResolvedValue(mockArtist);

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Assert - Initial state
      expect(result.current.loading).toBe(true);
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBeNull();

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert - Final state
      expect(result.current.artist).toEqual(mockArtist);
      expect(result.current.error).toBeNull();
      expect(getArtistById).toHaveBeenCalledWith("artist-123", "spotify-token");
    });

    it("should load artist profile without Spotify token", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve("artist-123");
        return Promise.resolve(null); // No spotify token
      });
      (getArtistById as jest.Mock).mockResolvedValue(mockArtist);

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toEqual(mockArtist);
      expect(getArtistById).toHaveBeenCalledWith("artist-123", undefined);
    });

    it("should return null when no artistId is stored", async () => {
      // Setup - No artistId and no old profile
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBeNull();
      expect(getArtistById).not.toHaveBeenCalled();
    });

    it("should fallback to old profile format if artistId not found", async () => {
      // Setup - Old profile format with artistId
      const oldProfile = JSON.stringify({
        stageName: "Old Artist",
        bio: "Old bio",
        photoUri: null,
        artistId: "old-artist-123",
      });

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve(null);
        if (key === "creator_profile") return Promise.resolve(oldProfile);
        return Promise.resolve(null);
      });
      (getArtistById as jest.Mock).mockResolvedValue(mockArtist);

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toEqual(mockArtist);
      expect(getArtistById).toHaveBeenCalledWith("old-artist-123", undefined);
    });

    it("should handle fallback when old profile has no artistId", async () => {
      // Setup
      const oldProfileNoArtistId = JSON.stringify({
        stageName: "Artist",
        bio: "Bio",
        photoUri: null,
      });

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve(null);
        if (key === "creator_profile")
          return Promise.resolve(oldProfileNoArtistId);
        return Promise.resolve(null);
      });

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toBeNull();
      expect(getArtistById).not.toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should handle errors when loading artist profile", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve("artist-123");
        return Promise.resolve(null);
      });
      (getArtistById as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      // Spy on console.error to avoid cluttering test output
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBe("Network error");
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it("should handle RLS permission errors with helpful message", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve("artist-123");
        return Promise.resolve(null);
      });
      (getArtistById as jest.Mock).mockRejectedValue(
        new Error("Invalid API key"),
      );

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBe("Invalid API key");

      // Verify that the RLS help message was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("PROBLÈME RLS DÉTECTÉ"),
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it("should handle generic errors without specific message", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve("artist-123");
        return Promise.resolve(null);
      });
      (getArtistById as jest.Mock).mockRejectedValue({ code: "UNKNOWN" });

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBe("Erreur lors du chargement du profil");

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it("should handle AsyncStorage errors", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("AsyncStorage error"),
      );

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBe("AsyncStorage error");

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Edge cases", () => {
    it("should handle malformed JSON in old profile", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve(null);
        if (key === "creator_profile") return Promise.resolve("invalid-json{");
        return Promise.resolve(null);
      });

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBeTruthy();

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it("should handle getArtistById returning null in fallback", async () => {
      // Setup
      const oldProfile = JSON.stringify({
        stageName: "Artist",
        bio: "Bio",
        photoUri: null,
        artistId: "artist-123",
      });

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve(null);
        if (key === "creator_profile") return Promise.resolve(oldProfile);
        return Promise.resolve(null);
      });
      (getArtistById as jest.Mock).mockResolvedValue(null);

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe("State transitions", () => {
    it("should transition from loading to loaded state", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve("artist-123");
        return Promise.resolve(null);
      });
      (getArtistById as jest.Mock).mockResolvedValue(mockArtist);

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Assert - Initial loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBeNull();

      // Wait for loaded state
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert - Final loaded state
      expect(result.current.artist).toEqual(mockArtist);
      expect(result.current.error).toBeNull();
    });

    it("should transition from loading to error state", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "creator_artist_id") return Promise.resolve("artist-123");
        return Promise.resolve(null);
      });
      (getArtistById as jest.Mock).mockRejectedValue(new Error("Failed"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Execute
      const { result } = renderHook(() => useCreatorProfile());

      // Assert - Initial loading state
      expect(result.current.loading).toBe(true);

      // Wait for error state
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert - Final error state
      expect(result.current.artist).toBeNull();
      expect(result.current.error).toBe("Failed");

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });
});
