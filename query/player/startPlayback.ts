import { remote } from "react-native-spotify-remote";
import { ensureSpotifyRemoteSession } from "@/lib/spotify/remoteSession";

type StartPlaybackOptions = {
  contextUri?: string;
  uris?: string[];
  offsetPosition?: number;
};

const skipToOffset = async (offset: number) => {
  for (let i = 0; i < offset; i += 1) {
    await remote.skipToNext();
  }
};

export const startPlayback = async ({
  contextUri,
  uris,
  offsetPosition,
}: StartPlaybackOptions): Promise<void> => {
  await ensureSpotifyRemoteSession();

  if (contextUri) {
    await remote.playUri(contextUri);
    if (typeof offsetPosition === "number" && offsetPosition > 0) {
      await skipToOffset(offsetPosition);
    }
    return;
  }

  if (uris && uris.length > 0) {
    await remote.playUri(uris[0]);
    return;
  }

  throw new Error(
    "startPlayback nécessite un contextUri ou une liste d'URIs à jouer."
  );
};
