import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { StyleSheet, TextInput, Button } from "react-native";

export default function Step1() {
    const [hadEmail, setHadEmail] = useState(false);

    return (
        <ThemedView backgroundColor="mainBackground" style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText variant='title' style={styles.header_text}>Create account</ThemedText>
            </ThemedView>

            <ThemedView style={styles.input_container}>
                <ThemedText variant='title'>What's your email?</ThemedText>
                <TextInput
                    style={styles.input_container_input}
                    placeholder="Your email"
                    placeholderTextColor="#000"
                    keyboardType="email-address"
                    autoFocus={true}
                    onChangeText={() => {setHadEmail(true)}}
                    autoCapitalize="none"
                />
                <ThemedText style={styles.input_container_subtext}>You'll need to confirm this email later.</ThemedText>
                {!hadEmail && (
                    <ThemedView padding='s' margin='m' borderRadius={30} style={styles.validation_button_disabled}>
                        <Button title="Next" color='#fff' onPress={() => {}} disabled={hadEmail}/>
                    </ThemedView>
                )}
                {hadEmail && (
                    <ThemedView padding='s' margin='m' borderRadius={30} style={styles.validation_button_enabled}>
                        <Button title="Next" color='#000' onPress={() => {}} disabled={!hadEmail} />
                    </ThemedView>
                )}
            </ThemedView>
        </ThemedView>
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
    },
    validation_button_enabled: {
        backgroundColor: '#1ED760',
        width: 100,
        alignSelf: 'center',
        color: '#000',
    }
})