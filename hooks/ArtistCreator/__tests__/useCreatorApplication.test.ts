// hooks/ArtistCreator/__tests__/useCreatorApplication.test.ts

import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useCreatorApplication } from "../useCreatorApplication";
import { createArtist, getArtistBySpotifyUserId } from "@/lib/supabase";

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
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
jest.mock("@/lib/supabase", () => ({
  createArtist: jest.fn(),
  getArtistBySpotifyUserId: jest.fn(),
}));

describe("useCreatorApplication", () => {
  const mockArtist = {
    id: "artist-123",
    name: "Test Artist",
    bio: "Test bio",
    image_url: "https://example.com/image.jpg",
    status: "pending",
    created_at: "2024-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.multiSet as jest.Mock).mockReset();
    (Alert.alert as jest.Mock).mockReset();
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockReset();
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockReset();
    (createArtist as jest.Mock).mockReset();
    (getArtistBySpotifyUserId as jest.Mock).mockReset();
  });

  describe("Initial state", () => {
    it("should initialize with empty values", () => {
      const { result } = renderHook(() => useCreatorApplication());

      expect(result.current.state.stageName).toBe("");
      expect(result.current.state.photoUri).toBeNull();
      expect(result.current.state.bio).toBe("");
      expect(result.current.state.loading).toBe(false);
    });

    it("should provide all actions", () => {
      const { result } = renderHook(() => useCreatorApplication());

      expect(result.current.actions.setStageName).toBeDefined();
      expect(result.current.actions.pickImage).toBeDefined();
      expect(result.current.actions.setBio).toBeDefined();
      expect(result.current.actions.submit).toBeDefined();
    });
  });

  describe("State updates", () => {
    it("should update stage name", () => {
      const { result } = renderHook(() => useCreatorApplication());

      act(() => {
        result.current.actions.setStageName("New Artist Name");
      });

      expect(result.current.state.stageName).toBe("New Artist Name");
    });

    it("should update bio", () => {
      const { result } = renderHook(() => useCreatorApplication());

      act(() => {
        result.current.actions.setBio("My artist bio");
      });

      expect(result.current.state.bio).toBe("My artist bio");
    });
  });

  describe("Image picker", () => {
    it("should pick image successfully when permission granted", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://image.jpg" }],
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      expect(result.current.state.photoUri).toBe("file://image.jpg");
    });

    it("should show alert when permission denied", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: false,
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Autorisation refusée",
        expect.any(String),
      );
      expect(result.current.state.photoUri).toBeNull();
    });

    it("should not update photoUri when image picker is canceled", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      expect(result.current.state.photoUri).toBeNull();
    });

    it("should handle missing assets array", async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: undefined,
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      expect(result.current.state.photoUri).toBeNull();
    });
  });

  describe("Form validation", () => {
    it("should show alert when submitting incomplete form (missing all)", async () => {
      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Formulaire incomplet",
        expect.stringContaining("Ajoute une photo"),
      );
    });

    it("should show alert when missing photo", async () => {
      const { result } = renderHook(() => useCreatorApplication());

      act(() => {
        result.current.actions.setStageName("Artist Name");
        result.current.actions.setBio("Bio text");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Formulaire incomplet",
        expect.any(String),
      );
    });

    it("should show alert when missing stage name", async () => {
      const { result } = renderHook(() => useCreatorApplication());

      // Setup image picker
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://image.jpg" }],
      });

      await act(async () => {
        await result.current.actions.pickImage();
      });

      act(() => {
        result.current.actions.setBio("Bio text");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Formulaire incomplet",
        expect.any(String),
      );
    });

    it("should trim whitespace from stage name and bio", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(null);
      (createArtist as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      // Setup image
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://image.jpg" }],
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      act(() => {
        result.current.actions.setStageName("  Artist Name  ");
        result.current.actions.setBio("  Bio text  ");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(createArtist).toHaveBeenCalledWith(
        "Artist Name",
        "Bio text",
        "file://image.jpg",
        "spotify-token",
      );
    });
  });

  describe("Submit - New artist creation", () => {
    it("should create new artist successfully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(null);
      (createArtist as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://image.jpg" }],
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      act(() => {
        result.current.actions.setStageName("Test Artist");
        result.current.actions.setBio("Test bio");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(createArtist).toHaveBeenCalledWith(
        "Test Artist",
        "Test bio",
        "file://image.jpg",
        "spotify-token",
      );

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ["user_is_creator", "true"],
        ["creator_artist_id", "artist-123"],
        [
          "creator_profile",
          JSON.stringify({
            stageName: "Test Artist",
            bio: "Test bio",
            photoUri: "file://image.jpg",
            status: "pending",
            artistId: "artist-123",
          }),
        ],
      ]);

      expect(Alert.alert).toHaveBeenCalledWith(
        "Créateur enregistré",
        expect.any(String),
      );
    });

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
        assets: [{ uri: "file://image.jpg" }],
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      act(() => {
        result.current.actions.setStageName("Test Artist");
        result.current.actions.setBio("Test bio");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Authentification requise",
        expect.stringContaining("Spotify"),
      );
      expect(createArtist).not.toHaveBeenCalled();
    });

    it("should handle createArtist errors", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(null);
      (createArtist as jest.Mock).mockRejectedValue(new Error("Network error"));

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://image.jpg" }],
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      act(() => {
        result.current.actions.setStageName("Test Artist");
        result.current.actions.setBio("Test bio");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Échec", "Network error");
      });

      expect(result.current.state.loading).toBe(false);
    });
  });

  describe("Submit - Existing artist", () => {
    it("should redirect to creator home when artist already exists", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(mockArtist);
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://image.jpg" }],
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      act(() => {
        result.current.actions.setStageName("Test Artist");
        result.current.actions.setBio("Test bio");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      // Should NOT create a new artist
      expect(createArtist).not.toHaveBeenCalled();

      // Should store existing artist info
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ["user_is_creator", "true"],
        ["creator_artist_id", "artist-123"],
        [
          "creator_profile",
          JSON.stringify({
            stageName: "Test Artist",
            bio: "Test bio",
            photoUri: "https://example.com/image.jpg",
            status: "pending",
            artistId: "artist-123",
          }),
        ],
      ]);

      // Form should be reset
      await waitFor(() => {
        expect(result.current.state.stageName).toBe("");
        expect(result.current.state.photoUri).toBeNull();
        expect(result.current.state.bio).toBe("");
      });
    });
  });

  describe("Loading state", () => {
    it("should set loading to true during submission", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockResolvedValue(null);
      (createArtist as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockArtist), 100)),
      );
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://image.jpg" }],
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      act(() => {
        result.current.actions.setStageName("Test Artist");
        result.current.actions.setBio("Test bio");
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

    it("should set loading to false after error", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("spotify-token");
      (getArtistBySpotifyUserId as jest.Mock).mockRejectedValue(
        new Error("Test error"),
      );

      // Setup complete form
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file://image.jpg" }],
      });

      const { result } = renderHook(() => useCreatorApplication());

      await act(async () => {
        await result.current.actions.pickImage();
      });

      act(() => {
        result.current.actions.setStageName("Test Artist");
        result.current.actions.setBio("Test bio");
      });

      await act(async () => {
        await result.current.actions.submit();
      });

      expect(result.current.state.loading).toBe(false);
    });
  });
});
