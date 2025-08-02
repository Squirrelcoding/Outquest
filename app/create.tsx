import { useState, useEffect } from 'react'
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Button,
	Alert,
} from 'react-native'
import { supabase } from '../lib/supabase'
import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';
import {Calendar} from "react-native-calendars";
import { router } from 'expo-router';

export default function CreateQuest() {
	const { session, loading } = useAuth();
	
	const [title, setTitle] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [location, setLocation] = useState<string>('');
	const [prompt, setPrompt] = useState<string>('');
	const [photoQuantity, setPhotoQuantity] = useState<number>(1);
	let [selected, setSelected] = useState('');


	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth/>

	async function submitQuest() {
		// Convert selected to a Date format.
		selected = selected.replace("-", "");
		const year = selected.substring(0,4);
		const month = selected.substring(4,6);
		const day = selected.substring(6,8);
		const deadline = new Date(year, month-1, day);

		console.log("Submitting quest...");
		const { error } = await supabase.from('quest').insert({
			author: session?.user.id,
			location: location,
			created_at: new Date(),
			deadline,
			title: title,
			description: description,
			photo_prompt: prompt,
			num_photos: photoQuantity
		});
		if (error) console.error(error);

		Alert.alert("Your quest is live!");
		router.back();
	}

	return (
		<View>
			<Text style={styles.label}>Quest Title</Text>
			<TextInput
				onChangeText={setTitle}
				placeholder="Find three black bikes"
				style={styles.input}
			/>

			<Text style={styles.label}>Location</Text>
			<TextInput
				onChangeText={setLocation}
				placeholder="Chicago, IL"
				style={styles.input}
			/>

			<Text style={styles.label}>Description</Text>
			<TextInput
				multiline
				style={styles.input}
				onChangeText={setDescription}
				placeholder="Your task is to go around your neighborhood and take three pictures of three different black bikes."
				numberOfLines={4}
			/>

			<Text style={styles.label}>Photos to upload</Text>
			<TextInput
				style={styles.input}
				value={photoQuantity.toString()}
				onChangeText={(str) => setPhotoQuantity(Number(str.replace(/[^0-9]/g, '')))}
				placeholder="1"
			/>

			<Text style={styles.label}>Required photo qualities</Text>
			<TextInput
				style={styles.input}
				value={prompt}
				onChangeText={setPrompt}
				placeholder="Must be a black bike."
			/>

			<Calendar
				onDayPress={day => {
					setSelected(day.dateString);
				}}
				markedDates={{
					[selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
				}}
			/>
			<Button title={'Create Quest!'} onPress={submitQuest}/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 40,
		padding: 16,
	},
	verticallySpaced: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 6,
		padding: 12,
		fontSize: 16,
	},
	disabledInput: {
		padding: 12,
		backgroundColor: '#eee',
		borderRadius: 6,
		fontSize: 16,
		color: '#666',
	},
	button: {
		backgroundColor: '#007AFF',
		padding: 12,
		borderRadius: 6,
		alignItems: 'center',
		marginTop: 8,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	disabledButton: {
		backgroundColor: '#aaa',
	},
	buttonOutline: {
		padding: 12,
		borderRadius: 6,
		borderColor: '#007AFF',
		borderWidth: 1,
		alignItems: 'center',
		marginTop: 12,
	},
	buttonOutlineText: {
		color: '#007AFF',
		fontWeight: 'bold',
		fontSize: 16,
	},
})
