import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Image, TouchableOpacity } from 'react-native';
import { Box, Text } from '@/components/restyle';
import { RestyleButton } from '@/components/RestyleButton';
import { searchContentMixed, flattenMixedSearchToItems, type SearchResultItem } from '@/query/search/searchContent';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const Search = () => {
    const [loading, setLoading] = useState(false);
    const [searchItems, setSearchItems] = useState<SearchResultItem[]>([]);
    const [query, setQuery] = useState('');

    // Recherche mixte Spotify + Supabase avec délai 1s après saisie
    useEffect(() => {
        if (!query.trim()) {
            setSearchItems([]);
            return;
        }
        setLoading(true);
        const handler = setTimeout(async () => {
            try {
                const result = await searchContentMixed(query);
                setSearchItems(flattenMixedSearchToItems(result, query));
            } catch (error) {
                console.error('Error fetching search results:', error);
                setSearchItems([]);
            } finally {
                setLoading(false);
            }
        }, 1000);
        return () => clearTimeout(handler);
    }, [query]);

    const handleItemPress = (item: SearchResultItem) => {
        if (item.source === 'supabase') {
            if (item.type === 'artist') {
                router.push({
                    pathname: '/(tabs)/library/artist/[id]',
                    params: { id: item.id, source: 'supabase', item: JSON.stringify(item.raw) },
                });
            } else if (item.type === 'track') {
                router.push({
                    pathname: '/(tabs)/library/track/[id]',
                    params: { id: item.id, source: 'supabase', item: JSON.stringify(item.raw) },
                });
            }
            return;
        }
        const path =
            item.type === 'track' ? '/(tabs)/search/track/[id]'
            : item.type === 'album' ? '/(tabs)/search/album/[id]'
            : item.type === 'artist' ? '/(tabs)/search/artist/[id]'
            : '/(tabs)/search/playlist/[id]';
        router.push({
            pathname: path as any,
            params: { id: item.id, item: JSON.stringify(item.raw) },
        });
    };

    return (
        <Box style={styles.container}>
            <Box flexDirection="row" justifyContent={'space-around'} backgroundColor='transparent' style={{display: "flex", marginTop: 75}} width={'100%'}>
                <TextInput
                    style={styles.input_container_input}
                    placeholder="Artiste, titre..."
                    placeholderTextColor="#000"
                    keyboardType="web-search"
                    autoCapitalize="none"
                    value={query}
                    onChangeText={setQuery}
                    autoCorrect={false}
                />
                <RestyleButton
                    title="Cancel"
                    variant="transparent"
                    onPress={() => { setQuery(''); setSearchItems([]); }}
                />
            </Box>
            <Text variant="body" color="text" style={styles.subtitle}>Résultats (Spotify + créateurs)</Text>
            {loading ? (
                <Text>Chargement...</Text>
            ) : searchItems.length > 0 ? (
                <Animated.FlatList
                    data={searchItems}
                    style={{ marginBottom: 110 }}
                    keyExtractor={(item) => `${item.source}-${item.type}-${item.id}`}
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    maxToRenderPerBatch={7}
                    initialNumToRender={7}
                    windowSize={7}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleItemPress(item)}>
                            <Box style={{ marginVertical: 10 }} flexDirection="row-reverse" alignItems="center" justifyContent="flex-end" gap={"m"}>
                                <Box>
                                    <Text variant="body" color="text">{item.name}</Text>
                                    <Text variant="caption" color="text">
                                        {item.subtitle}
                                        {item.source === 'supabase' && ` · Créateur`}
                                    </Text>
                                </Box>
                                {item.imageUri ? (
                                    <Image
                                        source={{ uri: item.imageUri }}
                                        style={item.type === 'artist' ? styles.avatar : styles.thumb}
                                    />
                                ) : (
                                    <Box style={[styles.thumb, styles.placeholder]} />
                                )}
                            </Box>
                        </TouchableOpacity>
                    )}
                />
            ) : query.trim() ? (
                <Text>Aucun résultat</Text>
            ) : null}
        </Box>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    input_container_input: {
        height: 40,
        width: '75%',
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        paddingLeft: 10,
        color: '#fff',
        backgroundColor: '#777777',
        borderRadius: 10
    },
    subtitle: {
        marginVertical: 10,
    },
    thumb: {
        width: 50,
        height: 50,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    placeholder: {
        backgroundColor: '#555',
    },
});

export default Search;