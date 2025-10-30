import { View, Text, StyleSheet } from 'react-native';
import { Profile } from '@/types';

type Props = {
	profile: Profile;
	subquestsCompleted: number;
	totalSubquests: number;
	rank: number;
};

export default function EventProfileCard({ profile, subquestsCompleted, totalSubquests, rank }: Props) {
	return (
		<View style={styles.card}>
			<View style={styles.rankBadge}>
				<Text style={styles.rankText}>{rank}</Text>
			</View>
			<View style={styles.info}>
				<Text style={styles.username}>{profile.username || 'Anonymous'}</Text>
				<Text style={styles.date}>{subquestsCompleted} / {totalSubquests} subquests completed</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		backgroundColor: '#fff',
		borderRadius: 8,
		marginVertical: 6,
		marginHorizontal: 10,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 4,
	},
	rankBadge: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#007AFF',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	rankText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 20,
	},
	info: {
		flex: 1,
	},
	username: {
		fontWeight: '600',
		fontSize: 16,
	},
	date: {
		color: '#666',
		marginTop: 4,
		fontSize: 12,
	},
});