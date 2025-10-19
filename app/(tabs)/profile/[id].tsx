import { useAuth } from "@/context/Auth";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";
import { Text, Card, Layout } from "@ui-kitten/components";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";

export default function ProfilePage() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();

	const [user, setUser] = useState<Profile | null>(null);
	const [profilePic, setProfilePic] = useState<string | null>(null);
	const [completedQuests, setCompletedQuests] = useState<number>(0);
	const [achievements, setAchievements] = useState<any[]>([]);
	const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

	useEffect(() => {
		(async () => {
			try {
				// Get user profile data
				let { data: rawProfileData, error: profileError } = await supabase
					.from('profile')
					.select('*')
					.eq('id', id)
					.single();

				const profileData: Profile = rawProfileData!;
				
				if (profileError) {
					console.error('Profile error:', profileError);
				} else {
					setUser(profileData);
				}

				// Get completed quests count
				const { data: submissionData, error: submissionError } = await supabase
					.from('completion')
					.select('quest_id')
					.eq('user_id', id);
				
				if (submissionError) {
					console.error('Submission error:', submissionError);
				} else {
					setCompletedQuests(submissionData?.length || 0);
				}

				// Get profile picture
				try {
					const { data: imageData } = await supabase.storage
						.from('profile-pics')
						.getPublicUrl(`${id}.jpg`);
					
					if (imageData?.publicUrl) {
						setProfilePic(imageData.publicUrl);
					}
				} catch (imageError) {
					console.error(imageError);
					throw imageError;
				}

				// Get user's achievements
				const { data: achievementData, error: achievementError } = await supabase
					.from('achievement')
					.select('*')
					.eq('user_id', id);
				
				if (achievementError) {
					console.error('Achievement error:', achievementError);
				} else {
					// Get achievement details
					const achievementIds = achievementData?.map(a => a.achievement_name) || [];
					const { data: achievementDetails } = await supabase
						.from('achievement id')
						.select('*')
						.in('id', achievementIds);
					
					setAchievements(achievementDetails || []);
				}

			} catch (error) {
				console.error('Error loading profile:', error);
			} finally {
				setLoadingProfile(false);
			}
		})();
	}, [id]);

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Redirect href='/(auth)' />
	if (loadingProfile) return <Text>Loading profile...</Text>

	return (
		<ScrollView style={styles.container}>
			<Layout style={styles.profileHeader}>
				{/* Profile Picture */}
				<View style={styles.avatarContainer}>
					{profilePic ? (
						<Image source={{ uri: profilePic }} style={styles.profileImage} />
					) : (
						<View style={styles.defaultAvatar}>
							<Text style={styles.avatarText}>
								{(user?.username || user?.id || 'U').charAt(0).toUpperCase()}
							</Text>
						</View>
					)}
				</View>

				{/* User Info */}
				<View style={styles.userInfo}>
					<Text category="h5" style={styles.userId}>
						{user?.username || user?.id || 'Unknown User'}
					</Text>
					
					{user?.city && (
						<Text category="s1" style={styles.location}>
							📍 {user.city}
						</Text>
					)}
					
					{user?.age && (
						<Text category="s1" style={styles.age}>
							Age: {user.age}
						</Text>
					)}
				</View>
			</Layout>

			{/* Stats Card */}
			<Card style={styles.statsCard}>
				<Text category="h6" style={styles.statsTitle}>
					Quest Statistics
				</Text>
				<View style={styles.statsRow}>
					<View style={styles.statItem}>
						<Text category="h4" style={styles.statNumber}>
							{completedQuests}
						</Text>
						<Text category="c1" style={styles.statLabel}>
							Completed Quests
						</Text>
					</View>
				</View>
			</Card>

			{/* Achievements Section */}
			<Card style={styles.achievementsCard}>
				<Text category="h6" style={styles.achievementsTitle}>
					Achievements ({achievements.length})
				</Text>
				{achievements.length === 0 ? (
					<Text category="p1" style={styles.noAchievements}>
						No achievements yet
					</Text>
				) : (
					<View style={styles.achievementsList}>
						{achievements.map((achievement, idx) => (
							<Card key={idx} style={styles.achievementItem}>
								<Text category="s1" style={styles.achievementName}>
									🏆 {achievement.name}
								</Text>
								{achievement.description && (
									<Text category="c1" style={styles.achievementDescription}>
										{achievement.description}
									</Text>
								)}
							</Card>
						))}
					</View>
				)}
			</Card>

			{/* Additional Info */}
			{user && (
				<Card style={styles.infoCard}>
					<Text category="h6" style={styles.infoTitle}>
						Profile Information
					</Text>
					<Text category="p1" style={styles.infoText}>
						Username: {user.username || 'N/A'}
					</Text>
					<Text category="p1" style={styles.infoText}>
						User ID: {user.id}
					</Text>
					{user.city && (
						<Text category="p1" style={styles.infoText}>
							Location: {user.city}
						</Text>
					)}
					{user.age && (
						<Text category="p1" style={styles.infoText}>
							Age: {user.age}
						</Text>
					)}
				</Card>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	profileHeader: {
		padding: 20,
		alignItems: 'center',
		backgroundColor: '#fff',
		marginBottom: 10,
	},
	avatarContainer: {
		marginBottom: 15,
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 3,
		borderColor: '#32908F',
	},
	defaultAvatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 3,
		borderColor: '#32908F',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
	},
	avatarText: {
		fontSize: 40,
		fontWeight: 'bold',
		color: '#32908F',
	},
	userInfo: {
		alignItems: 'center',
	},
	userId: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	location: {
		color: '#666',
		marginBottom: 3,
	},
	age: {
		color: '#666',
	},
	statsCard: {
		margin: 10,
		marginBottom: 10,
	},
	statsTitle: {
		marginBottom: 15,
		textAlign: 'center',
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
		color: '#32908F',
		marginBottom: 5,
	},
	statLabel: {
		color: '#666',
		textAlign: 'center',
	},
	achievementsCard: {
		margin: 10,
		marginBottom: 10,
	},
	achievementsTitle: {
		marginBottom: 15,
	},
	noAchievements: {
		color: '#666',
		textAlign: 'center',
		fontStyle: 'italic',
	},
	achievementsList: {
		gap: 10,
	},
	achievementItem: {
		marginBottom: 8,
		backgroundColor: '#f9f9f9',
	},
	achievementName: {
		fontWeight: 'bold',
		marginBottom: 4,
	},
	achievementDescription: {
		color: '#666',
	},
	infoCard: {
		margin: 10,
		marginBottom: 20,
	},
	infoTitle: {
		marginBottom: 10,
	},
	infoText: {
		marginBottom: 5,
		color: '#333',
	},
});