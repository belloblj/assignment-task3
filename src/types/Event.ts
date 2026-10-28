import { LatLng } from 'react-native-maps';

export interface Event {
    id: string;
    name: string;
    description: string;
    dateTime: string; // ISO 8601, as stored by json-server
    imageUrl?: string;
    organizerId: string;
    position: LatLng;
    volunteersNeeded: number;
    volunteersIds: string[];
}

/** Details of an image after it was uploaded to online storage. */
export interface UploadedImage {
    url: string;
    name: string;
    size: number; // bytes
    localUri: string; // used for the on-screen thumbnail
}
