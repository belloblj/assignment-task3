import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface FlowHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    onCancel?: () => void;
}

/** Header used across the "add event" screens: back arrow, title, cancel (X). */
export default function FlowHeader({ title, showBack = true, onBack, onCancel }: FlowHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
            {showBack && onBack ? (
                <BorderlessButton onPress={onBack} style={styles.iconButton}>
                    <Feather name="arrow-left" size={24} color={Colors.back} />
                </BorderlessButton>
            ) : (
                <View style={styles.iconButton} />
            )}

            <Text style={styles.title}>{title}</Text>

            {onCancel ? (
                <BorderlessButton onPress={onCancel} style={styles.iconButton}>
                    <Feather name="x" size={24} color={Colors.cancel} />
                </BorderlessButton>
            ) : (
                <View style={styles.iconButton} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        backgroundColor: Colors.headerBackground,
        borderBottomWidth: 1,
        borderColor: Colors.headerBorder,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconButton: {
        width: 24,
        height: 24,
    },
    title: {
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.label,
        fontSize: 15,
    },
});
