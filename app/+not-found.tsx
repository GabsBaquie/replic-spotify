import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Box, Text } from '@/components/restyle'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Box style={styles.container}>
        <Text variant="title">This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text variant="body" color="accent">Go to home screen!</Text>
        </Link>
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
