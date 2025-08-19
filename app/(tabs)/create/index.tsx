import { SetStateAction, useState } from 'react'
import {
	View,
	TextInput,
	StyleSheet,
	Alert,
	ScrollView,
} from 'react-native'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '@/context/Auth';
import { Button, Card, Text, Layout } from '@ui-kitten/components';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Redirect, router } from 'expo-router';
import SubquestInput from './SubquestInput';
import { randomUUID } from 'expo-crypto';

export default function CreateQuest() {
	const { session, loading } = useAuth();

	const [title, setTitle] = useState<string>('');
	const [location, setLocation] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [photoQuantity, setPhotoQuantity] = useState<number>(1);
	const [deadline, setDeadline] = useState<Date>(new Date());
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [prompts, setPrompts] = useState<string[]>([""]);
	const [promptComponents, setPromptComponents] = useState<any>();
	const [submitting, setSubmitting] = useState<boolean>(false);

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
		if (photoQuantity < 1) {
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
				location: location.trim() || null,
				created_at: new Date(),
				deadline: deadline,
				title: title.trim(),
				num_photos: photoQuantity
			})
			const { data: quest, error } = await supabase.from('quest').insert({
				author: session.user.id,
				description,
				location: location.trim() || null,
				created_at: new Date(),
				deadline: deadline,
				title: title.trim(),
			})
				.select("id")
				.single();
			if (error) {
				console.error('Insert error:', error);
			} else {
				console.log('New record ID:', quest.id);
			}

			// Insert in all of the subqeusts of the quest into the subquest table
			const processedSubquests = prompts.map((prompt) => {
				return {
					quest_id: quest!.id,
					prompt
				}
			});
			const { error: bulkError } = await supabase.from("subquest").insert(processedSubquests);

			if (error || bulkError) {
				console.error('Error creating quest:', error);
				console.error('Error creating quest:', bulkError);
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

	const addPrompt = () => {
		// Check if latest prompt is non empty
		console.log(prompts)
		if (prompts[prompts.length - 1] === "") {
			return false;
		}

		setPrompts([...prompts, ""]);
	}

	return (
		<ScrollView style={styles.container}>
			<Layout style={styles.header}>
				<Text category="h4" style={styles.headerTitle}>
					Create New Quest
				</Text>
				<Text category="s1" style={styles.headerSubtitle}>
					Design a challenge for other adventurers
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
						Location (Optional)
					</Text>
					<TextInput
						value={location}
						onChangeText={setLocation}
						placeholder="Chicago, IL"
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
					Photo Requirements
				</Text>

				{
					Array(prompts.length).fill(0).map((_, idx) => {
						return <SubquestInput idx={idx} key={idx} prompts={prompts} setPrompts={setPrompts} />
					})
				}

				<Button onPress={addPrompt}>Add new prompt</Button>

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
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
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
