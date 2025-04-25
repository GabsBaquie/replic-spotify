import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Box, Text } from '@/components/restyle';
import { RestyleButton } from "@/components/RestyleButton";
import { router } from "expo-router";

export default function Step3() {
    const [hadEmail, setHadEmail] = useState(false);

    return (
        <Box backgroundColor="mainBackground" style={styles.container}>
            <Box style={styles.header}>
                <Text color="text" variant='title' style={styles.header_text}>Create account</Text>
            </Box>

            <Box style={styles.input_container}>
                <Text variant='title'>What's your name?</Text>
                <TextInput
                    style={styles.input_container_input}
                    placeholder="Your name"
                    placeholderTextColor="#000"
                    keyboardType="default"
                    autoFocus={true}
                    onChangeText={() => {setHadEmail(true)}}
                    autoCapitalize="characters"
                />
                <Text style={styles.input_container_subtext}>This appears on your spotify profile</Text>
                
            </Box>
            <Box padding='s'style={styles.divider}/>
            {!hadEmail && (
                <Box padding='s'>
                    <RestyleButton title="Next" variant="primary" textColor="text" onPress={() => {}} disabled={true}/>
                </Box>
            )}
            {hadEmail && (
                <Box padding='s'>
                    <RestyleButton title="Next" textColor="secondary" onPress={() => {router.push('/signup/step2')}} disabled={false}/>
                </Box>
            )}
        </Box>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: '15%',
        paddingHorizontal: '10%',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    header_text: {
        fontSize: 18,
    },
    input_container: {
        marginTop: '10%'
    },
    input_container_input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        paddingLeft: 10,
        color: '#fff',
        backgroundColor: '#777777',
        borderRadius: 10
    },
    input_container_subtext: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 5
    },
    validation_button_disabled: {
        backgroundColor: '#535353',
        width: 100,
        alignSelf: 'center',
        borderRadius: 30,
    },
    validation_button_enabled: {
        backgroundColor: '#1ED760',
        width: 100,
        alignSelf: 'center',
        color: '#000',
        borderRadius: 30,
    },
    divider: {
        borderBottomColor: '#777777',
        borderBottomWidth: 1,
        marginBottom: 10,
        width: '100%',
    },
})