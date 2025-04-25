import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Box, Text } from '@/components/restyle';
import { RestyleButton } from "@/components/RestyleButton";
import { router } from "expo-router";

export default function Step2() {
    const [hadPassword, setHadPassword] = useState(false);

    return (
        <Box backgroundColor="mainBackground" style={styles.container}>
            <Box style={styles.header}>
                <Text color="text" variant='title' style={styles.header_text}>Create account</Text>
            </Box>

            <Box style={styles.input_container}>
                <Text variant='title'>Create a password</Text>
                <TextInput
                    style={styles.input_container_input}
                    placeholder="Your password"
                    placeholderTextColor="#000"
                    keyboardType="default"
                    autoFocus={true}
                    onChangeText={() => {setHadPassword(true)}}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    textContentType="password"
                />
                <Text style={styles.input_container_subtext}>Use atleast 8 characters.</Text>
                {!hadPassword && (
                    <Box padding='s'>
                        <RestyleButton title="Next" variant="primary" textColor="text" onPress={() => {}} disabled={true}/>
                    </Box>
                )}
                {hadPassword && (
                    <Box padding='s'>
                        <RestyleButton title="Next" textColor="secondary" onPress={() => {router.push('/signup/step3')}} disabled={false}/>
                    </Box>
                )}
            </Box>
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
        paddingVertical: '10%'
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
    }
})