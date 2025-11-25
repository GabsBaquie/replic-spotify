import { useState } from "react";
import { StyleSheet } from "react-native";
import { Box } from "@/components/restyle";
import TopArtists from "@/components/home/TopArtists";
import RecentlyPlayed from "@/components/home/RecentlyPlayed";
import { MyProfile } from "@/components/home/MyProfile";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { useProfile } from "@/hooks/useProfile";

export default function Home() {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile();

  const openProfile = () => setIsProfileVisible(true);
  const closeProfile = () => setIsProfileVisible(false);

  return (
    <Box style={styles.container}>
      <HomeNavbar
        profile={profile}
        isLoading={isProfileLoading}
        onProfilePress={openProfile}
      />
      <TopArtists />
      <RecentlyPlayed />
      <MyProfile
        isVisible={isProfileVisible}
        profile={profile}
        isLoading={isProfileLoading}
        error={profileError}
        onClose={closeProfile}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
});
