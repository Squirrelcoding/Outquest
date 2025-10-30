// app/posts/[id].tsx
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Text, Layout } from "@ui-kitten/components";
import { useAuth } from '@/context/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, ScrollView, Alert, Pressable, TextInput } from 'react-native';

import Comment from '@/components/boxes/Comment';
import ImageCard from '@/components/boxes/ImageCard';
import { DBComment, Profile, Quest, Subquest, CommentLike } from '@/types';
import { addAchievementProgress } from '@/lib/utils';

interface CommentType {
	comment: DBComment,
	commentAuthor: Profile;
	likes: string[];
}

export default function QuestBox() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();

	// State management
	const [quest, setQuest] = useState<Quest | null>(null);
	const [authorUsername, setAuthorUsername] = useState<string>("");
	const [submissions, setSubmissions] = useState<number>(0);
	const [loadingQuest, setLoadingQuest] = useState<boolean>(true);
	const [reflections, setReflections] = useState<CommentType[]>([]);
	const [reflectionInput, setReflectionInput] = useState<string | null>(null);
	const [gavekudos, setGaveKudos] = useState<boolean>(false);
	const [questKudos, setQuestKudos] = useState<number>(0);

	// Photo upload state management
	const [subquests, setSubquests] = useState<Subquest[]>([]);
	const [subquestsCompleted, setSubquestsCompleted] = useState<number[]>([]);

	const [message, setMessage] = useState<string>("");

	// Function to check and award achievement when quest is completed
	const checkQuestCompletion = async (updatedSubquestsCompleted: number[]) => {
		if (!session) return;

		// Only run if user has completed all subquests
		if (updatedSubquestsCompleted.length !== subquests.length || subquests.length === 0) return;


	};

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

				// Check if post has kudos
				let { data: kudosData } = await supabase
					.from('quest score')
					.select("*")
					.eq('quest_id', id);

				let kudosGivers = kudosData!.map((kudos) => kudos.user_id);

				if (kudosGivers.includes(session.user.id)) {
					setGaveKudos(true);
				}
				setQuestKudos(kudosGivers.length);

			} catch (error) {
				console.error('Error loading quest data:', error);
				Alert.alert('Error', 'Failed to load quest information');
			} finally {
				setLoadingQuest(false);
			}
		};

		const loadReflectionData = async () => {
			const { data: rawComments } = await supabase.from("comment")
				.select("*")
				.eq('quest_id', id);

			const reflections = await Promise.all(rawComments!.map(async (comment: DBComment) => {
				let { data: rawCommentAuthor } = await supabase.from("profile")
					.select("*")
					.eq('id', comment.user_id)
					.single();
				const commentAuthor: Profile = rawCommentAuthor!;
				let { data: rawCommentLikers } = await supabase.from("comment score")
					.select("*")
					.eq('comment_id', comment.id);
				const commentLikers: CommentLike[] = rawCommentLikers!;
				const likes = commentLikers!.map((commentLike) => commentLike.user_id!);
				return {
					comment,
					commentAuthor,
					likes
				}
			}));
			setReflections(reflections);
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
		loadReflectionData();
		loadSubquests();
	}, [id, session]);

	const postReflection = async () => {
		if (!session) return;
		const { error } = await supabase.from("comment")
			.insert({
				quest_id: id,
				user_id: session.user.id,
				content: reflectionInput
			});
		if (error) {
			console.error(error);
			throw error;
		}
	}

	const giveKudos = async () => {
		if (!session) return;

		if (!gavekudos) {
			const { error } = await supabase.from("quest score")
				.insert({
					quest_id: id,
					user_id: session.user.id
				});
			if (error) console.error(error);
			setGaveKudos(true);
			setQuestKudos(questKudos + 1);
		} else {
			const { error } = await supabase.from("quest score")
				.delete()
				.eq('quest_id', id)
				.eq('user_id', session.user.id);
			if (error) console.error(error);
			setGaveKudos(false);
			setQuestKudos(questKudos - 1);
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
								Starts:
							</Text>
							<Text category="s1" style={styles.infoValue}>
								{new Date(quest.created_at!).toLocaleDateString()}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text category="s1" style={styles.infoLabel}>
								Deadline:
							</Text>
							<Text category="s1" style={styles.infoValue}>
								{new Date(quest.deadline!).toLocaleDateString()}
							</Text>
						</View>
						<View>
							<Text category="s1" style={styles.countInfo}>
								{submissions} {submissions === 1 ? "person has" : "people have"} completed this quest so far.
							</Text>
						</View>
						<View>
							<Button onPress={() => router.push(`/(tabs)/browse/completion/${id}`)} style={styles.actionButton}>See completed list</Button>
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


				{/* Give Kudos */}
				<Card style={styles.promptCard}>
					<Text>{questKudos} {questKudos === 1 ? "kudos" : "kudos"}</Text>
					<Button onPress={giveKudos} style={styles.actionButton}>
						<Text>{gavekudos ? "Remove Kudos" : "Give Kudos"}</Text>
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
						onSubmissionComplete={checkQuestCompletion}
					/>
				})}

				{/* Reflection section */}
				<Text>{"\n"}</Text>
				<Text>{"\n"}</Text>
				<TextInput style={styles.input}
					placeholder='Share your reflection on this quest...'
					onChangeText={setReflectionInput}
				/>
				<Button onPress={postReflection} style={styles.actionButton}><Text>Post Reflection</Text></Button>

				<Text category="h6" style={styles.sectionTitle}>Reflections</Text>
				{reflections && <View>
					{reflections.map((reflection: CommentType, idx: number) => {
						return <Comment comment={reflection} session={session} key={idx} />
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
	actionButton: {
		backgroundColor: "#32908F",
		borderColor: "white",
		marginTop: 10,
	}
});