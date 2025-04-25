import React, { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Box, Text } from '@/components/restyle';
import { RestyleButton } from "@/components/RestyleButton";
import { router } from "expo-router";
import { RadioButton } from "react-native-paper";

export default function Step3() {
    const [hadName, sethadName] = useState(false);
    const [checked, setChecked] = useState(false);
    const [checked2, setChecked2] = useState(false);

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
                    onChangeText={() => {sethadName(true)}}
                    autoCapitalize="characters"
                />
                <Text style={styles.input_container_subtext}>This appears on your spotify profile</Text>
                
            </Box>
            <Box padding='s'style={styles.divider}/>
            <Box style={styles.text_container}>
                <Text variant='caption' style={styles.text} color='text'>By tapping on "Create account", you agree to the spotify Terms of Use.</Text>
                <Text variant='caption' style={styles.text} color='success'>Terms of Use</Text>
                <Text variant='caption' style={styles.text} color='text'>To learn more about how Spotify collect, uses, shares and protect your personal data, Please see the Spotify Privacy Policy.</Text>
                <Text variant='caption' style={styles.text} color='success'>Privacy Policy</Text>
                <Box style={styles.text_with_button}>
                    <Text variant='caption' style={styles.text} color='text'>Please send me news and offers from Spotify.</Text>
                    <RadioButton
                        value="first"
                        status='checked'
                        onPress={() => {setChecked2(!checked2)}}
                        color={checked2 === false ? '#535353' : '#1ED760'}
                        
                    />
                </Box>
                <Box style={styles.text_with_button}>
                    <Text variant='caption' style={styles.text} color='text'>Share my registration data with Spotify's content providers for marketing purposes.</Text>
                    <RadioButton
                        value="first"
                        status='checked'
                        onPress={() => {setChecked(!checked)}}
                        color={checked === false ? '#535353' : '#1ED760'}
                        
                    />
                </Box>
            </Box>
            {!hadName && (
                <Box padding='s'>
                    <RestyleButton title="Next" variant="primary" textColor="text" onPress={() => {}} disabled={true}/>
                </Box>
            )}
            {hadName && (
                <Box padding='s'>
                    <RestyleButton title="Next" textColor="secondary" onPress={() => {router.push('/')}} disabled={false}/>
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
    text_container: {
        gap: 10,
    },
    text: {
        fontSize: 12,
    },
    text_with_button: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',  
        alignItems: 'center',
    }
})