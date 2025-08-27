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
					.from('submission')
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
		borderColor: '#007AFF',
	},
	defaultAvatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 3,
		borderColor: '#007AFF',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
	},
	avatarText: {
		fontSize: 40,
		fontWeight: 'bold',
		color: '#007AFF',
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
		color: '#007AFF',
		marginBottom: 5,
	},
	statLabel: {
		color: '#666',
		textAlign: 'center',
	},
	infoCard: {
		margin: 10,
	},
	infoTitle: {
		marginBottom: 10,
	},
	infoText: {
		marginBottom: 5,
		color: '#333',
	},
});