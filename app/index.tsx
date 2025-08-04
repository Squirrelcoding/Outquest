import { View, StyleSheet, TextInput, ScrollView, Alert } from 'react-native'
import Auth from '../components/Auth';
import { useAuth } from '../context/Auth';
import { router } from 'expo-router';
import { Button, Card, Layout, Text } from '@ui-kitten/components';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Page() {
	const { session, loading } = useAuth();
	const [completedQuests, setCompletedQuests] = useState<any[]>([]);
	const [leaderboardID, setLeaderboardID] = useState<string>('');
	const [loadingQuests, setLoadingQuests] = useState<boolean>(false);
	const [usernames, setUsernames] = useState<string[]>([]);
	const [userLeaderboards, setUserLeaderboards] = useState<any[]>([]);
	const [loadingLeaderboards, setLoadingLeaderboards] = useState<boolean>(false);

	// Load user's completed quests
	useEffect(() => {
		if (!session) return;

		const loadCompletedQuests = async () => {
			try {
				setLoadingQuests(true);

				// Get user's completed quest submissions
				const { data: completedQuestData, error: submissionError } = await supabase
					.from("submission")
					.select('quest_id')
					.eq('user_id', session.user.id);

				if (submissionError) {
					console.error('Error loading submissions:', submissionError);
					return;
				}

				if (!completedQuestData || completedQuestData.length === 0) {
					setCompletedQuests([]);
					return;
				}

				// Get quest details for completed quests
				const questIDs = completedQuestData.map((quest) => quest.quest_id);
				let { data: questData, error: questError } = await supabase
					.from("quest")
					.select("*")
					.in('id', questIDs);

				if (questError) {
					console.error('Error loading quests:', questError);
					return;
				}

				const usernames = await Promise.all(
					questData!.map(async (quest) => {
						const { data: usernameData, error: usernameError } = await supabase.from("profile").select("*").eq('id', quest.author);
						if (usernameError) throw usernameError;
						return usernameData[0].username;
					})
				);
				setUsernames(usernames);
				setCompletedQuests(questData || []);
			} catch (error) {
				console.error('Error loading completed quests:', error);
				Alert.alert('Error', 'Failed to load your completed quests');
			} finally {
				setLoadingQuests(false);
			}
		};

		loadCompletedQuests();
	}, [session]);

	// Load user's leaderboards
	useEffect(() => {
		if (!session) return;

		const loadUserLeaderboards = async () => {
			try {
				setLoadingLeaderboards(true);

				// Get all leaderboards the user is in
				const { data: userLeaderboardData, error: leaderboardError } = await supabase
					.from('leaderboard')
					.select('leaderboard_id')
					.eq('user_id', session.user.id);

				if (leaderboardError) {
					console.error('Error loading user leaderboards:', leaderboardError);
					return;
				}

				if (!userLeaderboardData || userLeaderboardData.length === 0) {
					setUserLeaderboards([]);
					return;
				}

				// Get leaderboard metadata for each leaderboard
				const leaderboardIDs = userLeaderboardData.map((lb) => lb.leaderboard_id);
				const { data: leaderboardMetaData, error: metaError } = await supabase
					.from('leaderboard meta')
					.select('*')
					.in('leaderboard_id', leaderboardIDs);

				if (metaError) {
					console.error('Error loading leaderboard metadata:', metaError);
					return;
				}

				setUserLeaderboards(leaderboardMetaData || []);
			} catch (error) {
				console.error('Error loading user leaderboards:', error);
				Alert.alert('Error', 'Failed to load your leaderboards');
			} finally {
				setLoadingLeaderboards(false);
			}
		};

		loadUserLeaderboards();
	}, [session]);

	// Navigation handlers
	const navigateToLeaderboard = () => {
		if (!leaderboardID.trim()) {
			Alert.alert('Error', 'Please enter a leaderboard ID');
			return;
		}
		router.push(`/leaderboard/show/${leaderboardID.trim()}`);
	};

	if (loading) return (
		<Layout style={styles.loadingContainer}>
			<Text category="h6">Loading...</Text>
		</Layout>
	);

	if (!session) return <Auth />;

	return (
		<ScrollView style={styles.container}>
			{/* Header Section */}
			<Layout style={styles.header}>
				<Text category="h4" style={styles.welcomeText}>
					Welcome back!
				</Text>
				<Text category="s1" style={styles.emailText}>
					{session.user.email}
				</Text>
			</Layout>

			{/* Quick Actions Section */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Quick Actions
				</Text>
				<View style={styles.buttonGrid}>
					<Button
						style={styles.actionButton}
						onPress={() => router.push('/browse')}
					>
						Browse Quests
					</Button>
					<Button
						style={styles.actionButton}
						onPress={() => router.push('/create')}
					>
						Create Quest
					</Button>
					<Button
						style={styles.actionButton}
						onPress={() => router.push('/settings')}
					>
						Settings
					</Button>
					<Button
						style={styles.actionButton}
						onPress={() => router.push('/test')}
					>
						Test
					</Button>
				</View>
			</Card>

			{/* User's Leaderboards Section */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Your Leaderboards ({userLeaderboards.length})
				</Text>

				{loadingLeaderboards ? (
					<View style={styles.loadingSection}>
						<Text category="s1">Loading your leaderboards...</Text>
					</View>
				) : userLeaderboards.length === 0 ? (
					<View style={styles.emptySection}>
						<Text category="s1" style={styles.emptyText}>
							You haven&apos;t joined any leaderboards yet.
						</Text>
						<View style={styles.emptyButtons}>
							<Button
								style={styles.emptyButton}
								onPress={() => router.push('/leaderboard/make')}
							>
								Create Leaderboard
							</Button>
							<Button
								style={styles.emptyButton}
								onPress={() => router.push('/leaderboard/join')}
							>
								Join Leaderboard
							</Button>
						</View>
					</View>
				) : (
					<View style={styles.leaderboardsList}>
						{userLeaderboards.map((leaderboard, idx) => (
							<Card
								key={idx}
								style={styles.leaderboardCard}
								onPress={() => router.push(`/leaderboard/show/${leaderboard.leaderboard_id}`)}
							>
								<Text category="h6" style={styles.leaderboardTitle}>
									{leaderboard.title}
								</Text>
								<View style={styles.leaderboardInfo}>
									<Text category="s1" style={styles.leaderboardDate}>
										Created: {new Date(leaderboard.created_at).toLocaleDateString()}
									</Text>
									{leaderboard.owner_id === session.user.id && (
										<Text category="c1" style={styles.ownerBadge}>
											👑 Owner
										</Text>
									)}
								</View>
							</Card>
						))}
					</View>
				)}
			</Card>

			{/* Leaderboard Actions Section */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Leaderboard Actions
				</Text>
				<View style={styles.leaderboardSection}>
					<View style={styles.leaderboardButtons}>
						<Button
							style={styles.leaderboardButton}
							onPress={() => router.push('/leaderboard/make')}
						>
							Create Leaderboard
						</Button>
						<Button
							style={styles.leaderboardButton}
							onPress={() => router.push('/leaderboard/join')}
						>
							Join Leaderboard
						</Button>
					</View>

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
				</View>
			</Card>

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
								onPress={() => router.push(`/posts/${quest.id}`)}
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
										Created: {new Date(quest.created_at).toLocaleDateString()}
									</Text>
									<Text category="c1" style={styles.questDate}>
										Ends: {new Date(quest.deadline).toLocaleDateString()}
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
		color: '#007AFF',
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