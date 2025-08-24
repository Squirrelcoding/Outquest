import { Button, Card, Layout, Text } from "@ui-kitten/components";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, TextInput, Alert, } from "react-native";
import MapView, { Marker, MapPressEvent, Callout } from "react-native-maps";
import GenerateLocationCode from '@/components/GenerateLocation';
import { Redirect, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/Auth";
import DateTimePicker from '@react-native-community/datetimepicker';

type MarkerType = {
	id: string;
	latitude: number;
	longitude: number;
};

enum QUEST_TYPE {
	PHOTO,
	LOCATION,
	PATH
}

type LocationType = {
	id: string;
	message: string;
}

export default function MultiMarkerMap() {
	const { session, loading } = useAuth();
	const [markers, setMarkers] = useState<MarkerType[]>([]);
	const [title, setTitle] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [deadline, setDeadline] = useState<Date>(new Date());
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [prompts, setPrompts] = useState<LocationType[]>([]);
	const [winnerMessages, setWinnerMessages] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState<boolean>(false);

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

			// Also add a new thing to the Location codes at the bottom
			setPrompts((prev) => [...prev, {
				id,
				message: ""
			}])
		} catch (error) {
			console.error('Error in handleMapPress:', error);
		}
	}, []);

	const handleMarkerDelete = useCallback((id: string) => {
		try {
			console.log(`Attempting to delete marker: ${id}`);

			setMarkers((prevMarkers) => {
				console.log('Current markers before delete:', prevMarkers.length);
				const markerToDelete = prevMarkers.find(m => m.id === id);

				if (!markerToDelete) {
					console.warn(`Marker with id ${id} not found in current markers`);
					return prevMarkers;
				}

				const newMarkers = prevMarkers.filter((m) => m.id !== id);
				console.log('Markers after delete:', newMarkers.length);
				return newMarkers;
			});
			setPrompts((prevPrompts) => prevPrompts.filter((m) => m.id !== id));
		} catch (error) {
			console.error('Error in handleMarkerDelete:', error);
		}
	}, []);


	if (loading) return (
		<Layout style={styles.loadingContainer}>
			<Text category="h6">Loading...</Text>
		</Layout>
	);

	if (!session) return <Redirect href="/(auth)" />;

	const onChange = (event: any, selectedDate: any) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDeadline(selectedDate);
		}
	};

	const showDatepicker = () => {
		setShowDatePicker(true);
	};

	const submitQuest = async () => {
		// Validate required fields
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
		if (prompts.length < 1) {
			Alert.alert('Error', 'Please enter a valid number of photos (minimum 1)');
			return;
		}

		// Validate deadline is in the future
		const now = new Date();
		if (deadline <= now) {
			Alert.alert('Error', 'Deadline must be in the future');
			return;
		}

		try {
			setSubmitting(true);


			// Insert the quest to the quest table
			console.log({
				author: session.user.id,
				created_at: new Date(),
				deadline: deadline,
				title: title.trim(),
			})
			const { data: quest, error } = await supabase.from('quest').insert({
				author: session.user.id,
				description,
				created_at: new Date(),
				deadline: deadline,
				title: title.trim(),
				type: "LOCATION"
			})
				.select("id")
				.single();
			if (error) {
				console.error('Insert error:', error);
			} else {
				console.log('New record ID:', quest.id);
			}

			// Insert in all of the subqeusts of the quest into the subquest table
			const processedSubquests = prompts.map((prompt, i) => {
				return {
					quest_id: quest!.id,
					prompt: JSON.stringify({...prompt, ...markers[i]}),
				}
			});
			const { error: bulkError } = await supabase.from("subquest").insert(processedSubquests);

			// Insert all of the winner messages if any.
			const processedMessages = winnerMessages.map((message, idx) => {
				return {
					quest_id: quest!.id,
					content: message,
					place: (idx + 1 === winnerMessages.length ? 0 : idx + 1)
				}
			});
			const { error: messageError } = await supabase.from("message")
				.insert(processedMessages);

			if (error || bulkError || messageError) {
				console.error('Error creating quest:', error);
				console.error('Error creating quest:', bulkError);
				console.error('Error creating quest:', messageError);
				Alert.alert('Error', 'Failed to create quest. Please try again.');
				return;
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
			<MapView
				style={styles.map}
				initialRegion={{
					latitude: 37.78825,
					longitude: -122.4324,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				}}
				onPress={handleMapPress}
			>
				{markers.map((marker) => {
					// Add safety check for marker data
					if (!marker || typeof marker.latitude !== 'number' || typeof marker.longitude !== 'number') {
						console.warn('Invalid marker data:', marker);
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
									console.log(`Callout pressed for marker: ${marker.id}`);
									// Use setTimeout to delay the deletion slightly
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

			{/* Debug info */}
			<View style={styles.debugInfo}>
				<Text style={styles.debugText}>Markers: {markers.length}</Text>
			</View>
			<ScrollView style={styles.container}>
				<Layout style={styles.header}>
					<Text category="h4" style={styles.headerTitle}>
						Create Location Quest
					</Text>
					<Text category="s1" style={styles.headerSubtitle}>
						Design a Location-based challenge for other adventurers
					</Text>
				</Layout>

				{/* Quest Details */}
				<Card style={styles.section}>
					<Text category="h6" style={styles.sectionTitle}>
						Quest Information
					</Text>

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
							placeholder="Your task is to go around your neighborhood and take three pictures of three different black bikes."
							numberOfLines={4}
						/>
					</View>
				</Card>

				{/* Photo Requirements */}
				<Card style={styles.section}>
					<Text category="h6" style={styles.sectionTitle}>
						Location Code Messages
					</Text>
					<Text>
						Tap on the map to add a new point
					</Text>

					{
						Array(prompts.length).fill(0).map((_, idx) => {
							return <GenerateLocationCode
								idx={idx}
								key={idx}
								prompts={prompts}
								setPrompts={setPrompts}
							/>
						})
					}

				</Card>



				{/* Deadline Selection */}
				<Card style={styles.section}>
					<Text category="h6" style={styles.sectionTitle}>
						Quest Deadline
					</Text>

					<View style={styles.inputGroup}>
						<Text category="s1" style={styles.inputLabel}>
							Quest Deadline
						</Text>
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
								onChange={onChange}
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	map: { height: "50%" },
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
	debugInfo: {
		position: 'absolute',
		top: 50,
		left: 10,
		backgroundColor: 'rgba(0,0,0,0.7)',
		padding: 8,
		borderRadius: 4,
	},
	debugText: {
		color: 'white',
		fontSize: 12,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	header: {
		padding: 20,
		alignItems: 'center',
		backgroundColor: '#fff',
		marginBottom: 10,
	},
	headerTitle: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	headerSubtitle: {
		color: '#666',
		textAlign: 'center',
	},
	section: {
		margin: 10,
		marginBottom: 10,
	},
	sectionTitle: {
		fontWeight: 'bold',
		marginBottom: 15,
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
});