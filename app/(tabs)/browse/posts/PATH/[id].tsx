// app/posts/[id].tsx
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Text, Layout } from "@ui-kitten/components";
import { useAuth } from '@/context/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, ScrollView, Alert, Pressable, TextInput } from 'react-native';

import Comment from '@/components/Comment';
import ImageCard from '@/components/ImageCard';

interface Subquest {
	id: number,
	prompt: string,
	quest_id: number,
}

export default function Post() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();

	// State management
	const [quest, setQuest] = useState<any>(null);
	const [authorUsername, setAuthorUsername] = useState<string>("");
	const [submissions, setSubmissions] = useState<number>(0);
	const [loadingQuest, setLoadingQuest] = useState<boolean>(true);
	const [comments, setComments] = useState<any>(null);
	const [commentInput, setCommentInput] = useState<any>(null);
	const [liked, setLiked] = useState<boolean>(false);
	const [questLikes, setQuestLikes] = useState<number>(0);

	// Photo upload state management
	const [subquests, setSubquests] = useState<Subquest[]>([]);
	const [subquestsCompleted, setSubquestsCompleted] = useState<number[]>([]);

	const [message, setMessage] = useState<string>("");

	// Run this code when the user completes the quest
	useEffect(() => {
		if (!session) return;
		(async () => {
			if (subquestsCompleted.length === subquests.length) {
				// Check if user already completed quest
				const { data: winners } = await supabase.from("completion")
					.select("*")
					.eq("quest_id", id)
					.order("created_at", { ascending: true });
				const winnerIDs = winners!.map((winner) => winner.user_id)!;
				if (winnerIDs.includes(session.user.id)) {
					console.log("WE ALREADY DID")
					const place = winnerIDs.indexOf(session.user.id);
					setMessage(`PLACE: ${place}`);

					// Try to get the winner messages with current place from the database.
					const { data: messages } = await supabase.from("message")
						.select("*")
						.eq("quest_id", id)
						.eq("place", place + 1)
						.single();
					if (messages) {
						setMessage(messages.content);
					} else {
						const { data: defaultMessage } = await supabase.from("message")
							.select("*")
							.eq("quest_id", id)
							.eq("place", 0)
							.single();
						setMessage(defaultMessage.content);
					}
					return;
				}

				// If quest is not completed, get the number of people who completed the quest before
				const place = winners!.length;
				console.log(`USER GOT PLACE: ${place}`)
				// Get the appropiate winner message.
			}

		})();
	}, [subquestsCompleted, subquests]);

	// Load quest details and check submission status
	useEffect(() => {
		if (!session) return;

		const loadQuestData = async () => {
			try {
				setLoadingQuest(true);

				// Load quest details
				const { data: questData, error: questError } = await supabase
					.from('quest')
					.select('*')
					.eq('id', id)
					.single();

				if (questError) {
					console.error('Error loading quest:', questError);
					Alert.alert('Error', 'Failed to load quest details');
					return;
				}

				setQuest(questData);
				const { data: authorData, error: authorError } = await supabase
					.from('profile')
					.select("*")
					.eq('id', questData.author)
					.single();


				if (authorError) {
					console.error('Error loading author:', authorError);
					Alert.alert('Error', 'Failed to load quest details');
					return;
				}

				setAuthorUsername(authorData.username);

				// Get all submissions

				const { count: submissionsCount } = await supabase
					.from('completion')
					.select("*", { count: 'exact', head: true })
					.eq('quest_id', id);

				setSubmissions(submissionsCount!);

				// Check if post is liked
				let { data: likeData } = await supabase
					.from('quest score')
					.select("*")
					.eq('quest_id', id);

				let likers = likeData!.map((like) => like.user_id);

				if (likers.includes(session.user.id)) {
					setLiked(true);
				}
				setQuestLikes(likers.length);

			} catch (error) {
				console.error('Error loading quest data:', error);
				Alert.alert('Error', 'Failed to load quest information');
			} finally {
				setLoadingQuest(false);
			}
		};

		const loadCommentData = async () => {
			const { data: rawComments } = await supabase.from("comment")
				.select("*")
				.eq('quest_id', id);

			const comments = await Promise.all(rawComments!.map(async (comment) => {
				const { data: commentAuthor } = await supabase.from("profile")
					.select("*")
					.eq('id', comment.user_id)
					.single();
				const { data: commentLikers } = await supabase.from("comment score")
					.select("*")
					.eq('comment_id', comment.id);
				const likes = commentLikers!.map((commentLike) => commentLike.user_id);
				return {
					comment,
					commentAuthor,
					likes
				}
			}));
			setComments(comments);
		};

		const loadSubquests = async () => {
			const { data: subquests } = await supabase.from("subquest")
				.select("*")
				.eq('quest_id', id);

			setSubquests(subquests!);

			const subquestIDS = subquests!.map((s) => s.id);

			const { data: userSubmissions } = await supabase.from("submission")
				.select("*")
				.eq('user_id', session.user.id)
				.in('subquest_id', subquestIDS);

			const submittedIDS = userSubmissions!.map((submission) => {
				return submission.subquest_id;
			});
			console.log(submittedIDS);
			setSubquestsCompleted(submittedIDS);
		}

		loadQuestData();
		loadCommentData();
		loadSubquests();
	}, [id, session]);

	const postComment = async () => {
		if (!session) return;
		const { error } = await supabase.from("comment")
			.insert({
				quest_id: id,
				user_id: session.user.id,
				content: commentInput
			});
		if (error) {
			console.error(error);
			throw error;
		}
	}

	const setLike = async () => {
		if (!session) return;

		if (!liked) {
			const { error } = await supabase.from("quest score")
				.insert({
					quest_id: id,
					user_id: session.user.id
				});
			if (error) console.error(error);
			setLiked(true);
			setQuestLikes(questLikes + 1);
		} else {
			const { error } = await supabase.from("quest score")
				.delete()
				.eq('quest_id', id)
				.eq('user_id', session.user.id);
			if (error) console.error(error);
			setLiked(false);
			setQuestLikes(questLikes - 1);
		}
	}

	if (loading) return (
		<Layout style={styles.loadingContainer}>
			<Text category="h6">Loading...</Text>
		</Layout>
	);

	if (!session) return <Redirect href="/(auth)" />;

	if (loadingQuest) return (
		<Layout style={styles.loadingContainer}>
			<Text category="h6">Loading quest details...</Text>
		</Layout>
	);

	if (!quest) return (
		<Layout style={styles.errorContainer}>
			<Text category="h6">Quest not found</Text>
		</Layout>
	);

	return (
		<>
			<ScrollView style={styles.container}>
				{/* Quest Header */}
				<Layout style={styles.header}>
					<Text category="h4" style={styles.title}>
						{quest.title}
					</Text>
					<Pressable onPress={() => router.push(`/profile/${quest.author}`)}><Text>{authorUsername || quest.author}</Text></Pressable>
				</Layout>

				{/* Quest Details */}
				<Card style={styles.detailsCard}>
					<Text category="h6" style={styles.sectionTitle}>
						Quest Details
					</Text>
					<Text category="p1" style={styles.description}>
						{quest.description}
					</Text>

					<View style={styles.questInfo}>
						<View style={styles.infoRow}>
							<Text category="s1" style={styles.infoLabel}>
								Created:
							</Text>
							<Text category="s1" style={styles.infoValue}>
								{new Date(quest.created_at).toLocaleDateString()}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text category="s1" style={styles.infoLabel}>
								Deadline:
							</Text>
							<Text category="s1" style={styles.infoValue}>
								{new Date(quest.deadline).toLocaleDateString()}
							</Text>
						</View>
						<View>
							<Text category="s1" style={styles.countInfo}>
								{submissions} {submissions === 1 ? "person has" : "people have"} completed this quest so far.
							</Text>
						</View>
						<View>
							<Text category='s1' style={styles.infoLabel}>
								{quest.location}
							</Text>
						</View>
						<View>
							<Text category='s1' style={styles.infoLabel}>
								You have completed {subquestsCompleted.length} / {subquests.length} subquests.
							</Text>
						</View>
					</View>
				</Card>

				{/* Like quest */}
				<Card style={styles.promptCard}>
					<Text>{questLikes} {questLikes === 1 ? "like" : "likes"}</Text>
					<Button onPress={setLike}>
						<Text>{liked ? "Unlike" : "Like"}</Text>
					</Button>
				</Card>

				{/* Photo Prompt */}
				<Card style={styles.promptCard}>
					<Text category="h6" style={styles.sectionTitle}>
						Quest Description
					</Text>
					<Text category="p1" style={styles.promptText}>
						{quest.description}
					</Text>
				</Card>

				{subquestsCompleted.length === subquests.length && <Text>{message}</Text>}

				{subquests.map((subquest, idx) => {
					return <ImageCard
						key={idx}
						session={session}
						quest={quest}
						subquest={subquest}
						hasSubmitted={subquestsCompleted.includes(subquest.id)}
						submittedSubquests={subquestsCompleted}
						setSubmittedSubquests={setSubquestsCompleted}
						totalSubquests={subquests.length}
					/>
				})}

				{/* Comment section */}
				<Text>{"\n"}</Text>
				<Text>{"\n"}</Text>
				<TextInput style={styles.input}
					placeholder='Type your comment here'
					onChangeText={setCommentInput}
				/>
				<Button onPress={postComment}><Text>Post comment</Text></Button>

				<Text category="h6" style={styles.sectionTitle}>Comments</Text>
				{comments && <View>
					{comments.map((comment: any, idx: number) => {
						return <Comment comment={comment} session={session} key={idx} />
					})}
				</View>}
			</ScrollView>
		</>
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
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
});
