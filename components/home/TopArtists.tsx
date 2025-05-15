import { useEffect, useState } from 'react';
import { View, Image, FlatList, StyleSheet, ActivityIndicator, Pressable, Linking } from 'react-native';
import getTopArtists from '@/query/profile/topArtists';
import { Text, Box } from '@/components/restyle';
import { useRouter } from 'expo-router';

// Artist or Category
type Artist = {
  id: string;
  name: string;
  images: { url: string }[];
  external_urls?: { spotify: string };
  href?: string;        // for categories
};

export default function TopArtists() {
  const [list, setList] = useState<Artist[]>([]);
  const [source, setSource] = useState<'profileTop' | 'recommendation'>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getTopArtists(10)
      .then(({ type, data }) => {
        setSource(type as 'profileTop' | 'recommendation');
        setList(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading music...</Text>
      </View>
    );
  }

  return (
    <Box style={styles.container}>
        <Text style={styles.header}>
          {source === 'profileTop' ? 'Your Top Artists' : 'Suggested for You'}
        </Text>
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      data={list}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable onPress={() => {
          if (source === 'profileTop') {
            router.push({ pathname: '/artist/[id]', params: { id: item.id } });
          } else {
            router.push({ pathname: '/categories/[id]', params: { id: item.id } });
          }
        }}>
          <View style={styles.item}>
            {item.images?.[0]?.url && (
              <Image source={{ uri: item.images[0].url }} style={styles.image} />
            )}
            <Text style={styles.name}>{item.name}</Text>
          </View>
        </Pressable>
      )}
    />
    </Box>
  );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
         alignItems: 'center'
    },
    
    header: { 
        fontSize: 20,
     fontWeight: 'bold', 
        color: 'white', 
        margin: 16
    },

    container: {
         marginVertical: 50, 
         display: 'flex', 
         flexDirection: 'column', 
         gap: 10
    },

    item: { 
        width: 140,
        flexDirection: 'column', 
        justifyContent: 'flex-start',
        alignItems: 'center', 
        marginHorizontal: 8,
    },

    image: { 
        width: 120,
        height: 120, 
        borderRadius: 60,
        marginBottom: 10,
    },

    name: { 
        fontSize: 16,
        maxWidth: 130,
        color: 'white',
        textAlign: 'center', 
        flexWrap: 'wrap'
    },
});