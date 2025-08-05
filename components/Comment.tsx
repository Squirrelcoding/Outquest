import { supabase } from "@/lib/supabase";
import { Button, Card, Text } from "@ui-kitten/components";
import { useState } from "react";
import { View, StyleSheet } from "react-native";

export default function Comment({ comment, session }: any) {
	const [liked, setLiked] = useState<boolean>(comment.likes.includes(session.user.id));
	const [likes, setLikes] = useState<number>(comment.likes.length);

	const likeComment = async (commentID: number) => {
		setLiked(true);
		setLikes(likes + 1);
		if (!session) return;
		const { error } = await supabase.from("comment score")
			.insert({
				comment_id: commentID,
				user_id: session.user.id
			});
		if (error) console.error(error);
	}

	const unlikeComment = async (commentID: number) => {
		setLiked(false);
		setLikes(likes - 1);
		if (!session) return;
		const { error } = await supabase.from("comment score")
			.delete()
			.eq('comment_id', commentID)
			.eq('user_id', session.user.id);
		if (error) console.error(error);
	}

	return <Card style={styles.detailsCard}>
		<Text category="h6" style={styles.sectionTitle}>
			By {comment.commentAuthor.username}
		</Text>
		<Text category="p1" style={styles.description}>
			{comment.comment.content}
		</Text>

		<View style={styles.questInfo}>
			<View style={styles.infoRow}>
				<Text category="s1" style={styles.infoLabel}>
					Created:
				</Text>
				<Text category="s1" style={styles.infoValue}>
					{new Date(comment.comment.created_at).toLocaleDateString()}
				</Text>
			</View>
			<Text>{likes} {likes === 1 ? "like" : "likes"}</Text>
			{liked ?
				<Button onPress={() => unlikeComment(comment.comment.id)}>
					<Text>Unlike</Text>
				</Button> :
				<Button onPress={() => likeComment(comment.comment.id)}>
					<Text>Like {comment.id}</Text>
				</Button>
			}
		</View>
	</Card>
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
	author: {
		textDecorationLine: "underline"
	},
	detailsCard: {
		margin: 10,
		marginBottom: 10,
	},
	promptCard: {
		margin: 10,
		marginBottom: 10,
	},
	imageCard: {
		margin: 10,
		marginBottom: 10,
	},
	submittedCard: {
		margin: 10,
		marginBottom: 10,
		backgroundColor: '#e8f5e8',
	},
	submitCard: {
		margin: 10,
		marginBottom: 10,
	},
	resultCard: {
		margin: 10,
		marginBottom: 10,
		backgroundColor: '#fff3cd',
	},
	sectionTitle: {
		fontWeight: 'bold',
		marginBottom: 10,
	},
	description: {
		lineHeight: 22,
		marginBottom: 15,
	},
	questInfo: {
		gap: 8,
	},
	infoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	infoLabel: {
		fontWeight: 'bold',
		color: '#666',
	},
	infoValue: {
		color: '#333',
	},
	countInfo: {
		textAlign: "center",
		fontWeight: "bold",
		color: "#666"
	},
	promptText: {
		lineHeight: 20,
		fontStyle: 'italic',
		color: '#007AFF',
	},
	imagePlaceholder: {
		alignItems: 'center',
		padding: 20,
	},
	placeholderText: {
		color: '#666',
		marginBottom: 15,
	},
	pickImageButton: {
		width: '100%',
	},
	selectedImageContainer: {
		alignItems: 'center',
	},
	selectedImage: {
		width: 200,
		height: 150,
		borderRadius: 8,
		marginBottom: 15,
	},
	changeImageButton: {
		width: '100%',
	},
	submittedText: {
		marginBottom: 15,
		textAlign: 'center',
	},
	viewSubmissionButton: {
		width: '100%',
	},
	submitButton: {
		width: '100%',
		marginBottom: 10,
	},
	loadingIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	loadingText: {
		color: '#666',
	},
	resultText: {
		lineHeight: 20,
		textAlign: 'center',
	},
});
