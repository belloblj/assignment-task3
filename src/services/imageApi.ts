import axios from 'axios';
import Constants from 'expo-constants';

// Images are uploaded to Freeimage.host (https://freeimage.host/page/api), the storage
// service suggested in the assignment brief.
//
// The key below is the public key Freeimage.host publishes on its API page for anyone to use.
// To use your own key instead, start Expo with:
//   FREEIMAGE_API_KEY="your_key_here" npx expo start
const PUBLIC_FREEIMAGE_KEY = '6d207e02198a847aa98d0a2a901485a5';

const imageApi = axios.create({
    baseURL: 'https://freeimage.host/api/1',
    timeout: 30000,
});

export interface ImageUploadResult {
    url: string;
    name: string;
    size: number;
}

export const uploadImage = async (imageBase64: string): Promise<ImageUploadResult> => {
    const data = new FormData();
    data.append('key', Constants.expoConfig?.extra?.FREEIMAGE_API_KEY || PUBLIC_FREEIMAGE_KEY);
    data.append('action', 'upload');
    data.append('format', 'json');
    data.append('source', imageBase64);

    const response = await imageApi.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    const image = response.data?.image;
    if (!image?.url) throw new Error(response.data?.error?.message ?? 'Upload failed');

    return {
        url: image.url,
        name: image.filename ?? image.name ?? 'image.jpg',
        size: Number(image.size ?? 0),
    };
};
