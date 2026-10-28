import 'react-native-get-random-values'; // must come before uuid
import { useActionSheet } from '@expo/react-native-action-sheet';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LatLng } from 'react-native-maps';
import { v4 as uuidv4 } from 'uuid';
import BigButton from '../components/BigButton';
import FlowHeader from '../components/FlowHeader';
import FormField, { inputStyles } from '../components/FormField';
import ImageUploadCard from '../components/ImageUploadCard';
import { Colors } from '../constants/Colors';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { uploadImage } from '../services/imageApi';
import { Event, UploadedImage } from '../types/Event';
import { formatAMPM, updateDateWithNewTime } from '../utils';

const NAME_MAX = 60;
const DESCRIPTION_MAX = 300;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// "Oct 20, 2023" (written by hand: Android's JS engine ignores toLocaleDateString options)
const formatShortDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

type Field = 'name' | 'description' | 'volunteersNeeded' | 'date' | 'time' | 'image';

/** Step 2 of "add event": fill in the details, add a picture and save. */
export default function EventData({ navigation, route }: StackScreenProps<any>) {
    const position: LatLng = route.params?.position;
    const authenticationContext = useContext(AuthenticationContext);
    const { showActionSheetWithOptions } = useActionSheet();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState<Date>();
    const [image, setImage] = useState<UploadedImage>();

    const [pickerMode, setPickerMode] = useState<'date' | 'time'>();
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

    const touch = (field: Field) => setTouched((current) => ({ ...current, [field]: true }));

    const eventDateTime = date && time ? updateDateWithNewTime(date, time) : undefined;

    // Every field is mandatory. Each entry is an error message, or undefined when valid.
    const errors = useMemo(() => {
        const volunteers = Number(volunteersNeeded);
        return {
            name: !name.trim() ? 'Give the event a name' : undefined,
            description: !description.trim() ? 'Describe the event' : undefined,
            volunteersNeeded:
                !volunteersNeeded || !Number.isInteger(volunteers) || volunteers < 1
                    ? 'Enter a whole number of 1 or more'
                    : undefined,
            date: !date ? 'Pick a date' : undefined,
            time: !time
                ? 'Pick a time'
                : eventDateTime && eventDateTime <= new Date()
                ? 'The event must be in the future'
                : undefined,
            image: !image ? 'Add a picture' : undefined,
        } as Record<Field, string | undefined>;
    }, [name, description, volunteersNeeded, date, time, image]);

    const formIsValid = Object.values(errors).every((error) => !error) && !!position;
    const canSave = formIsValid && !isUploading && !isSaving;
    const errorFor = (field: Field) => (touched[field] ? errors[field] : undefined);

    // ---------- Picture: permissions → pick → upload ----------

    const askPermission = async (source: 'camera' | 'library'): Promise<boolean> => {
        const { granted, canAskAgain } =
            source === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!granted) {
            const what = source === 'camera' ? 'camera' : 'photo library';
            Alert.alert(
                'Permission needed',
                `Volunteam needs access to your ${what} to add a picture to the event.`,
                canAskAgain
                    ? [{ text: 'OK' }]
                    : [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Open settings', onPress: () => Linking.openSettings() },
                      ]
            );
        }
        return granted;
    };

    const pickImage = async (source: 'camera' | 'library') => {
        if (!(await askPermission(source))) return;

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5, // keeps uploads small and fast
            base64: true,
        };
        const result =
            source === 'camera'
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);

        if (result.canceled || !result.assets?.[0]?.base64) return;
        const asset = result.assets[0];

        setIsUploading(true);
        try {
            const uploaded = await uploadImage(asset.base64 as string);
            // Only show the thumbnail and details once the upload has succeeded.
            setImage({
                url: uploaded.url,
                name: uploaded.name || asset.fileName || 'image.jpg',
                size: uploaded.size || asset.fileSize || 0,
                localUri: asset.uri,
            });
        } catch (error) {
            console.log('Image upload failed', error);
            Alert.alert('Upload failed', 'The picture could not be uploaded. Check your connection and try again.');
        } finally {
            setIsUploading(false);
            touch('image');
        }
    };

    const handleAddPicture = () => {
        showActionSheetWithOptions(
            {
                title: 'Add a picture',
                options: ['Take a picture', 'Choose from gallery', 'Cancel'],
                cancelButtonIndex: 2,
            },
            (index) => {
                if (index === 0) pickImage('camera');
                if (index === 1) pickImage('library');
            }
        );
    };

    // ---------- Save ----------

    const handleSave = async () => {
        if (!canSave || !eventDateTime || !image) return;

        const newEvent: Event = {
            id: uuidv4(),
            name: name.trim(),
            description: description.trim(),
            dateTime: eventDateTime.toISOString(),
            imageUrl: image.url,
            organizerId: authenticationContext?.value?.id ?? '',
            position,
            volunteersNeeded: Number(volunteersNeeded),
            volunteersIds: [],
        };

        setIsSaving(true);
        try {
            await api.createEvent(newEvent);
            setIsSaving(false);
            navigation.navigate('EventCreated', { eventName: newEvent.name });
        } catch (error) {
            setIsSaving(false);
            console.log('Save failed', error);
            Alert.alert('Could not save', 'The event was not saved. Check your connection and try again.');
        }
    };

    // ---------- UI ----------

    return (
        <View style={styles.container}>
            <FlowHeader
                title="Add event"
                onBack={() => navigation.goBack()}
                onCancel={() => navigation.navigate('EventsMap')}
            />
            <KeyboardAwareScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                extraScrollHeight={24}
            >
                <FormField label="Event Name" error={errorFor('name')}>
                    <TextInput
                        style={inputStyles.input}
                        value={name}
                        maxLength={NAME_MAX}
                        onChangeText={setName}
                        onBlur={() => touch('name')}
                    />
                </FormField>

                <FormField label="About" hint={`${DESCRIPTION_MAX} characters max.`} error={errorFor('description')}>
                    <TextInput
                        style={[inputStyles.input, inputStyles.multiline]}
                        value={description}
                        maxLength={DESCRIPTION_MAX}
                        multiline
                        onChangeText={setDescription}
                        onBlur={() => touch('description')}
                    />
                </FormField>

                <FormField label="Volunteers Needed" error={errorFor('volunteersNeeded')}>
                    <TextInput
                        style={inputStyles.input}
                        value={volunteersNeeded}
                        keyboardType="number-pad"
                        onChangeText={(text) => setVolunteersNeeded(text.replace(/[^0-9]/g, ''))}
                        onBlur={() => touch('volunteersNeeded')}
                    />
                </FormField>

                <FormField label="Date and Time" error={errorFor('date') ?? errorFor('time')}>
                    <View style={styles.row}>
                        <RectButton style={[inputStyles.input, styles.pickerButton]} onPress={() => setPickerMode('date')}>
                            <Text style={[styles.pickerText, !date && styles.placeholder]}>
                                {date ? formatShortDate(date) : 'Date'}
                            </Text>
                        </RectButton>
                        <View style={styles.gap} />
                        <RectButton style={[inputStyles.input, styles.pickerButton]} onPress={() => setPickerMode('time')}>
                            <Text style={[styles.pickerText, !time && styles.placeholder]}>
                                {time ? formatAMPM(time).toUpperCase() : 'Time'}
                            </Text>
                        </RectButton>
                    </View>
                </FormField>

                <FormField label="Picture" error={errorFor('image')}>
                    <ImageUploadCard
                        image={image}
                        isUploading={isUploading}
                        onAdd={handleAddPicture}
                        onRemove={() => setImage(undefined)}
                    />
                </FormField>

                <View style={styles.saveRow}>
                    <BigButton label="Save" color={Colors.primary} disabled={!canSave} onPress={handleSave} />
                </View>
            </KeyboardAwareScrollView>

            <DateTimePickerModal
                isVisible={!!pickerMode}
                mode={pickerMode ?? 'date'}
                date={(pickerMode === 'time' ? time : date) ?? new Date()}
                minimumDate={pickerMode === 'date' ? new Date() : undefined}
                onConfirm={(picked) => {
                    // Hide the picker FIRST. On Android, any re-render while it is still
                    // marked visible makes the native dialog pop up a second time.
                    const mode = pickerMode;
                    setPickerMode(undefined);
                    if (mode === 'date') {
                        setDate(picked);
                        touch('date');
                    } else {
                        setTime(picked);
                        touch('time');
                    }
                }}
                onCancel={() => setPickerMode(undefined)}
            />

            <Spinner visible={isSaving} textContent="Saving event..." overlayColor="#031A62BF" textStyle={styles.spinnerText} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scroll: {
        backgroundColor: Colors.background,
    },
    content: {
        padding: 24,
        paddingBottom: 48,
    },
    row: {
        flexDirection: 'row',
    },
    gap: {
        width: 12,
    },
    pickerButton: {
        flex: 1,
        justifyContent: 'center',
    },
    pickerText: {
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.text,
        fontSize: 15,
    },
    placeholder: {
        color: '#C1CFD6',
    },
    saveRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    spinnerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#FFF',
    },
});
