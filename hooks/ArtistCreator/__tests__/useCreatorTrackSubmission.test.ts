// hooks/ArtistCreator/__tests__/useCreatorTrackSubmission.test.ts

import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useCreatorTrackSubmission } from "../useCreatorTrackSubmission";
import { createSong, getArtistBySpotifyUserId } from "@/lib/supabase";

// Mock des dépendances
jest.mock("@react-native-async-storage/async-storage");
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: "ios",
  },
}));
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: "Images",
    Videos: "Videos",
    All: "All",
  },
}));
jest.mock("expo-document-picker");
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
jest.mock("@/lib/supabase", () => ({
  createSong: jest.fn(),
  getArtistBySpotifyUserId: jest.fn(),
}));

describe("useCreatorTrackSubmission", () => {
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
    (Alert.alert as jest.Mock).mockReset();
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockReset();
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockReset();
    (DocumentPicker.getDocumentAsync as jest.Mock).mockReset();
    (createSong as jest.Mock).mockReset();
    (getArtistBySpotifyUserId as jest.Mock).mockReset();
  });

  describe("Initial state", () => {
    it("should initialize with empty values", () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      expect(result.current.state.title).toBe("");
      expect(result.current.state.coverUri).toBeNull();
      expect(result.current.state.audioUri).toBeNull();
      expect(result.current.state.audioFileName).toBeNull();
      expect(result.current.state.coCreators).toEqual([]);
      expect(result.current.state.coCreatorDraft).toBe("");
      expect(result.current.state.loading).toBe(false);
    });

    it("should provide all actions", () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      expect(result.current.actions.setTitle).toBeDefined();
      expect(result.current.actions.setCoCreatorDraft).toBeDefined();
      expect(result.current.actions.pickCover).toBeDefined();
      expect(result.current.actions.pickAudio).toBeDefined();
      expect(result.current.actions.handleAudioFile).toBeDefined();
      expect(result.current.actions.addCoCreator).toBeDefined();
      expect(result.current.actions.removeCoCreator).toBeDefined();
      expect(result.current.actions.submit).toBeDefined();
    });
  });

  describe("State updates", () => {
    it("should update title", () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      act(() => {
        result.current.actions.setTitle("New Track Title");
      });

      expect(result.current.state.title).toBe("New Track Title");
    });

    it("should update coCreatorDraft", () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      act(() => {
        result.current.actions.setCoCreatorDraft("Artist Name");
      });

      expect(result.current.state.coCreatorDraft).toBe("Artist Name");
    });
  });

  describe("Cover picker", () => {
    it("should pick cover successfully when permission granted", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
      });

      expect(result.current.state.coverUri).toBe("file://cover.jpg");
    });

    it("should show alert when permission denied", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: false,
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Accès requis",
        expect.any(String),
      );
      expect(result.current.state.coverUri).toBeNull();
    });

    it("should not update coverUri when picker is canceled", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
      });

      expect(result.current.state.coverUri).toBeNull();
    });
  });

  describe("Audio picker", () => {
    it("should pick audio successfully", async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file://audio.mp3",
            name: "my-song.mp3",
          },
        ],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickAudio();
      });

      expect(result.current.state.audioUri).toBe("file://audio.mp3");
      expect(result.current.state.audioFileName).toBe("my-song.mp3");
    });

    it("should not update audioUri when picker is canceled", async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickAudio();
      });

      expect(result.current.state.audioUri).toBeNull();
      expect(result.current.state.audioFileName).toBeNull();
    });

    it("should handle missing assets", async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: undefined,
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickAudio();
      });

      expect(result.current.state.audioUri).toBeNull();
    });

    it("should use default filename when name is missing", async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file://audio.mp3",
            name: null,
          },
        ],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickAudio();
      });

      expect(result.current.state.audioFileName).toBe("audio.mp3");
    });

    it("should handle errors during audio selection", async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockRejectedValue(
        new Error("Permission denied"),
      );

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickAudio();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Erreur",
        expect.stringContaining("Permission denied"),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Co-creators management", () => {
    it("should add co-creator", async () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 1");
      });

      await act(async () => {
        result.current.actions.addCoCreator();
      });

      expect(result.current.state.coCreators).toEqual(["Artist 1"]);
      expect(result.current.state.coCreatorDraft).toBe("");
    });

    it("should add multiple co-creators", async () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 1");
      });

      await act(async () => {
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 2");
      });

      await act(async () => {
        result.current.actions.addCoCreator();
      });

      expect(result.current.state.coCreators).toEqual(["Artist 1", "Artist 2"]);
    });

    it("should trim whitespace from co-creator name", async () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        result.current.actions.setCoCreatorDraft("  Artist Name  ");
      });

      await act(async () => {
        result.current.actions.addCoCreator();
      });

      expect(result.current.state.coCreators).toEqual(["Artist Name"]);
    });

    it("should not add empty co-creator", async () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        result.current.actions.setCoCreatorDraft("   ");
      });

      await act(async () => {
        result.current.actions.addCoCreator();
      });

      expect(result.current.state.coCreators).toEqual([]);
    });

    it("should remove co-creator by index", async () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 1");
      });
      await act(async () => {
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 2");
      });
      await act(async () => {
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 3");
      });
      await act(async () => {
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        result.current.actions.removeCoCreator(1); // Remove 'Artist 2'
      });

      expect(result.current.state.coCreators).toEqual(["Artist 1", "Artist 3"]);
    });

    it("should remove first co-creator", async () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 1");
      });
      await act(async () => {
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 2");
      });
      await act(async () => {
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        result.current.actions.removeCoCreator(0);
      });

      expect(result.current.state.coCreators).toEqual(["Artist 2"]);
    });

    it("should remove last co-creator", async () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 1");
      });
      await act(async () => {
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        result.current.actions.setCoCreatorDraft("Artist 2");
      });
      await act(async () => {
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        result.current.actions.removeCoCreator(1);
      });

      expect(result.current.state.coCreators).toEqual(["Artist 1"]);
    });
  });

  describe("Form validation", () => {
    it("should show alert when submitting incomplete form", async () => {
      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Formulaire incomplet",
        expect.stringContaining("titre"),
      );
    });

    it("should show alert when missing title", async () => {
      // Setup cover and audio
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://audio.mp3", name: "song.mp3" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
        await result.current.actions.pickAudio();
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Formulaire incomplet",
        expect.any(String),
      );
    });

    it("should trim whitespace from title", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (createSong as jest.Mock).mockResolvedValue({});

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://audio.mp3", name: "song.mp3" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
        await result.current.actions.pickAudio();
      });

      act(() => {
        result.current.actions.setTitle("  Track Title  ");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(createSong).toHaveBeenCalledWith(
        "Track Title",
        "file://cover.jpg",
        "file://audio.mp3",
        ["artist-123"],
        "spotify-token",
      );
    });
  });

  describe("Submit - Success", () => {
    it("should submit track successfully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (createSong as jest.Mock).mockResolvedValue({});

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://audio.mp3", name: "song.mp3" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
        await result.current.actions.pickAudio();
      });

      act(() => {
        result.current.actions.setTitle("My Track");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(createSong).toHaveBeenCalledWith(
        "My Track",
        "file://cover.jpg",
        "file://audio.mp3",
        ["artist-123"],
        "spotify-token",
      );

      expect(Alert.alert).toHaveBeenCalledWith(
        "Musique envoyée",
        expect.any(String),
        expect.any(Array),
      );
    });

    it("should reset form after successful submission", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (createSong as jest.Mock).mockResolvedValue({});

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://audio.mp3", name: "song.mp3" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
        await result.current.actions.pickAudio();
      });

      act(() => {
        result.current.actions.setTitle("My Track");
        result.current.actions.setCoCreatorDraft("Co-Creator");
        result.current.actions.addCoCreator();
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      // Form should be reset
      await waitFor(() => {
        expect(result.current.state.title).toBe("");
        expect(result.current.state.coverUri).toBeNull();
        expect(result.current.state.audioUri).toBeNull();
        expect(result.current.state.audioFileName).toBeNull();
        expect(result.current.state.coCreators).toEqual([]);
        expect(result.current.state.coCreatorDraft).toBe("");
      });
    });
  });

  describe("Submit - Errors", () => {
    it("should show alert when no Spotify token", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://audio.mp3", name: "song.mp3" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
        await result.current.actions.pickAudio();
      });

      act(() => {
        result.current.actions.setTitle("My Track");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Authentification requise",
        expect.stringContaining("Spotify"),
      );
      expect(createSong).not.toHaveBeenCalled();
    });

    it("should show alert when artist profile not found", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(null);

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://audio.mp3", name: "song.mp3" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
        await result.current.actions.pickAudio();
      });

      act(() => {
        result.current.actions.setTitle("My Track");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Profil artiste requis",
        expect.stringContaining("profil artiste"),
      );
      expect(createSong).not.toHaveBeenCalled();
    });

    it("should handle createSong errors", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (createSong as jest.Mock).mockRejectedValue(new Error("Upload failed"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://audio.mp3", name: "song.mp3" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
        await result.current.actions.pickAudio();
      });

      act(() => {
        result.current.actions.setTitle("My Track");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Échec",
          "Upload failed",
          expect.any(Array),
        );
      });

      expect(result.current.state.loading).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Loading state", () => {
    it("should set loading to true during submission", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (createSong as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 100)),
      );

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://cover.jpg" }],
      });
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://audio.mp3", name: "song.mp3" }],
      });

      const { result } = renderHook(() => useCreatorTrackSubmission());

      await act(async () => {
        await result.current.actions.pickCover();
        await result.current.actions.pickAudio();
      });

      act(() => {
        result.current.actions.setTitle("My Track");
      });

      // Start submission (don't await yet)
      act(() => {
        result.current.actions.submit();
      });

      // Check loading is true
      await waitFor(() => {
        expect(result.current.state.loading).toBe(true);
      });

      // Wait for completion
      await waitFor(
        () => {
          expect(result.current.state.loading).toBe(false);
        },
        { timeout: 3000 },
      );
    });
  });
});
