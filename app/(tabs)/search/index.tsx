import { useState } from 'react';
import { StyleSheet, TextInput, Image, TouchableOpacity } from 'react-native';
import { Box, Text } from '@/components/restyle';
import { RestyleButton } from '@/components/RestyleButton';
import searchContent from '@/query/search/searchContent';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const Search = () => {
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null);
    const [query, setQuery] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        try {
            const result = await searchContent(query);
            setSearchResult(result);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box style={styles.container}>
            <Box flexDirection="row" justifyContent={'space-around'} backgroundColor='transparent' style={{display: "flex", marginTop: 75}} width={'100%'}>
                <TextInput
                    style={styles.input_container_input}
                    placeholder="Search"
                    placeholderTextColor="#000"
                    keyboardType="web-search"
                    autoCapitalize="none"
                    value={query}
                    onChangeText={setQuery}
                    onEndEditing={handleSearch}
                    autoCorrect={false}
                />
                <RestyleButton
                    title="Cancel"
                    variant="transparent"
                    onPress={() => {}}
                />
            </Box>
            <Text variant="body" color="text" style={styles.subtitle}>Search Result</Text>
            {loading ? (
                <Text>Loading...</Text>
            ) : searchResult ? (
                <Animated.FlatList
                    data={[
                        ...(searchResult.tracks?.items || []),
                        ...(searchResult.albums?.items || []),
                        ...(searchResult.artists?.items || []),
                        ...(searchResult.playlists?.items || []),
                    ].filter(Boolean)}
                    style={{ marginBottom: 110 }}
                    keyExtractor={(item) => item.id}
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    maxToRenderPerBatch={7}
                    initialNumToRender={7}
                    windowSize={7}
                    renderItem={({ item }) => {
                        let type = '';
                        if (item.type) {
                            type = item.type;
                        } else if (item.artists && item.album) {
                            type = 'track';
                        } else if (item.artists) {
                            type = 'album';
                        } else if (item.followers) {
                            type = 'artist';
                        } else if (item.owner) {
                            type = 'playlist';
                        }

                        let path = '';
                        if (type === 'track') path = '/(tabs)/search/track/[id]';
                        else if (type === 'album') path = '/(tabs)/search/album/[id]';
                        else if (type === 'artist') path = '/(tabs)/search/artist/[id]';
                        else if (type === 'playlist') path = '/(tabs)/search/playlist/[id]';

                        return (

                            <TouchableOpacity onPress={() => router.push(
                                {
                                    pathname: path as any,
                                    params: { 
                                        id: item.id,
                                        item: JSON.stringify(item),
                                     }
                                    
                                }
                            )}>


                                <Box style={{ marginVertical: 10 }} flexDirection="row-reverse" alignItems="center" justifyContent="flex-end" gap={"m"}>
                                    <Box>
                                        <Text variant="body" color="text">
                                            {type === 'track' && item.name}
                                            {type === 'album' && item.name}
                                            {type === 'artist' && item.name}
                                            {type === 'playlist' && item.name}
                                        </Text>
                                        {type === 'track' && (
                                            <>
                                                <Text variant="body" color="text">{item.artists[0]?.name}</Text>
                                                {item.album && (
                                                    <Text variant="caption" color="text">{item.album.name}</Text>
                                                )}
                                            </>
                                        )}
                                        {type === 'album' && (
                                            <Text variant="body" color="text">{item.artists[0]?.name}</Text>
                                        )}
                                        {type === 'artist' && (
                                            <Text variant="caption" color="text">Artist</Text>
                                        )}
                                        {type === 'playlist' && (
                                            <Text variant="caption" color="text">{item.owner?.display_name}</Text>
                                        )}
                                    </Box>
                                    {(type === 'track' && item.album?.images?.[0]) && (
                                        <Image source={{ uri: item.album.images[0].url }} style={{ width: 50, height: 50 }} />
                                    )}
                                    {(type === 'album' && item.images?.[0]) && (
                                        <Image source={{ uri: item.images[0].url }} style={{ width: 50, height: 50 }} />
                                    )}
                                    {(type === 'artist' && item.images?.[0]) && (
                                        <Image source={{ uri: item.images[0].url }} style={{ width: 50, height: 50, borderRadius: 50 }} />
                                    )}
                                    {(type === 'playlist' && item.images?.[0]) && (
                                        <Image source={{ uri: item.images[0].url }} style={{ width: 50, height: 50 }} />
                                    )}
                                </Box>
                            </TouchableOpacity>
                        );
                    }}
                />
            ) : (
                <Text>No results found</Text>
            )}
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
    subtitle : {
        marginVertical: 10,
    }

});

export default Search;