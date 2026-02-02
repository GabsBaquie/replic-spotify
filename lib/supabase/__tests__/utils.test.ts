// lib/supabase/__tests__/utils.test.ts

import {
  sanitizeFileName,
  generateUniqueImageName,
  toStoragePath,
  getStoragePath,
  mapSongRows,
} from "../utils";

describe("lib/supabase/utils", () => {
  const MOCK_TIMESTAMP = 1704067200000;
  const MOCK_RANDOM = 0.123456789;

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(MOCK_TIMESTAMP);
    jest.spyOn(Math, "random").mockReturnValue(MOCK_RANDOM);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("sanitizeFileName", () => {
    it("should sanitize filename with spaces and add timestamp", () => {
      const result = sanitizeFileName("My Song Title");
      expect(result).toContain("My_Song_Title");
      expect(result).toContain(`_${MOCK_TIMESTAMP}`);
      expect(result).toMatch(/\.mp3$/);
    });

    it("should remove special characters and keep valid ones", () => {
      expect(sanitizeFileName("Song@#$%Title")).toContain("SongTitle");
      expect(sanitizeFileName("Song-Name_123")).toContain("Song-Name_123");
    });

    it("should trim and collapse spaces", () => {
      expect(sanitizeFileName("  My   Song  ")).toContain("My_Song");
    });

    it("should truncate long titles to 100 chars", () => {
      const longTitle = "a".repeat(150);
      const result = sanitizeFileName(longTitle);
      const baseName = result.split("_" + MOCK_TIMESTAMP)[0];
      expect(baseName.length).toBeLessThanOrEqual(100);
    });

    it("should use default name for invalid input", () => {
      expect(sanitizeFileName("")).toBe(
        `song_${MOCK_TIMESTAMP}_${MOCK_TIMESTAMP}.mp3`,
      );
      expect(sanitizeFileName("   ")).toBe(
        `song_${MOCK_TIMESTAMP}_${MOCK_TIMESTAMP}.mp3`,
      );
      expect(sanitizeFileName("!@#$%")).toBe(
        `song_${MOCK_TIMESTAMP}_${MOCK_TIMESTAMP}.mp3`,
      );
    });

    it("should handle custom extensions", () => {
      expect(sanitizeFileName("song", "wav")).toMatch(/\.wav$/);
    });

    it("should not duplicate extension", () => {
      const result = sanitizeFileName("song.mp3", "mp3");
      expect(result.match(/\.mp3/gi)?.length).toBe(1);
    });
  });

  describe("generateUniqueImageName", () => {
    const expectedRandom = MOCK_RANDOM.toString(36).substring(2, 9);

    it("should generate unique name with prefix", () => {
      expect(generateUniqueImageName("cover")).toBe(
        `cover_${MOCK_TIMESTAMP}_${expectedRandom}.jpg`,
      );
    });

    it("should use custom extension", () => {
      expect(generateUniqueImageName("avatar", undefined, "png")).toMatch(
        /\.png$/,
      );
    });

    it("should extract and clean original filename", () => {
      expect(generateUniqueImageName("cover", "my-photo.jpg")).toContain(
        "my-photo",
      );
    });

    it("should remove extension from original name", () => {
      const result = generateUniqueImageName("cover", "photo.png");
      expect(result).toContain("photo");
      expect(result).not.toContain(".png.jpg");
    });

    it("should truncate long original names", () => {
      const longName = "a".repeat(100) + ".jpg";
      const result = generateUniqueImageName("cover", longName);
      expect(result.split("_" + MOCK_TIMESTAMP)[0].length).toBeLessThanOrEqual(
        50,
      );
    });

    it("should fallback to prefix for invalid original name", () => {
      expect(generateUniqueImageName("avatar", "!@#$.jpg")).toContain("avatar");
    });
  });

  describe("toStoragePath", () => {
    it("should combine prefix and filename", () => {
      expect(toStoragePath("tracks", "song.mp3")).toBe("tracks/song.mp3");
    });

    it("should generate filename if not provided", () => {
      expect(toStoragePath("tracks", "")).toMatch(/^tracks\/\d+-[a-z0-9]+$/);
      expect(toStoragePath("tracks", null as any)).toMatch(
        /^tracks\/\d+-[a-z0-9]+$/,
      );
    });
  });

  describe("getStoragePath", () => {
    it("should return null for null input", () => {
      expect(getStoragePath(null)).toBeNull();
    });

    it("should return URLs unchanged", () => {
      expect(getStoragePath("http://example.com/song.mp3")).toBe(
        "http://example.com/song.mp3",
      );
      expect(getStoragePath("https://example.com/song.mp3")).toBe(
        "https://example.com/song.mp3",
      );
    });

    it("should not modify tracks/tracks/ paths", () => {
      expect(getStoragePath("tracks/tracks/song.mp3")).toBe(
        "tracks/tracks/song.mp3",
      );
    });

    it("should add prefix to tracks/ paths", () => {
      expect(getStoragePath("tracks/song.mp3")).toBe("tracks/tracks/song.mp3");
    });

    it("should add double prefix to plain filenames", () => {
      expect(getStoragePath("song.mp3")).toBe("tracks/tracks/song.mp3");
    });
  });

  describe("mapSongRows", () => {
    const mockArtist1 = {
      id: "artist-1",
      name: "Artist 1",
      bio: null,
      image_url: null,
      status: "validated" as const,
      created_at: "2024-01-01",
    };

    const mockArtist2 = {
      id: "artist-2",
      name: "Artist 2",
      bio: null,
      image_url: null,
      status: "pending" as const,
      created_at: "2024-01-02",
    };

    const mockArtist3 = {
      id: "artist-3",
      name: "Artist 3",
      bio: null,
      image_url: null,
      status: "validated" as const,
      created_at: "2024-01-03",
    };

    it("should map rows with artists", () => {
      const rows = [
        {
          id: "song-1",
          songs_artists: [{ artist: mockArtist1 }, { artist: mockArtist2 }],
        },
      ];

      const result = mapSongRows(rows);
      expect(result[0].artists).toHaveLength(2);
      expect(result[0].artists[0]).toEqual(mockArtist1);
    });

    it("should preserve song properties", () => {
      const rows = [
        {
          id: "song-1",
          title: "Song 1",
          image_url: "cover.jpg",
          songs_artists: [{ artist: mockArtist1 }],
        },
      ];

      const result = mapSongRows(rows);
      expect(result[0].id).toBe("song-1");
      expect(result[0].title).toBe("Song 1");
    });

    it("should filter only validated artists", () => {
      const rows = [
        {
          id: "song-1",
          songs_artists: [
            { artist: mockArtist1 }, // validated
            { artist: mockArtist2 }, // pending
            { artist: mockArtist3 }, // validated
          ],
        },
      ];

      const result = mapSongRows(rows, { onlyValidatedArtists: true });
      expect(result[0].artists).toHaveLength(2);
      expect(
        result[0].artists.every((a: any) => a.status === "validated"),
      ).toBe(true);
    });

    it("should include all artists without filter", () => {
      const rows = [
        {
          id: "song-1",
          songs_artists: [{ artist: mockArtist1 }, { artist: mockArtist2 }],
        },
      ];

      expect(mapSongRows(rows)[0].artists).toHaveLength(2);
    });

    it("should handle artist as array", () => {
      const rows = [
        {
          id: "song-1",
          songs_artists: [{ artist: [mockArtist1] }],
        },
      ];

      expect(mapSongRows(rows)[0].artists[0]).toEqual(mockArtist1);
    });

    it("should filter out null and undefined artists", () => {
      const rows = [
        {
          id: "song-1",
          songs_artists: [
            { artist: mockArtist1 },
            { artist: null },
            { artist: undefined },
            { artist: mockArtist2 },
          ],
        },
      ];

      expect(mapSongRows(rows)[0].artists).toHaveLength(2);
    });

    it("should handle empty/null/undefined songs_artists", () => {
      expect(
        mapSongRows([{ id: "song-1", songs_artists: [] }])[0].artists,
      ).toEqual([]);
      expect(
        mapSongRows([{ id: "song-1", songs_artists: null }])[0].artists,
      ).toEqual([]);
      expect(mapSongRows([{ id: "song-1" }])[0].artists).toEqual([]);
    });

    it("should handle empty rows", () => {
      expect(mapSongRows([])).toEqual([]);
    });

    it("should handle multiple rows", () => {
      const rows = [
        { id: "song-1", songs_artists: [{ artist: mockArtist1 }] },
        { id: "song-2", songs_artists: [{ artist: mockArtist2 }] },
      ];

      const result = mapSongRows(rows);
      expect(result).toHaveLength(2);
    });
  });
});
