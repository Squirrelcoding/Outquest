// app/profile.tsx or any screen
import { View, Text, StyleSheet, TextInput } from 'react-native'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { supabase } from '@/lib/supabase'
import Auth from '../components/Auth';
import { useAuth } from '../context/Auth';
import { router } from 'expo-router';
import { Button, Card } from '@ui-kitten/components';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Profile() {
	const { session, loading } = useAuth();
	const [completedQuests, setCompletedQuests] = useState<any[]>([]);
	const [leaderboardID, setLeaderboardID] = useState<string>();

	useEffect(() => {
		if (!session) return;
		(async () => {
			const { data: completedQuestData } = await supabase
				.from("submission")
				.select()
				.eq('user_id', session.user.id);
			console.log(completedQuestData);
			const questIDs = completedQuestData?.map((quest) => quest.quest_id);
			console.log(questIDs)
			const { data: particularQuestData } = await supabase
				.from("quest")
				.select("*")
				.in('id', questIDs!);
			setCompletedQuests(particularQuestData!);
		})();
	}, [session]);

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth />

	return (

		<View>
			<Text>Welcome, {session.user.email}</Text>
			<Text>Home</Text>
			<Button onPress={() => router.push('/settings')}>Go to Settings</Button>

			<Button onPress={() => router.push('/create')}>Make a quest</Button>

			<Button onPress={() => router.push('/browse')}>Browse quests</Button>
			<Button onPress={() => router.push('/test')}>Test</Button>
			<Button onPress={() => router.push('/leaderboard/make')}>Make leaderboard</Button>
			<Button onPress={() => router.push('/leaderboard/join')}>Join a leaderboard</Button>

			<View style={styles.container}>
				<Text style={styles.questsTitle}>Your completed quests</Text>
			</View>

			<TextInput onChangeText={setLeaderboardID} placeholder="Leaderboard ID" style={styles.input} />
			<Button onPress={() => router.push(`/leaderboard/show/${leaderboardID}`)}>Go</Button>
			{completedQuests && <View>
				{completedQuests.map((quest, idx: number) => {
					return <Card key={idx} onPress={() => router.push(`/posts/${quest.id}`)}>
						<Text>{quest.title}</Text>
						<Text>By {quest.author}</Text>
						<Text>{quest.description}</Text>
						<Text>Created {new Date(quest.created_at).toDateString()}</Text>
						<Text>Ends {new Date(quest.deadline).toDateString()}</Text>
					</Card>
				})}

			</View>}
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
	questsTitle: {
		textAlign: "center",
		fontSize: 25
	}
})
