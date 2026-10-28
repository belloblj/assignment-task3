import { Event } from '../types/Event';
import * as api from './api';
import { getFromCache, setInCache } from './caching';

export const EVENTS_CACHE_KEY = 'events';

export type EventsSource = 'network' | 'cache';

export interface EventsResult {
    events: Event[];
    source: EventsSource;
}

/**
 * Network first, cache as fallback:
 * 1. Try GET /events.
 * 2. If it succeeds, save the result in Async Storage and return it.
 * 3. If it fails (no network, server down, timeout), load the last saved copy instead.
 * Throws only when there is no network AND nothing has been cached yet.
 */
export const loadEvents = async (): Promise<EventsResult> => {
    try {
        const events = await api.getEvents();
        await setInCache(EVENTS_CACHE_KEY, events);
        return { events, source: 'network' };
    } catch (networkError) {
        console.log('Events: network unavailable, reading cache.', networkError);
        const events = await getFromCache<Event[]>(EVENTS_CACHE_KEY);
        return { events, source: 'cache' };
    }
};

export const isFutureEvent = (event: Event, now = new Date()): boolean => new Date(event.dateTime) > now;
