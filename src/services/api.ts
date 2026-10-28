import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Event } from '../types/Event';

const PORT = 3333;

// Works out where json-server is running, so the address doesn't have to be edited by hand:
// - Android emulator: 10.0.2.2 is the emulator's alias for the laptop.
// - Real phone (Expo Go / dev build): the same laptop IP that Metro is served from.
// You can still override it by setting API_URL when starting Expo.
const getBaseUrl = (): string => {
    const override = Constants.expoConfig?.extra?.API_URL;
    if (override) return override;

    if (Platform.OS === 'android' && !Constants.isDevice) return `http://10.0.2.2:${PORT}`;

    const hostUri: string | undefined =
        (Constants.expoConfig as any)?.hostUri ??
        Constants.manifest?.hostUri ??
        Constants.manifest2?.extra?.expoGo?.debuggerHost;
    const metroHost = hostUri?.split(':')[0];
    if (metroHost) return `http://${metroHost}:${PORT}`;

    return `http://localhost:${PORT}`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 8000, // fail fast when offline so the app falls back to the cache quickly
});

// Send the login token with every request (json-server-auth issues it at /login).
api.interceptors.request.use(async (config) => {
    const cachedToken = await AsyncStorage.getItem('accessToken');
    if (cachedToken) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${JSON.parse(cachedToken)}`;
    }
    return config;
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};

export const getEvents = async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events');
    return response.data;
};

export const createEvent = async (event: Event): Promise<Event> => {
    const response = await api.post<Event>('/events', event);
    return response.data;
};
