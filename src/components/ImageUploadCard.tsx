import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Colors } from '../constants/Colors';
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
            <View style={[styles.box, styles.empty, styles.center]}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.uploadingText}>Uploading picture…</Text>
            </View>
        );
    }

    if (image) {
        return (
            <View style={[styles.box, styles.filled]}>
                <Image source={{ uri: image.localUri }} style={styles.thumbnail} />
                <View style={styles.details}>
                    <Text style={styles.fileName} numberOfLines={1}>
                        {image.name}
                    </Text>
                    <Text style={styles.fileSize}>{formatBytes(image.size)}</Text>
                </View>
                <BorderlessButton onPress={onRemove} style={styles.removeButton}>
                    <Feather name="x" size={22} color={Colors.cancel} />
                </BorderlessButton>
            </View>
        );
    }

    // RectButton can't draw a dashed border, so the border lives on the View inside it.
    return (
        <RectButton style={styles.touchable} onPress={onAdd}>
            <View style={[styles.box, styles.empty, styles.center]}>
                <Feather name="plus" size={24} color={Colors.pictureEmptyBorder} />
            </View>
        </RectButton>
    );
}

const styles = StyleSheet.create({
    touchable: {
        borderRadius: 8,
    },
    box: {
        height: 72,
        borderRadius: 8,
        borderWidth: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        borderStyle: 'dashed',
        borderColor: Colors.pictureEmptyBorder,
        backgroundColor: Colors.pictureEmptyBackground,
    },
    uploadingText: {
        marginTop: 4,
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.label,
        fontSize: 12,
    },
    filled: {
        height: 88,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: Colors.pictureFilledBackground,
        borderColor: Colors.pictureFilledBorder,
    },
    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: 6,
    },
    details: {
        flex: 1,
        marginHorizontal: 12,
    },
    fileName: {
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.text,
        fontSize: 14,
    },
    fileSize: {
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.text,
        fontSize: 13,
    },
    removeButton: {
        padding: 8,
    },
});
