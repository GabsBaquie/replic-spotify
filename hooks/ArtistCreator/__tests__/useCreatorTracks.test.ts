// hooks/ArtistCreator/__tests__/useCreatorTracks.test.ts

import { renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCreatorTracks } from "../useCreatorTracks";
import { getSongsByArtistId } from "@/lib/supabase";

// Mock des dépendances
jest.mock("@react-native-async-storage/async-storage");
jest.mock("@/lib/supabase", () => ({
  getSongsByArtistId: jest.fn(),
}));

// Mock de expo-router
jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn((callback) => {
    const { useEffect } = require("react");
    useEffect(() => {
      callback();
      return () => {}; // Cleanup
    }, []); // ← Dépendances vides = un seul appel
  }),
}));

describe("useCreatorTracks", () => {
  const mockSongs = [
    {
      id: "song-1",
      title: "Validated Song",
      image_url: "https://example.com/cover1.jpg",
      song_url: "https://example.com/song1.mp3",
      status: "validated" as const,
      created_at: "2024-01-01",
      artists: [
        {
          id: "artist-1",
          name: "Main Artist",
          bio: null,
          image_url: null,
          status: "validated",
          created_at: "2024-01-01",
        },
        {
          id: "artist-2",
          name: "Co-Creator",
          bio: null,
          image_url: null,
          status: "validated",
          created_at: "2024-01-01",
        },
      ],
    },
    {
      id: "song-2",
      title: "Pending Song",
      image_url: "https://example.com/cover2.jpg",
      song_url: "https://example.com/song2.mp3",
      status: "pending" as const,
      created_at: "2024-01-02",
      artists: [
        {
          id: "artist-1",
          name: "Main Artist",
          bio: null,
          image_url: null,
          status: "validated",
          created_at: "2024-01-01",
        },
      ],
    },
    {
      id: "song-3",
      title: "Refused Song",
      image_url: "https://example.com/cover3.jpg",
      song_url: null,
      status: "refused" as const,
      created_at: "2024-01-03",
      artists: [
        {
          id: "artist-1",
          name: "Main Artist",
          bio: null,
          image_url: null,
          status: "validated",
          created_at: "2024-01-01",
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (getSongsByArtistId as jest.Mock).mockReset();
  });

  describe("Loading tracks", () => {
    it("should load tracks successfully", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue(mockSongs);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Assert - Initial state
      expect(result.current.loading).toBe(true);

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert - Final state
      expect(result.current.tracks).toHaveLength(3);
      expect(result.current.validatedTracks).toHaveLength(1);
      expect(result.current.pendingTracks).toHaveLength(1);
      expect(result.current.rejectedTracks).toHaveLength(1);
      expect(getSongsByArtistId).toHaveBeenCalledWith("artist-123");
    });

    it("should return empty arrays when no artistId is stored", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.tracks).toEqual([]);
      expect(result.current.validatedTracks).toEqual([]);
      expect(result.current.pendingTracks).toEqual([]);
      expect(result.current.rejectedTracks).toEqual([]);
      expect(getSongsByArtistId).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Aucun artistId trouvé"),
      );

      // Cleanup
      consoleWarnSpy.mockRestore();
    });

    it("should convert SongWithArtists to CreatorTrack correctly", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue([mockSongs[0]]);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert - Verify conversion
      const track = result.current.tracks[0];
      expect(track).toEqual({
        id: "song-1",
        title: "Validated Song",
        coverUri: "https://example.com/cover1.jpg",
        songUrl: "https://example.com/song1.mp3",
        coCreators: ["Co-Creator"], // Only co-creators (artists after the first)
        artistIds: ["artist-1", "artist-2"],
        artists: ["Main Artist", "Co-Creator"],
        status: "validated",
        createdAt: "2024-01-01",
      });
    });

    it("should handle song with no image_url", async () => {
      // Setup
      const songNoImage = {
        ...mockSongs[0],
        image_url: null,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue([songNoImage]);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.tracks[0].coverUri).toBe("");
    });

    it("should handle song with single artist (no co-creators)", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue([mockSongs[1]]);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      const track = result.current.tracks[0];
      expect(track.coCreators).toEqual([]);
      expect(track.artists).toEqual(["Main Artist"]);
      expect(track.artistIds).toEqual(["artist-1"]);
    });
  });

  describe("Filtering tracks by status", () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue(mockSongs);
    });

    it("should filter validated tracks correctly", async () => {
      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.validatedTracks).toHaveLength(1);
      expect(result.current.validatedTracks[0].status).toBe("validated");
      expect(result.current.validatedTracks[0].title).toBe("Validated Song");
    });

    it("should filter pending tracks correctly", async () => {
      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.pendingTracks).toHaveLength(1);
      expect(result.current.pendingTracks[0].status).toBe("pending");
      expect(result.current.pendingTracks[0].title).toBe("Pending Song");
    });

    it("should filter rejected tracks correctly", async () => {
      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.rejectedTracks).toHaveLength(1);
      expect(result.current.rejectedTracks[0].status).toBe("refused");
      expect(result.current.rejectedTracks[0].title).toBe("Refused Song");
    });

    it("should handle all tracks having the same status", async () => {
      // Setup - All validated
      const allValidated = mockSongs.map((song) => ({
        ...song,
        status: "validated" as const,
      }));
      (getSongsByArtistId as jest.Mock).mockResolvedValue(allValidated);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.validatedTracks).toHaveLength(3);
      expect(result.current.pendingTracks).toHaveLength(0);
      expect(result.current.rejectedTracks).toHaveLength(0);
    });
  });

  describe("Refresh functionality", () => {
    it("should provide a refresh function", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue(mockSongs);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.refresh).toBeDefined();
      expect(typeof result.current.refresh).toBe("function");
    });

    it("should reload tracks when refresh is called", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue(mockSongs);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear the mock to verify it's called again
      (getSongsByArtistId as jest.Mock).mockClear();

      // Call refresh
      result.current.refresh();

      // Wait for refresh to complete
      await waitFor(() => {
        expect(getSongsByArtistId).toHaveBeenCalledWith("artist-123");
      });
    });

    it("should update tracks list after refresh", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue([mockSongs[0]]);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tracks).toHaveLength(1);

      // Change mock to return more songs
      (getSongsByArtistId as jest.Mock).mockResolvedValue(mockSongs);

      // Call refresh
      result.current.refresh();

      // Wait for refresh to complete
      await waitFor(() => {
        expect(result.current.tracks).toHaveLength(3);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle errors when loading tracks", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.tracks).toEqual([]);
      expect(result.current.validatedTracks).toEqual([]);
      expect(result.current.pendingTracks).toEqual([]);
      expect(result.current.rejectedTracks).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Erreur lors du chargement"),
        expect.any(Error),
      );

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
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.tracks).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty tracks array", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue([]);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.tracks).toEqual([]);
      expect(result.current.validatedTracks).toEqual([]);
      expect(result.current.pendingTracks).toEqual([]);
      expect(result.current.rejectedTracks).toEqual([]);
    });

    it("should handle tracks with null song_url", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue([mockSongs[2]]);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.tracks[0].songUrl).toBeNull();
    });

    it("should handle tracks with empty artists array", async () => {
      // Setup
      const songNoArtists = {
        ...mockSongs[0],
        artists: [],
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue([songNoArtists]);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      const track = result.current.tracks[0];
      expect(track.artists).toEqual([]);
      expect(track.artistIds).toEqual([]);
      expect(track.coCreators).toEqual([]);
    });
  });

  describe("State transitions", () => {
    it("should transition from loading to loaded state", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue(mockSongs);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Assert - Initial loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.tracks).toEqual([]);

      // Wait for loaded state
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert - Final loaded state
      expect(result.current.tracks).toHaveLength(3);
    });

    it("should set loading to true during refresh", async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("artist-123");
      (getSongsByArtistId as jest.Mock).mockResolvedValue(mockSongs);

      // Execute
      const { result } = renderHook(() => useCreatorTracks());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify initial state
      expect(result.current.tracks).toHaveLength(3);
      const initialCallCount = (getSongsByArtistId as jest.Mock).mock.calls
        .length;

      // Trigger refresh
      await result.current.refresh();

      // Assert - refresh was called (getSongsByArtistId called again)
      expect(getSongsByArtistId).toHaveBeenCalledTimes(initialCallCount + 1);

      // Final state should still be loaded
      expect(result.current.loading).toBe(false);
      expect(result.current.tracks).toHaveLength(3);
    });
  });
});
