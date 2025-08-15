import { Ionicons } from "@expo/vector-icons";
import { Card, Divider, Text } from "@ui-kitten/components/ui";
import { router } from "expo-router";
import { View, StyleSheet } from "react-native";

interface Quest {
	id: number,
	title: string,
	author_username: string,
	description: string,
	deadline: string,
	created_at: string
}


const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffTime = date.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return 'Expired';
	} else if (diffDays === 0) {
		return 'Ends today';
	} else if (diffDays === 1) {
		return 'Ends tomorrow';
	} else {
		return `Ends in ${diffDays} days`;
	}
};

export default function QuestBox({
	id,
	title,
	author_username,
	description,
	deadline,
	created_at
}: Quest) {
	return <Card
		// key={quest.id}
		style={styles.questCard}
		onPress={() => router.push(`/browse/posts/${id}`)}
	>
		<View style={styles.questHeader}>
			<Text category="h6" style={styles.questTitle}>
				{title}
			</Text>
			<View style={styles.questMeta}>
				<Ionicons name="person-outline" size={16} color="#666" />
				<Text category="s1" style={styles.authorText}>
					{author_username || "Unknown"}
				</Text>
			</View>
		</View>

		<Text category="p1" style={styles.questDescription} numberOfLines={2}>
			{description}
		</Text>

		<Divider style={styles.divider} />

		<View style={styles.questFooter}>
			<View style={styles.dateInfo}>
				<Ionicons name="calendar-outline" size={16} color="#666" />
				<Text category="s1" style={styles.dateText}>
					{formatDate(deadline)}
				</Text>
			</View>
			<View style={styles.createdInfo}>
				<Ionicons name="time-outline" size={16} color="#666" />
				<Text category="s1" style={styles.createdText}>
					{new Date(created_at).toLocaleDateString()}
				</Text>
			</View>
		</View>
	</Card>
}


const styles = StyleSheet.create({
	questCard: {
		marginBottom: 10,
	},
	questHeader: {
		marginBottom: 10,
	},
	questTitle: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	questMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	authorText: {
		color: '#666',
	},
	questDescription: {
		color: '#333',
		lineHeight: 20,
		marginBottom: 10,
	},
	divider: {
		marginVertical: 10,
	},
	questFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	dateInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	dateText: {
		color: '#666',
		fontSize: 12,
	},
	createdInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	createdText: {
		color: '#666',
		fontSize: 12,
	},
});