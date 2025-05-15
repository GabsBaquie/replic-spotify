import { Box, Text } from "@/components/restyle"
import { StyleSheet } from "react-native"

const Home = () => {
    return (
        <Box style={styles.container}>
            <Text style={styles.text}>Home</Text>
        </Box>
    )
}

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

export default Home;