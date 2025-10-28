import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Card, Input, Toggle, Button, Divider, Spinner } from '@ui-kitten/components';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/Auth';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface Quest {
	id: number;
	title: string;
	description: string;
	is_public: boolean;
	type: string;
	author_id: string;
	created_at: string;
	deadline: string;
}

export default function AdminQuestPage() {
	const { id } = useLocalSearchParams();
	const { session } = useAuth();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [quest, setQuest] = useState<Quest | null>(null);

	// Form state
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [isPublic, setIsPublic] = useState(false);
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date());
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);

	useEffect(() => {
		(async () => {
			await fetchQuest();
		})();
	}, [id]);

	const fetchQuest = async () => {
		try {
			const { data, error } = await supabase
				.from('quest')
				.select('*')
				.eq('id', id)
				.single();

			if (error) throw error;

			if (data) {
				setQuest(data);
				setTitle(data.title);
				setDescription(data.description);
				setIsPublic(data.is_public);
				setStartDate(new Date(data.created_at));
				setEndDate(new Date(data.deadline));
			}
		} catch (error) {
			console.error('Error fetching quest:', error);
			Alert.alert('Error', 'Failed to load quest details');
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		if (!session) {
			Alert.alert('Error', 'You must be logged in to edit quests');
			return;
		}

		if (!quest) return;

		// Verify ownership
		if (quest.author_id !== session.user.id) {
			Alert.alert('Error', 'You can only edit your own quests');
			return;
		}

		setSaving(true);
		try {
			const { error } = await supabase
				.from('quests')
				.update({
					title,
					description,
					is_public: isPublic,
					created_at: startDate.toISOString(),
					deadline: endDate.toISOString(),
				})
				.eq('id', id);

			if (error) throw error;

			Alert.alert('Success', 'Quest updated successfully');
		} catch (error) {
			console.error('Error updating quest:', error);
			Alert.alert('Error', 'Failed to update quest');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = () => {
		Alert.alert(
			'Delete Quest',
			'Are you sure you want to delete this quest? This action cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							const { error } = await supabase
								.from('quests')
								.delete()
								.eq('id', id);

							if (error) throw error;

							router.replace('/(tabs)');
						} catch (error) {
							console.error('Error deleting quest:', error);
							Alert.alert('Error', 'Failed to delete quest');
						}
					},
				},
			]
		);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<Spinner />
			</View>
		);
	}

	if (!quest) {
		return (
			<View style={styles.container}>
				<Text category="h5">Quest not found</Text>
			</View>
		);
	}

	const onStartDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
		setShowStartPicker(false);
		if (selectedDate) {
			setStartDate(selectedDate);
		}
	};

	const onEndDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
		setShowEndPicker(false);
		if (selectedDate) {
			setEndDate(selectedDate);
		}
	};

	return (
		<ScrollView style={styles.container}>
			<Card style={styles.card}>
				<Text category="h5" style={styles.header}>Edit Quest</Text>
				
				<Input
					label="Title"
					value={title}
					onChangeText={setTitle}
					style={styles.input}
					placeholder="Enter quest title"
				/>				<Input
					label="Description"
					value={description}
					onChangeText={setDescription}
					multiline
					textStyle={{ minHeight: 64 }}
					style={styles.input}
					placeholder="Enter quest description"
				/>

				<Toggle
					checked={isPublic}
					onChange={setIsPublic}
					style={styles.toggle}
				>
					{`Quest is ${isPublic ? 'public' : 'private'}`}
				</Toggle>

				<View style={styles.dateContainer}>
					<Button
						appearance="outline"
						status="basic"
						onPress={() => setShowStartPicker(true)}
						style={styles.dateButton}
					>
						Start Date: {startDate.toLocaleDateString()}
					</Button>

					<Button
						appearance="outline"
						status="basic"
						onPress={() => setShowEndPicker(true)}
						style={styles.dateButton}
					>
						End Date: {endDate.toLocaleDateString()}
					</Button>

					{showStartPicker && (
						<DateTimePicker
							value={startDate}
							mode="date"
							onChange={onStartDateChange}
							minimumDate={new Date()}
						/>
					)}

					{showEndPicker && (
						<DateTimePicker
							value={endDate}
							mode="date"
							onChange={onEndDateChange}
							minimumDate={startDate}
						/>
					)}
				</View>

				<View style={styles.buttonContainer}>
					<Button
						onPress={handleSave}
						disabled={saving}
						style={styles.button}
					>
						{saving ? 'Saving...' : 'Save Changes'}
					</Button>

					<Button
						onPress={handleDelete}
						status="danger"
						style={styles.button}
					>
						Delete Quest
					</Button>
				</View>
			</Card>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	card: {
		marginBottom: 16,
	},
	header: {
		marginBottom: 16,
	},
	input: {
		marginBottom: 12,
	},
	toggle: {
		marginBottom: 16,
	},
	dateContainer: {
		marginBottom: 16,
		gap: 8,
	},
	dateButton: {
		marginVertical: 4,
	},
	buttonContainer: {
		gap: 8,
	},
	button: {
		marginVertical: 4,
	},
});
