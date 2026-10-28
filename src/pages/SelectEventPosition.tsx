import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MapView, { LatLng, MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import FlowHeader from '../components/FlowHeader';
import * as MapSettings from '../constants/MapSettings';
import mapMarkerImg from '../images/map-marker.png';

/** Step 1 of "add event": tap the map to choose where the event happens. */
export default function SelectEventPosition({ navigation }: StackScreenProps<any>) {
    const [position, setPosition] = useState<LatLng>();

    const handleMapPress = (event: MapPressEvent) => setPosition(event.nativeEvent.coordinate);

    const handleNext = () => {
        if (position) navigation.navigate('EventData', { position });
    };

    return (
        <View style={styles.container}>
            <FlowHeader
                title="Add event"
                onBack={() => navigation.goBack()}
                onCancel={() => navigation.navigate('EventsMap')}
            />
            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{ ...MapSettings.DEFAULT_POSITION, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
                    style={StyleSheet.absoluteFillObject}
                    customMapStyle={customMapStyle}
                    showsUserLocation={true}
                    toolbarEnabled={false}
                    rotateEnabled={false}
                    onPress={handleMapPress}
                >
                    {position && (
                        <Marker coordinate={position}>
                            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                        </Marker>
                    )}
                </MapView>

                {!position && (
                    <View style={styles.hint}>
                        <Text style={styles.hintText}>Tap the map to set the event location</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <BigButton label="Next" color="#00A3FF" disabled={!position} onPress={handleNext} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
    },
    hint: {
        position: 'absolute',
        top: 24,
        left: 24,
        right: 24,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#00A3FFE6',
        alignItems: 'center',
    },
    hintText: {
        fontFamily: 'Nunito_700Bold',
        color: '#FFF',
        fontSize: 15,
    },
    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,
        flexDirection: 'row',
    },
});
