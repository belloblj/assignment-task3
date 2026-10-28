import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';

/** Confirmation after the event was saved. "Next" returns to the map, which reloads events. */
export default function EventCreated({ navigation, route }: StackScreenProps<any>) {
    const eventName: string | undefined = route.params?.eventName;

    return (
        <View style={styles.container}>
            <Feather name="check-circle" size={80} color="#FFF" />
            <Text style={styles.title}>Event created!</Text>
            <Text style={styles.message}>
                {eventName ? `"${eventName}" is now on the map.` : 'Your event is now on the map.'}
            </Text>
            <View style={styles.buttonRow}>
                <BigButton label="Next" color="#FF8700" onPress={() => navigation.navigate('EventsMap')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00A3FF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    title: {
        marginTop: 24,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#FFF',
        fontSize: 32,
    },
    message: {
        marginTop: 8,
        fontFamily: 'Nunito_600SemiBold',
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
    },
    buttonRow: {
        marginTop: 48,
        flexDirection: 'row',
        width: '100%',
    },
});
