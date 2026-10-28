import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface FormFieldProps {
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}

/** Label + optional hint + the input + an error message underneath. */
export default function FormField({ label, hint, error, children }: FormFieldProps) {
    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                {hint && <Text style={styles.hint}>{hint}</Text>}
            </View>
            {children}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    label: {
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.label,
        fontSize: 14,
    },
    hint: {
        fontFamily: 'Nunito_400Regular',
        color: Colors.label,
        fontSize: 11,
    },
    error: {
        marginTop: 4,
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.error,
        fontSize: 12,
    },
});

export const inputStyles = StyleSheet.create({
    input: {
        backgroundColor: Colors.inputBackground,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 8,
        height: 56,
        paddingHorizontal: 16,
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.text,
        fontSize: 15,
    },
    multiline: {
        height: 120,
        paddingTop: 14,
        textAlignVertical: 'top',
    },
});
