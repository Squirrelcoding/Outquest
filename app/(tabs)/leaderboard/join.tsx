import { useState } from 'react'
import {
	View,
	TextInput,
	StyleSheet,
	Alert,
} from 'react-native'
import { Button, Text } from "@ui-kitten/components";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/Auth';
import { Redirect, router } from 'expo-router';

export default function CreateQuest() {
	const { session, loading } = useAuth();

	const [leaderboardID, setLeaderboardID] = useState<string>('');

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Redirect href="/(auth)" />

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

	const navigateToLeaderboard = () => {
		if (!leaderboardID.trim()) {
			Alert.alert('Error', 'Please enter a leaderboard ID');
			return;
		}
		router.push(`/leaderboard/show/${leaderboardID.trim()}`);
	};

	return (
		<View style={styles.leaderboardInputSection}>
			<Text category="s1" style={styles.inputLabel}>
				Enter Leaderboard ID:
			</Text>
			<TextInput
				value={leaderboardID}
				onChangeText={setLeaderboardID}
				placeholder="Leaderboard ID"
				style={styles.leaderboardInput}
			/>
			<Button
				style={styles.goButton}
				onPress={navigateToLeaderboard}
				disabled={!leaderboardID.trim()}
			>
				Go to Leaderboard
			</Button>
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
		backgroundColor: '#32908F',
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
		borderColor: '#32908F',
		borderWidth: 1,
		alignItems: 'center',
		marginTop: 12,
	},
	buttonOutlineText: {
		color: '#32908F',
		fontWeight: 'bold',
		fontSize: 16,
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
	welcomeText: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	emailText: {
		color: '#666',
	},
	section: {
		margin: 10,
		marginBottom: 10,
	},
	sectionTitle: {
		marginBottom: 15,
		fontWeight: 'bold',
	},
	buttonGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	actionButton: {
		width: '48%',
		marginBottom: 10,
		backgroundColor: "#32908F",
		borderColor: "white"
	},
	leaderboardSection: {
		gap: 15,
	},
	leaderboardButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	leaderboardButton: {
		width: '48%',
		backgroundColor: "#32908F",
		borderColor: "white"
	},
	leaderboardInputSection: {
		gap: 10,
	},
	inputLabel: {
		fontWeight: 'bold',
	},
	leaderboardInput: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	goButton: {
		marginTop: 5,
	},
	loadingSection: {
		alignItems: 'center',
		padding: 20,
	},
	emptySection: {
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		textAlign: 'center',
		marginBottom: 15,
		color: '#666',
	},
	emptyButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
	emptyButton: {
		width: '48%',
		backgroundColor: "#32908F",
		borderColor: "white"
	},
	browseButton: {
		width: '100%',
	},
	leaderboardsList: {
		gap: 10,
	},
	leaderboardCard: {
		marginBottom: 10,
	},
	leaderboardTitle: {
		fontWeight: 'bold',
		marginBottom: 8,
	},
	leaderboardInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	leaderboardDate: {
		color: '#666',
		fontSize: 12,
	},
	ownerBadge: {
		color: '#32908F',
		fontWeight: 'bold',
		fontSize: 12,
	},
	questsList: {
		gap: 10,
	},
	questCard: {
		marginBottom: 10,
	},
	questTitle: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	questAuthor: {
		color: '#666',
		marginBottom: 8,
	},
	questDescription: {
		marginBottom: 10,
		lineHeight: 20,
	},
	questDates: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	questDate: {
		color: '#888',
		fontSize: 12,
	},
})