import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { useAuth } from '../../context/Auth';
import { Redirect, router } from 'expo-router';
import { Button, Card, Layout, Text } from '@ui-kitten/components';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Achievement, Completion, Quest } from '@/types';

export default function Page() {
	const { session, loading } = useAuth();
	const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
	const [loadingQuests, setLoadingQuests] = useState<boolean>(false);
	const [usernames, setUsernames] = useState<string[]>([]);
	const [streak, setStreak] = useState<number>(1);
	const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
	const [achievements, setAchievements] = useState<Achievement[]>([]);

	// Load user's completed quests
	useEffect(() => {
		if (!session) return;

		const loadCompletedQuests = async () => {
			try {
				setLoadingQuests(true);

				// Get user's completed quest submissions
				const { data: rawQuestData } = await supabase
					.from("completion")
					.select('*')
					.eq('user_id', session.user.id);

				const { data: rawAchievementData } = await supabase
					.from("achievement")
					.select('*')
					.eq('user_id', session.user.id);
					
				const completedQuests: Completion[] = rawQuestData!;
				const achievements: Achievement[] = rawAchievementData!;
				const completedQuestIDs = completedQuests.map((q) => q.quest_id);
				const achievementIDs = achievements.map((q) => q.achievement_name);
				console.log(achievementIDs);
				const usernames = await Promise.all(
					completedQuests!.map(async (quest) => {
						const { data: usernameData, error: usernameError } = await supabase.from("profile").select("*").eq('id', quest.user_id);
						if (usernameError) throw usernameError;
						return usernameData[0].username;
					})
				);

				const { data: achievementData, error: achievementError } = await supabase.from("achievement id").select("*").in('id', achievementIDs);
				console.log(achievementData);
				if (achievementError) throw achievementError;


				const { data: questData } = await supabase
					.from("quest")
					.select("*")
					.in("id", completedQuestIDs);

				setUsernames(usernames);
				setCompletedQuests(questData || []);
				setAchievements(achievementData!);
			} catch (error) {
				console.error('Error loading completed quests:', error);
				Alert.alert('Error', 'Failed to load your completed quests');
			} finally {
				setLoadingQuests(false);
			}
		};

		// Count towards the daily login streak
		const insertLogin = async () => {
			await supabase.from("login").insert({
				user_id: session.user.id
			});
		}

		const loadUserStreak = async () => {
			const { data: rawLoginData } = await supabase
				.from("login")
				.select('*');
			let dates = rawLoginData?.map((x) => new Date(x.created_at))!;
			dates.sort((a, b) => b.getTime() - a.getTime());
			let res = 1;
			for (let i = dates.length - 1; i > 0; i--) {
				// Ensure that the two dates are within a day
				if (dates[i].getTime() - dates[i - 1].getTime() > 86400) {
					break;
				}
				res++;
			}
			setStreak(res);
		}

		const fetchPendingAchievements = async () => {
			const { data } = await supabase.from("achievement")
				.select("*")
				.eq("user_id", session.user.id)
				.eq("announced", false);
			setAchievementQueue(data!);

			// Set all of them to true now.
			const { error } = await supabase.from("achievement")
				.update({ "announced": true })
				.eq("user_id", session.user.id);
			console.log("updated info")
			if (error) throw error;
		}

		insertLogin();
		loadUserStreak();
		loadCompletedQuests();
		fetchPendingAchievements();
	}, [session]);


	if (loading) return (
		<Layout style={styles.loadingContainer}>
			<Text category="h6">Loading...</Text>
		</Layout>
	);

	if (!session) {
		return <Redirect href={`/(auth)`} />;
	}

	for (const achievement of achievementQueue) {
		Alert.alert(`Congratulations! You won the achievement: ${achievement.achievement_name}`);
	}

	return (
		<ScrollView style={styles.container}>
			{/* Header Section */}
			<Layout style={styles.header}>
				<Text category="h4" style={styles.welcomeText}>
					Welcome back!
				</Text>
				<Text category="s1" style={styles.emailText}>
					Your daily streak is {streak} days - good job!
				</Text>
			</Layout>



			{/* Completed Quests Section */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Your Completed Quests ({completedQuests.length})
				</Text>

				{loadingQuests ? (
					<View style={styles.loadingSection}>
						<Text category="s1">Loading your quests...</Text>
					</View>
				) : completedQuests.length === 0 ? (
					<View style={styles.emptySection}>
						<Text category="s1" style={styles.emptyText}>
							You haven&apos;t completed any quests yet.
						</Text>
						<Button
							style={styles.browseButton}
							onPress={() => router.push('/browse')}
						>
							Browse Available Quests
						</Button>
					</View>
				) : (
					<View style={styles.questsList}>
						{completedQuests.map((quest, idx) => (
							<Card
								key={idx}
								style={styles.questCard}
								onPress={() => router.push(`/browse/posts/${quest.type}/${quest.id}`)}
							>
								<Text category="h6" style={styles.questTitle}>
									{quest.title}
								</Text>
								<Text category="s1" style={styles.questAuthor}>
									By {usernames[idx] || quest.author}
								</Text>
								<Text category="p2" style={styles.questDescription}>
									{quest.description}
								</Text>
								<View style={styles.questDates}>
									<Text category="c1" style={styles.questDate}>
										Created: {new Date(quest.created_at!).toLocaleDateString()}
									</Text>
									<Text category="c1" style={styles.questDate}>
										Ends: {new Date(quest.deadline!).toLocaleDateString()}
									</Text>
								</View>
							</Card>
						))}
					</View>
				)}
			</Card>


			{/* Completed Quests Section */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Your Achievements
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
});