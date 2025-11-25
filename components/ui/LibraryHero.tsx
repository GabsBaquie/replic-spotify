import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Box, Text } from "@/components/restyle";

type LibraryHeroProps = {
  cover: ReactNode;
  title: string;
  subtitle?: string;
  metadata?: string[];
  actions?: ReactNode;
  rightSlot?: ReactNode;
};

export const LibraryHero = ({
  cover,
  title,
  subtitle,
  metadata,
  actions,
  rightSlot,
}: LibraryHeroProps) => {
  return (
    <>
      <Box style={styles.coverWrapper}>{cover}</Box>
      <Box style={styles.infoRow}>
        <Box flex={1}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {metadata?.length ? (
            <Text style={styles.metadata}>{metadata.join(" • ")}</Text>
          ) : null}
          {actions ? <Box style={styles.actions}>{actions}</Box> : null}
        </Box>
        {rightSlot ? <Box style={styles.rightSlot}>{rightSlot}</Box> : null}
      </Box>
    </>
  );
};

const styles = StyleSheet.create({
  coverWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    color: "#fff",
    opacity: 0.8,
    marginTop: 4,
  },
  metadata: {
    color: "#b3b3b3",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 16,
  },
  rightSlot: {
    justifyContent: "center",
    alignItems: "center",
  },
});
