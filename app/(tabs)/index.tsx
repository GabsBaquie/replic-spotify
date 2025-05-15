import { Image, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Box, Text } from '@/components/restyle';

export default function HomeScreen() {
  const isoboarding = true;

  if (isoboarding) {
    return <Redirect href="/onBoarding" />;
  }
  
  return (
   <Box flex={1} justifyContent="center" alignItems="center">
    <Text variant="header">Home</Text>
   </Box>
  );
}

const styles = StyleSheet.create({
 
});
