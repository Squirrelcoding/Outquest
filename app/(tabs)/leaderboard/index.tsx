import { View, StyleSheet, TextInput, ScrollView, Alert } from 'react-native'
import { useAuth } from '../../../context/Auth';
import { Redirect, router } from 'expo-router';
import { Button, Card, Layout, Text } from '@ui-kitten/components';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Completion, LeaderboardMetaRow, Quest } from '@/types';

export default function Page() {
	const { session, loading } = useAuth();
	const [leaderboardID, setLeaderboardID] = useState<string>('');
	const [usernames, setUsernames] = useState<string[]>([]);
	const [userLeaderboards, setUserLeaderboards] = useState<LeaderboardMetaRow[]>([]);
	const [loadingLeaderboards, setLoadingLeaderboards] = useState<boolean>(false);


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
				const leaderboardIDs: string[] = userLeaderboardData.map((lb) => lb.leaderboard_id);
				let { data: leaderboardMetaData, error: metaError }: {
					data: LeaderboardMetaRow[] | null;
					error: any;
				} = await supabase
					.from('leaderboard meta')
					.select('*')
					.in('leaderboard_id', leaderboardIDs);

				let typedLeaderboardMetaData: LeaderboardMetaRow[] = leaderboardMetaData!;

				if (metaError) {
					console.error('Error loading leaderboard metadata:', metaError);
					return;
				}

				setUserLeaderboards(typedLeaderboardMetaData || []);
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

	if (!session) {
		console.log("Fiujhewuhj")
		return <Redirect href={`/(auth)`} />;
	}

	return (
		<ScrollView style={styles.container}>
			{/* Header Section */}
			<Layout style={styles.header}>
				<Text category="h4" style={styles.welcomeText}>
					Leaderboards
				</Text>
			</Layout>

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


				</View>
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
});