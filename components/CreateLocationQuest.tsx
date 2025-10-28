import { Button, Card, Text } from "@ui-kitten/components";
import { useState, useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView, TextInput, Alert, Animated, PanResponder, Dimensions } from "react-native";
import MapView, { Marker, MapPressEvent, Callout } from "react-native-maps";
import GenerateCommunityCode from '@/components/GenerateLocation';
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Session } from "@supabase/supabase-js";
import { generateRandomCode } from "@/lib/utils";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 120;
const HALF_HEIGHT = SCREEN_HEIGHT * 0.5;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.85;

type MarkerType = {
	id: string;
	latitude: number;
	longitude: number;
};

type CommunityType = {
	id: string;
	message: string;
	type: string;
}

interface CreateCommunityQuestProps {
	session: Session
}

export default function CreateCommunityQuest({ session }: CreateCommunityQuestProps) {
	const [markers, setMarkers] = useState<MarkerType[]>([]);
	const [title, setTitle] = useState<string>('');
	const [isPublic, setIsPublic] = useState<boolean>(true);
	const [description, setDescription] = useState<string>('');
	const [deadline, setDeadline] = useState<Date>(new Date());
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [prompts, setPrompts] = useState<CommunityType[]>([]);
	const [submitting, setSubmitting] = useState<boolean>(false);

	// Bottom sheet animation
	const translateY = useRef(new Animated.Value(SCREEN_HEIGHT - HALF_HEIGHT)).current;
	const lastGestureDy = useRef(0);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, gestureState) => {
				// Only respond to vertical drags
				return Math.abs(gestureState.dy) > 10;
			},
			onPanResponderGrant: () => {
				translateY.setOffset(lastGestureDy.current);
			},
			onPanResponderMove: (_, gestureState) => {
				translateY.setValue(gestureState.dy);
			},
			onPanResponderRelease: (_, gestureState) => {
				translateY.flattenOffset();
				lastGestureDy.current += gestureState.dy;

				const currentPosition = lastGestureDy.current;
				let finalPosition;

				// Snap to nearest position
				if (gestureState.vy > 0.5 || currentPosition > SCREEN_HEIGHT - HALF_HEIGHT + 50) {
					// Snap to collapsed
					finalPosition = SCREEN_HEIGHT - COLLAPSED_HEIGHT;
				} else if (gestureState.vy < -0.5 || currentPosition < SCREEN_HEIGHT - EXPANDED_HEIGHT + 50) {
					// Snap to expanded
					finalPosition = SCREEN_HEIGHT - EXPANDED_HEIGHT;
				} else {
					// Snap to half
					finalPosition = SCREEN_HEIGHT - HALF_HEIGHT;
				}

				lastGestureDy.current = finalPosition;

				Animated.spring(translateY, {
					toValue: finalPosition,
					useNativeDriver: true,
					tension: 50,
					friction: 10,
				}).start();
			},
		})
	).current;

	const handleMapPress = useCallback((event: MapPressEvent) => {
		try {
			const coordinate = event?.nativeEvent?.coordinate;
			if (!coordinate || typeof coordinate.latitude !== 'number' || typeof coordinate.longitude !== 'number') {
				return;
			}

			const { latitude, longitude } = coordinate;
			const id = `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			const newMarker = { id, latitude, longitude };
			console.log('Adding marker:', newMarker);

			setMarkers((prev) => [...prev, newMarker]);
			setPrompts((prev) => [...prev, { id, message: "", type: "SCAN" }])
		} catch (error) {
			console.error('Error in handleMapPress:', error);
		}
	}, []);

	const handleMarkerDelete = useCallback((id: string) => {
		try {
			console.log(`Attempting to delete marker: ${id}`);
			setMarkers((prevMarkers) => prevMarkers.filter((m) => m.id !== id));
			setPrompts((prevPrompts) => prevPrompts.filter((m) => m.id !== id));
		} catch (error) {
			console.error('Error in handleMarkerDelete:', error);
		}
	}, []);

	const onChange = (_event: DateTimePickerEvent, selectedDate: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDeadline(selectedDate);
		}
	};

	const showDatepicker = () => {
		setShowDatePicker(true);
	};

	const submitQuest = async () => {
		if (!title.trim()) {
			Alert.alert('Error', 'Please enter a quest title');
			return;
		}
		if (description.length === 0) {
			Alert.alert('Error', 'Please enter a quest description');
			return;
		}
		if (prompts.length === 0) {
			Alert.alert('Error', 'Please enter photo requirements');
			return;
		}

		const now = new Date();
		if (deadline <= now) {
			Alert.alert('Error', 'Deadline must be in the future');
			return;
		}

		try {
			setSubmitting(true);
			console.log(prompts);
			console.log(markers);

			const subquests = prompts.map((prompt: CommunityType, i: number) => {
				return { ...prompt, ...markers[i] };
			});

			// Submit the main quest 
			const { data, error } = await supabase.from('quest').insert({
				author: session.user.id,
				description,
				created_at: new Date(),
				deadline: deadline,
				title: title.trim(),
				type: "COMMUNITY",
				public: isPublic
			}).select("id").single();

			const questID = data!.id;

			if (error) {
				console.error('Insert error:', error);
				throw error;
			}

			// Submit all the subquests
			for (const subquest of subquests) {
				let code: null | string = null;
				if (subquest.type === "SCAN") {
					code = generateRandomCode(6);
				}
				const { error: insertSubquestError } = await supabase.from("subquest").insert({
					quest_id: questID,
					prompt: subquest.message,
					type: subquest.type,
					latitude: subquest.latitude,
					longitude: subquest.longitude,
					code,
				});

				if (insertSubquestError){
					throw insertSubquestError;		
				}
			}

			// Generate a unique join code
			const code = generateRandomCode();
			const { error: insertCodeError } = await supabase.from("code").insert({
				quest_id: questID,
				code,
			});
			if (insertCodeError) {
				throw insertCodeError;
			}


			Alert.alert('Success!', 'Your quest has been created and is now live!');
			router.back();
		} catch (error) {
			console.error('Error submitting quest:', error);
			Alert.alert('Error', 'Failed to create quest. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<View style={styles.container}>
			{/* Full screen map */}
			<MapView
				style={styles.fullMap}
				initialRegion={{
					latitude: 37.78825,
					longitude: -122.4324,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				}}
				onPress={handleMapPress}
			>
				{markers.map((marker) => {
					if (!marker || typeof marker.latitude !== 'number' || typeof marker.longitude !== 'number') {
						return null;
					}

					return (
						<Marker
							key={marker.id}
							coordinate={{
								latitude: marker.latitude,
								longitude: marker.longitude,
							}}
						>
							<Callout
								tooltip={false}
								onPress={() => {
									setTimeout(() => {
										handleMarkerDelete(marker.id);
									}, 100);
								}}
							>
								<View style={styles.callout}>
									<Text style={styles.calloutText}>Delete {marker.id}</Text>
								</View>
							</Callout>
						</Marker>
					);
				})}
			</MapView>

			{/* Draggable bottom sheet */}
			<Animated.View
				style={[
					styles.bottomSheet,
					{
						transform: [{ translateY }],
					},
				]}
			>
				{/* Drag handle */}
				<View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
					<View style={styles.dragHandle} />
					<Text category="h5" style={styles.sheetTitle}>
						Create Community Quest
					</Text>
				</View>

				{/* Scrollable content */}
				<ScrollView
					style={styles.scrollContent}
					contentContainerStyle={styles.scrollContentContainer}
					showsVerticalScrollIndicator={false}
				>
					<Text category="s1" style={styles.subtitle}>
						Design a Community-based challenge for other adventurers
					</Text>

					{/* Quest Details */}
					{/* Quest Details */}
					<Card style={styles.section}>
						<Text category="h6" style={styles.sectionTitle}>
							Quest Information
						</Text>

						<View style={styles.inputGroup}>
							<Text category="s1" style={styles.inputLabel}>
								Quest Visibility *
							</Text>
							<View style={styles.visibilityContainer}>
								<Button
									style={[styles.visibilityButton, isPublic && styles.visibilityButtonActive]}
									appearance={isPublic ? 'filled' : 'outline'}
									onPress={() => setIsPublic(true)}
								>
									Public
								</Button>
								<Button
									style={[styles.visibilityButton, !isPublic && styles.visibilityButtonActive]}
									appearance={!isPublic ? 'filled' : 'outline'}
									onPress={() => setIsPublic(false)}
								>
									Private
								</Button>
							</View>
							<Text category="c1" style={styles.helperText}>
								{isPublic ? 'Anyone can discover and join this quest' : 'Only you can see and complete this quest'}
							</Text>
						</View>

						<View style={styles.inputGroup}>
							<Text category="s1" style={styles.inputLabel}>
								Quest Title *
							</Text>
							<TextInput
								value={title}
								onChangeText={setTitle}
								placeholder="Find three black bikes"
								style={styles.input}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text category="s1" style={styles.inputLabel}>
								Description *
							</Text>
							<TextInput
								value={description}
								onChangeText={setDescription}
								multiline
								style={[styles.input, styles.textArea]}
								placeholder="Your task is to go around your neighborhood..."
								numberOfLines={4}
							/>
						</View>
					</Card>

					{/* Community Code Messages */}
					<Card style={styles.section}>
						<Text category="h6" style={styles.sectionTitle}>
							Community Code Messages ({markers.length})
						</Text>
						<Text style={styles.helperText}>
							Tap on the map to add a new point
						</Text>

						{prompts.map((_, idx) => (
							<GenerateCommunityCode
								idx={idx}
								key={idx}
								prompts={prompts}
								setPrompts={setPrompts}
							/>
						))}
					</Card>

					{/* Deadline Selection */}
					<Card style={styles.section}>
						<Text category="h6" style={styles.sectionTitle}>
							Quest Deadline
						</Text>

						<View style={styles.inputGroup}>
							<Button
								style={styles.dateButton}
								onPress={showDatepicker}
								appearance="outline"
							>
								{deadline.toLocaleDateString()}
							</Button>

							{showDatePicker && (
								<DateTimePicker
									testID="dateTimePicker"
									value={deadline}
									mode="date"
									onChange={(event, date) => onChange(event, date!)}
									minimumDate={new Date()}
								/>
							)}

							<Text category="c1" style={styles.dateInfo}>
								Selected: {deadline.toLocaleDateString()}
							</Text>
						</View>
					</Card>

					{/* Submit Button */}
					<Card style={styles.section}>
						<Button
							style={styles.submitButton}
							onPress={submitQuest}
							disabled={submitting || !title.trim() || prompts.length === 0}
						>
							{submitting ? 'Creating Quest...' : 'Create Quest!'}
						</Button>

						<Text category="c1" style={styles.helpText}>
							* Required fields
						</Text>
					</Card>
				</ScrollView>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	fullMap: {
		...StyleSheet.absoluteFillObject,
	},
	callout: {
		padding: 6,
		borderRadius: 6,
		backgroundColor: "#fff",
		minWidth: 100,
	},
	calloutText: {
		fontSize: 14,
		color: "red",
		fontWeight: "600",
		textAlign: "center",
	},
	bottomSheet: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: SCREEN_HEIGHT,
		backgroundColor: '#f8f9fa',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 10,
	},
	dragHandleContainer: {
		alignItems: 'center',
		paddingVertical: 12,
		backgroundColor: '#fff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	dragHandle: {
		width: 40,
		height: 5,
		backgroundColor: '#ccc',
		borderRadius: 3,
		marginBottom: 8,
	},
	sheetTitle: {
		fontWeight: 'bold',
	},
	scrollContent: {
		flex: 1,
	},
	scrollContentContainer: {
		padding: 16,
		paddingBottom: 100,
	},
	subtitle: {
		color: '#666',
		textAlign: 'center',
		marginBottom: 16,
	},
	section: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontWeight: 'bold',
		marginBottom: 12,
	},
	inputGroup: {
		marginBottom: 15,
	},
	inputLabel: {
		fontWeight: 'bold',
		marginBottom: 5,
		color: '#333',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	textArea: {
		minHeight: 80,
		textAlignVertical: 'top',
	},
	helperText: {
		fontSize: 14,
		color: '#666',
		marginBottom: 12,
	},
	dateButton: {
		width: '100%',
	},
	dateInfo: {
		color: '#666',
		marginTop: 10,
		fontWeight: 'bold',
	},
	submitButton: {
		width: '100%',
		marginBottom: 10,
	},
	helpText: {
		textAlign: 'center',
		color: '#666',
		fontStyle: 'italic',
	},
	visibilityContainer: {
		flexDirection: 'row',
		gap: 10,
	},
	visibilityButton: {
		flex: 1,
	},
	visibilityButtonActive: {
		borderWidth: 2,
	},
});
