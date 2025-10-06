import { supabase } from "@/lib/supabase";
import { Achievement, AchievementID, Profile } from "@/types";
import { Text, Card, Layout } from "@ui-kitten/components";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";

export default function ProfilePage() {
	const { id } = useLocalSearchParams();

	const [achievementData, setAchievementData] = useState<AchievementID | null>(null);

	useEffect(() => {
		(async () => {
			const { data } = await supabase.from("achievement id")
				.select("*")
				.eq("id", id);
			setAchievementData(data![0]);
		})();
	}, [id]);


	return (
		<ScrollView style={styles.container}>
			<Layout style={styles.profileHeader}>
				<Text>
					{achievementData?.name}
				</Text>
				<Text>
					{achievementData?.description}
				</Text>
			</Layout>
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