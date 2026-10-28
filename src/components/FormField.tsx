import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
        marginBottom: 8,
    },
    label: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#8fa7b3',
        fontSize: 16,
    },
    hint: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#8fa7b3',
        fontSize: 11,
    },
    error: {
        marginTop: 4,
        fontFamily: 'Nunito_600SemiBold',
        color: '#FF669D',
        fontSize: 12,
    },
});

export const inputStyles = StyleSheet.create({
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1.4,
        borderColor: '#D3E2E5',
        borderRadius: 20,
        height: 56,
        paddingHorizontal: 24,
        fontFamily: 'Nunito_600SemiBold',
        color: '#5C8599',
        fontSize: 15,
    },
    multiline: {
        height: 110,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
});
