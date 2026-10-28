import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { UploadedImage } from '../types/Event';
import { formatBytes } from '../utils';

interface ImageUploadCardProps {
    image?: UploadedImage;
    isUploading: boolean;
    onAdd: () => void;
    onRemove: () => void;
}

/**
 * Shows a dashed "+" box to pick a picture, a spinner while uploading,
 * and the thumbnail + file name + size once the upload succeeded.
 */
export default function ImageUploadCard({ image, isUploading, onAdd, onRemove }: ImageUploadCardProps) {
    if (isUploading) {
        return (
            <View style={[styles.box, styles.center]}>
                <ActivityIndicator color="#00A3FF" />
                <Text style={styles.uploadingText}>Uploading picture…</Text>
            </View>
        );
    }

    if (image) {
        return (
            <View style={[styles.box, styles.uploaded]}>
                <Image source={{ uri: image.localUri }} style={styles.thumbnail} />
                <View style={styles.details}>
                    <Text style={styles.fileName} numberOfLines={1}>
                        {image.name}
                    </Text>
                    <Text style={styles.fileSize}>{formatBytes(image.size)}</Text>
                </View>
                <BorderlessButton onPress={onRemove} style={styles.removeButton}>
                    <Feather name="x" size={20} color="#FF669D" />
                </BorderlessButton>
            </View>
        );
    }

    return (
        <RectButton style={[styles.box, styles.center, styles.empty]} onPress={onAdd}>
            <Feather name="plus" size={24} color="#00A3FF" />
        </RectButton>
    );
}

const styles = StyleSheet.create({
    box: {
        height: 72,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1.4,
        borderColor: '#D3E2E5',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        borderStyle: 'dashed',
        borderColor: '#96D2F0',
        backgroundColor: '#F5FBFE',
    },
    uploadingText: {
        marginTop: 4,
        fontFamily: 'Nunito_600SemiBold',
        color: '#8fa7b3',
        fontSize: 12,
    },
    uploaded: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    thumbnail: {
        width: 56,
        height: 56,
        borderRadius: 16,
    },
    details: {
        flex: 1,
        marginHorizontal: 12,
    },
    fileName: {
        fontFamily: 'Nunito_700Bold',
        color: '#5C8599',
        fontSize: 14,
    },
    fileSize: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#8fa7b3',
        fontSize: 12,
    },
    removeButton: {
        padding: 8,
    },
});
