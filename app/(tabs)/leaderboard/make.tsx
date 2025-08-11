import { useState, useEffect } from 'react'
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Button,
	Alert,
} from 'react-native'
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';
import { router } from 'expo-router';
import uuid from "react-native-uuid";

export default function CreateQuest() {
	const { session, loading } = useAuth();
	
	const [title, setTitle] = useState<string>('');

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth/>

	async function createLeaderboard() {
		if (!session) return;
		console.log("HERE");
		const leaderboardUID = uuid.v4();
		console.log("Creating leaderboard...");
		const date = new Date();
		const { error: metaError } = await supabase.from('leaderboard meta').insert({
			created_at: date,
			leaderboard_id: leaderboardUID,
			owner_id: session.user.id,
			title
		});
		if (metaError) console.error(metaError);

		const { error: relationError } = await supabase.from('leaderboard').insert({
			created_at: date,
			leaderboard_id: leaderboardUID,
			user_id: session.user.id
		});
		if (relationError) console.error(relationError);
		Alert.alert("Your leaderboard has been created!");
		router.back();
	}

	return (
		<View>
			<Text style={styles.label}>Leaderboard Title</Text>
			<TextInput
				onChangeText={setTitle}
				style={styles.input}
			/>
			<Button title={'Create Leaderboard!'} onPress={createLeaderboard}/>
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
