import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
	Alert,
	ScrollView,
	View,
	StyleSheet,
} from 'react-native';
import { Card, Text, Layout, Button, Avatar } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';

export default function LeaderboardDetail() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();

	const [leaderboardData, setLeaderboardData] = useState<any>(null);
	const [users, setUsers] = useState<any[]>([]);
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const [loadingData, setLoadingData] = useState<boolean>(true);
	const [userStats, setUserStats] = useState<any>({});

	useEffect(() => {
		if (!session) return;

		const loadLeaderboardData = async () => {
			try {
				setLoadingData(true);

				// Load leaderboard metadata
				const { data: metaData, error: metaError } = await supabase
					.from('leaderboard meta')
					.select('*')
					.eq('leaderboard_id', id)
					.single();

				if (metaError) {
					console.error('Error loading leaderboard metadata:', metaError);
					Alert.alert('Error', 'Failed to load leaderboard information');
					return;
				}

				setLeaderboardData(metaData);
				setIsOwner(metaData.owner_id === session.user.id);

				// Load users in the leaderboard
				const { data: userIDData, error: userIDError } = await supabase
					.from('leaderboard')
					.select('user_id, created_at')
					.eq('leaderboard_id', id)
					.order('created_at', { ascending: true });

				if (userIDError) {
					console.error('Error loading leaderboard users:', userIDError);
					return;
				}

				if (userIDData && userIDData.length > 0) {
					const userIDs = userIDData.map((user) => user.user_id);
					
					// Load user profiles
					const { data: userData, error: userError } = await supabase
						.from('profile')
						.select('*')
						.in('id', userIDs);

					if (userError) {
						console.error('Error loading user profiles:', userError);
						return;
					}

					setUsers(userData || []);

					// Load user stats (completed quests)
					const statsPromises = userIDs.map(async (userId) => {
						const { data: submissionData } = await supabase
							.from('submission')
							.select('quest_id')
							.eq('user_id', userId);
						
						return {
							userId,
							completedQuests: submissionData?.length || 0
						};
					});

					const statsResults = await Promise.all(statsPromises);
					const statsMap = statsResults.reduce((acc, stat) => {
						acc[stat.userId] = stat.completedQuests;
						return acc;
					}, {});

					setUserStats(statsMap);
				}
			} catch (error) {
				console.error('Error loading leaderboard data:', error);
				Alert.alert('Error', 'Failed to load leaderboard data');
			} finally {
				setLoadingData(false);
			}
		};

		loadLeaderboardData();
	}, [id, session]);

	if (loading) return (
		<Layout style={styles.loadingContainer}>
			<Text category="h6">Loading...</Text>
		</Layout>
	);
	
	if (!session) return <Auth />;

	if (loadingData) return (
		<Layout style={styles.loadingContainer}>
			<Text category="h6">Loading leaderboard...</Text>
		</Layout>
	);

	if (!leaderboardData) return (
		<Layout style={styles.errorContainer}>
			<Text category="h6">Leaderboard not found</Text>
		</Layout>
	);

	// Sort users by completed quests (descending)
	const sortedUsers = [...users].sort((a, b) => {
		const aQuests = userStats[a.id] || 0;
		const bQuests = userStats[b.id] || 0;
		return bQuests - aQuests;
	});

	return (
		<ScrollView style={styles.container}>
			{/* Leaderboard Header */}
			<Layout style={styles.header}>
				<Text category="h4" style={styles.title}>
					{leaderboardData.title || 'Leaderboard'}
				</Text>
				<Text category="s1" style={styles.subtitle}>
					{users.length} participants
				</Text>
				{isOwner && (
					<Text category="c1" style={styles.ownerBadge}>
						👑 You own this leaderboard
					</Text>
				)}
			</Layout>

			{/* Leaderboard Stats */}
			<Card style={styles.statsCard}>
				<Text category="h6" style={styles.sectionTitle}>
					Leaderboard Stats
				</Text>
				<View style={styles.statsRow}>
					<View style={styles.statItem}>
						<Text category="h4" style={styles.statNumber}>
							{users.length}
						</Text>
						<Text category="c1" style={styles.statLabel}>
							Participants
						</Text>
					</View>
					<View style={styles.statItem}>
						<Text category="h4" style={styles.statNumber}>
							{Object.values(userStats).reduce((sum: number, quests: any) => sum + quests, 0)}
						</Text>
						<Text category="c1" style={styles.statLabel}>
							Total Quests
						</Text>
					</View>
					<View style={styles.statItem}>
						<Text category="h4" style={styles.statNumber}>
							{new Date(leaderboardData.created_at).toLocaleDateString()}
						</Text>
						<Text category="c1" style={styles.statLabel}>
							Created
						</Text>
					</View>
				</View>
			</Card>

			{/* Participants List */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Participants ({users.length})
				</Text>
				
				{users.length === 0 ? (
					<View style={styles.emptySection}>
						<Text category="s1" style={styles.emptyText}>
							No participants yet.
						</Text>
						<Text category="c1" style={styles.emptySubtext}>
							Share the leaderboard ID with friends to get them to join!
						</Text>
					</View>
				) : (
					<View style={styles.usersList}>
						{sortedUsers.map((user, idx) => {
							const completedQuests = userStats[user.id] || 0;
							const rank = idx + 1;
							
							return (
								<Card 
									key={user.id} 
									style={styles.userCard}
									onPress={() => router.push(`/profile/${user.id}`)}
								>
									<View style={styles.userRow}>
										<View style={styles.rankContainer}>
											<Text category="h6" style={styles.rank}>
												#{rank}
											</Text>
										</View>
										
										<View style={styles.userInfo}>
											<Text category="h6" style={styles.userName}>
												{user.username || user.id}
											</Text>
											{user.city && (
												<Text category="s1" style={styles.userLocation}>
													📍 {user.city}
												</Text>
											)}
										</View>
										
										<View style={styles.userStats}>
											<Text category="h5" style={styles.questCount}>
												{completedQuests}
											</Text>
											<Text category="c1" style={styles.questLabel}>
												Quests
											</Text>
										</View>
									</View>
									
									{/* Rank badges */}
									{rank === 1 && (
										<Text category="c1" style={styles.goldBadge}>
											🥇 1st Place
										</Text>
									)}
									{rank === 2 && (
										<Text category="c1" style={styles.silverBadge}>
											🥈 2nd Place
										</Text>
									)}
									{rank === 3 && (
										<Text category="c1" style={styles.bronzeBadge}>
											🥉 3rd Place
										</Text>
									)}
								</Card>
							);
						})}
					</View>
				)}
			</Card>

			{/* Share Section */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Share Leaderboard
				</Text>
				<Text category="p1" style={styles.shareText}>
					Share this leaderboard ID with friends:
				</Text>
				<Text category="h6" style={styles.leaderboardId}>
					{id}
				</Text>
				<Button 
					style={styles.shareButton}
					onPress={() => {
						// You can implement actual sharing functionality here
						Alert.alert('Share', `Leaderboard ID: ${id}`);
					}}
				>
					Share Leaderboard
				</Button>
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
	errorContainer: {
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
	title: {
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 5,
	},
	subtitle: {
		color: '#666',
		marginBottom: 5,
	},
	ownerBadge: {
		color: '#007AFF',
		fontWeight: 'bold',
	},
	statsCard: {
		margin: 10,
		marginBottom: 10,
	},
	section: {
		margin: 10,
		marginBottom: 10,
	},
	sectionTitle: {
		fontWeight: 'bold',
		marginBottom: 15,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		fontWeight: 'bold',
		color: '#007AFF',
		marginBottom: 5,
	},
	statLabel: {
		color: '#666',
		textAlign: 'center',
		fontSize: 12,
	},
	emptySection: {
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		textAlign: 'center',
		marginBottom: 5,
		color: '#666',
	},
	emptySubtext: {
		textAlign: 'center',
		color: '#999',
		fontSize: 12,
	},
	usersList: {
		gap: 10,
	},
	userCard: {
		marginBottom: 10,
	},
	userRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	rankContainer: {
		width: 40,
		alignItems: 'center',
		marginRight: 15,
	},
	rank: {
		fontWeight: 'bold',
		color: '#007AFF',
	},
	userInfo: {
		flex: 1,
	},
	userName: {
		fontWeight: 'bold',
		marginBottom: 3,
	},
	userLocation: {
		color: '#666',
		fontSize: 12,
	},
	userStats: {
		alignItems: 'center',
	},
	questCount: {
		fontWeight: 'bold',
		color: '#007AFF',
	},
	questLabel: {
		color: '#666',
		fontSize: 10,
	},
	goldBadge: {
		color: '#FFD700',
		fontWeight: 'bold',
		marginTop: 5,
		textAlign: 'center',
	},
	silverBadge: {
		color: '#C0C0C0',
		fontWeight: 'bold',
		marginTop: 5,
		textAlign: 'center',
	},
	bronzeBadge: {
		color: '#CD7F32',
		fontWeight: 'bold',
		marginTop: 5,
		textAlign: 'center',
	},
	shareText: {
		marginBottom: 10,
		textAlign: 'center',
	},
	leaderboardId: {
		textAlign: 'center',
		fontWeight: 'bold',
		color: '#007AFF',
		marginBottom: 15,
		padding: 10,
		backgroundColor: '#f0f0f0',
		borderRadius: 8,
	},
	shareButton: {
		width: '100%',
	},
});
