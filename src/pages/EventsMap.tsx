import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import { EventsSource, isFutureEvent, loadEvents } from '../services/eventsRepository';
import { Event } from '../types/Event';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const isFocused = useIsFocused();

    const [events, setEvents] = useState<Event[]>([]);
    const [source, setSource] = useState<EventsSource>();
    const [isLoading, setIsLoading] = useState(false);
    const [mapIsReady, setMapIsReady] = useState(false);

    // Runs when the map first opens AND every time the user comes back to it
    // (e.g. after creating an event), so the new event shows up straight away.
    useEffect(() => {
        if (!isFocused) return;
        let cancelled = false;

        setIsLoading(true);
        loadEvents()
            .then(({ events: allEvents, source }) => {
                if (cancelled) return;
                const futureEvents = allEvents.filter((event) => isFutureEvent(event));
                setEvents(futureEvents);
                setSource(source);
            })
            .catch(() => {
                if (cancelled) return;
                setEvents([]);
                setSource(undefined);
                Alert.alert(
                    'No connection',
                    'Events could not be loaded and there is no saved copy on this device yet. Check your connection and try again.'
                );
            })
            .finally(() => !cancelled && setIsLoading(false));

        return () => {
            cancelled = true;
        };
    }, [isFocused]);

    // Re-fit whenever a fresh list arrives (and once the map is ready to be moved).
    useEffect(() => {
        if (mapIsReady) fitMapToEvents(events);
    }, [events, mapIsReady]);

    // Move and zoom the map so every future event is visible.
    const fitMapToEvents = (eventsToShow: Event[]) => {
        if (eventsToShow.length === 0) return;
        const coordinates = eventsToShow.map(({ position }) => ({
            latitude: position.latitude,
            longitude: position.longitude,
        }));
        if (coordinates.length === 1) {
            mapViewRef.current?.animateToRegion({ ...coordinates[0], ...MapSettings.DEFAULT_DELTA });
        } else {
            mapViewRef.current?.fitToCoordinates(coordinates, {
                edgePadding: MapSettings.EDGE_PADDING,
                animated: true,
            });
        }
    };

    const handleNavigateToCreateEvent = () => {
        navigation.navigate('SelectEventPosition');
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapViewRef}
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                showsMyLocationButton={false}
                showsUserLocation={true}
                rotateEnabled={false}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                mapPadding={MapSettings.EDGE_PADDING}
                onMapReady={() => setMapIsReady(true)}
            >
                {events.map((event) => (
                    <Marker
                        key={event.id}
                        coordinate={{
                            latitude: event.position.latitude,
                            longitude: event.position.longitude,
                        }}
                        title={event.name}
                    >
                        <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                    </Marker>
                ))}
            </MapView>

            {source === 'cache' && (
                <View style={styles.offlineBanner}>
                    <Feather name="wifi-off" size={16} color="#FFF" />
                    <Text style={styles.offlineText}>Offline — showing saved events</Text>
                </View>
            )}

            <View style={styles.footer}>
                {isLoading ? (
                    <ActivityIndicator color="#8fa7b3" />
                ) : (
                    <Text style={styles.footerText}>{events.length} event(s) found</Text>
                )}
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={handleNavigateToCreateEvent}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>
            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: '#4D6F80' }]}
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color="#FFF" />
            </RectButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    mapStyle: {
        ...StyleSheet.absoluteFillObject,
    },

    logoutButton: {
        position: 'absolute',
        top: 70,
        right: 24,

        elevation: 3,
    },

    offlineBanner: {
        position: 'absolute',
        top: 70,
        left: 24,
        height: 56,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: '#4D6F80',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
    },

    offlineText: {
        marginLeft: 8,
        fontFamily: 'Nunito_700Bold',
        color: '#FFF',
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,

        backgroundColor: '#FFF',
        borderRadius: 16,
        height: 56,
        paddingLeft: 24,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
    },

    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },
});
