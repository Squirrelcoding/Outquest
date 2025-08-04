import { useState } from 'react'
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

export default function CreateQuest() {
	const { session, loading } = useAuth();
	
	const [leaderboardID, setLeaderboardID] = useState<string>('');

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth/>

	async function joinLeaderboard() {
		if (!session) return;
		const date = new Date();

		const { error: relationError } = await supabase.from('leaderboard').insert({
			created_at: date,
			leaderboard_id: leaderboardID,
			user_id: session.user.id
		});
		if (relationError) console.error(relationError);
		Alert.alert("Your leaderboard has been created!");
		router.back();
	}

	return (
		<View>
			<Text style={styles.label}>Leaderboard ID</Text>
			<TextInput
				onChangeText={setLeaderboardID}
				style={styles.input}
			/>
			<Button title={'Enter leaderboard ID'} onPress={joinLeaderboard}/>
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
