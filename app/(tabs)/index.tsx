import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { useAuth } from '../../context/Auth';
import { Redirect, router } from 'expo-router';
import { Button, Card, Layout, Text } from '@ui-kitten/components';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Achievement, Completion, Quest } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_MILESTONES = [3, 5, 10, 20, 50, 100, 200, 365];
const STREAK_MILESTONE_IDs = [3, 4, 5, 6, 7, 8, 9, 10];

export default function Page() {
	const { session, loading } = useAuth();
	const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
	const [userOwnedQuests, setUserOwnedQuests] = useState<Quest[]>([]);
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
			await AsyncStorage.setItem('currentEvent', "0");
			console.log("SET THE CURRENT EVENT!!!");
			await supabase.from("login").insert({
				user_id: session.user.id
			});
		}

		const awardStreakAchievement = async (streak: number) => {
			// Get the user's current achievements
			const { data: userAchievements, error: achievementErrors } = await supabase
				.from("achievement")
				.select("*")
				.eq("user_id", session.user.id);

			if (achievementErrors) throw achievementErrors;

			// Get achievement names the user already has
			const existingAchievementIDs = userAchievements?.map(a => a.id) || [];

			// Check which milestones the user has reached
			for (let i = 0; i < STREAK_MILESTONES.length; i++) {
				const milestone = STREAK_MILESTONES[i];
				const achievementId = STREAK_MILESTONE_IDs[i];

				// If user's streak meets or exceeds this milestone
				if (streak >= milestone) {
					// Check if they already have this achievement
					if (!existingAchievementIDs.includes(achievementId)) {
						// Award the achievement
						const { error: insertError } = await supabase
							.from("achievement")
							.insert({
								user_id: session.user.id,
								achievement_name: achievementId,
								announced: false
							});

						if (insertError) {
							console.error(`Error awarding achievement ${achievementId}:`, insertError);
						}
					}
				}
			}
		}

		const calculateLoginStreak = async () => {
			const { data: rawLoginData } = await supabase
				.from("login")
				.select('*');
			let dates = rawLoginData?.map((x) => new Date(x.created_at))!;


			if (!dates || dates.length === 0) return 0;

			// Get unique dates (just the date part, not time)
			const uniqueDates = [...new Set(
				dates.map(d => new Date(d.setHours(0, 0, 0, 0)).getTime())
			)].sort((a, b) => b - a); // Sort descending (most recent first)

			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const todayTime = today.getTime();

			// Check if most recent login is today or yesterday
			const mostRecentLogin = uniqueDates[0];
			const daysSinceMostRecent = Math.floor((todayTime - mostRecentLogin) / (1000 * 60 * 60 * 24));

			// If last login was more than 1 day ago, streak is broken
			if (daysSinceMostRecent > 1) return 0;

			// If last login was today, streak starts at 1
			// If last login was yesterday, streak starts at 1 (yesterday counts)
			let streak = 1;

			// Count consecutive days going backwards
			for (let i = 1; i < uniqueDates.length; i++) {
				const currentDate = uniqueDates[i];
				const previousDate = uniqueDates[i - 1];
				const daysDiff = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));

				// If exactly 1 day apart, continue streak
				if (daysDiff === 1) {
					streak++;
				} else {
					// Gap in logins, streak ends
					break;
				}
			}

			awardStreakAchievement(streak);
		}

		const loadAchievements = async () => {
			const { data } = await supabase.from("achievement")
				.select("*")
				.eq("user_id", session.user.id)
			// .eq("announced", false);

			const unnanouncedAchievements = data!.filter((achievement) => achievement!.announced === false);
			setAchievementQueue(unnanouncedAchievements!);

			// Set all of them to true now.
			const { error } = await supabase.from("achievement")
				.update({ "announced": true })
				.eq("user_id", session.user.id);
			console.log("updated info")
			if (error) throw error;

			// Set all of the achievements so the viewer can see them
			setAchievements(data!);
		}

		const loadUserOwnedQuests = async () => {
			const { data } = await supabase.from("quest")
				.select("*")
				.eq("author", session.user.id);

			// Set all of the achievements so the viewer can see them
			setUserOwnedQuests(data!);
		}

		insertLogin();
		calculateLoginStreak();
		loadCompletedQuests();
		loadAchievements();
		loadUserOwnedQuests();
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
					Your daily streak is {streak} {streak === 1 ? 'day' : 'days'} - good job!
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
										Starts: {new Date(quest.created_at!).toLocaleDateString()}
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
				<View>
					{achievements.map((achievement: any, idx) => (
						<Card
							key={idx}
							style={styles.questCard}
							onPress={() => router.push(`/(tabs)/viewAchievement/${achievement.id}`)}
						>
							<Text>{achievement["name"]}</Text>
						</Card>
					))}
				</View>
			</Card>

			{/* user-owned quests Section */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Manage your Quests ({userOwnedQuests.length})
				</Text>

				{loadingQuests ? (
					<View style={styles.loadingSection}>
						<Text category="s1">Loading your quests...</Text>
					</View>
				) : userOwnedQuests.length === 0 ? (
					<View style={styles.emptySection}>
						<Text category="s1" style={styles.emptyText}>
							You haven&apos;t created any quests yet.
						</Text>
						<Button
							style={styles.browseButton}
							onPress={() => router.push('/create')}
						>
							Create Your First Quest
						</Button>
					</View>
				) : (
					<View style={styles.questsList}>
						{userOwnedQuests.map((quest, idx) => (
							<Card
								key={idx}
								style={styles.questCard}
								onPress={() => router.push(`/admin/${quest.id}`)}
							>
								<Text category="h6" style={styles.questTitle}>
									{quest.title}
								</Text>
								<Text category="p2" style={styles.questDescription}>
									{quest.description}
								</Text>
								<View style={styles.questDates}>
									<Text category="c1" style={styles.questDate}>
										Starts: {new Date(quest.created_at!).toLocaleDateString()}
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