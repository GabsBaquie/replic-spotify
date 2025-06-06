import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, Text } from '@/components/restyle';

const Library = () => {
    return (
        <Box style={styles.container}>
            <Text style={styles.text}>Library</Text>
        </Box>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default Library;