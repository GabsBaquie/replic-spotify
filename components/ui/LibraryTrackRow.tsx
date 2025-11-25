import { ReactNode } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { Box, Text } from "@/components/restyle";

type LibraryTrackRowProps = {
  title: string;
  subtitle?: string;
  imageUri?: string;
  fallbackColor?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  isActive?: boolean;
  leftAccessory?: ReactNode;
};

export const LibraryTrackRow = ({
  title,
  subtitle,
  imageUri,
  fallbackColor = "#262626",
  onPress,
  rightElement,
  isActive,
  leftAccessory,
}: LibraryTrackRowProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={styles.row}>
        {leftAccessory ? (
          <Box style={styles.accessory}>{leftAccessory}</Box>
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.cover} />
        ) : (
          <Box style={[styles.cover, { backgroundColor: fallbackColor }]} />
        )}
        <Box style={styles.info}>
          <Text
            style={[styles.title, isActive && styles.titleActive]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={styles.subtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {rightElement ? (
          <Box style={styles.rightSlot}>{rightElement}</Box>
        ) : null}
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  accessory: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  titleActive: {
    color: "#1DB954",
  },
  subtitle: {
    color: "#b3b3b3",
    marginTop: 2,
  },
  rightSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
});
