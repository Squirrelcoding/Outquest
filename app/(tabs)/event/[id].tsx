// app/posts/[id].tsx
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/Auth';

import { useLocation } from '@/context/Location';
import { Button, Card, Text, Layout, Input } from "@ui-kitten/components";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, ScrollView, Alert, Pressable, TextInput } from 'react-native';

import Comment from '@/components/boxes/Comment';
import LocationCard from '@/components/boxes/LocationCard';
import { DBComment, Profile, Quest, Subquest, CommentLike } from '@/types';
import ImageCard from '@/components/boxes/ImageCard';
import EventProfileCard from '@/components/boxes/EventProfileCard';

interface CommentType {
	comment: DBComment,
	commentAuthor: Profile;
	likes: string[];
}

export default function QuestBox() {
	const { session, loading: authLoading } = useAuth();
	const { location, } = useLocation();
	const { id } = useLocalSearchParams();

	const channel = supabase.channel(`event:${id}`);
	const [state, setState] = useState<number>(0);

	const [quest, setQuest] = useState<Quest | null>(null);
	const [authorUsername, setAuthorUsername] = useState<string>("");
	const [submissions, setSubmissions] = useState<number>(0);
	const [loadingQuest, setLoadingQuest] = useState<boolean>(true);
	const [comments, setComments] = useState<CommentType[]>([]);
	const [commentInput, setCommentInput] = useState<string | null>(null);
	const [liked, setLiked] = useState<boolean>(false);
	const [questLikes, setQuestLikes] = useState<number>(0);
	const [chatMessages, setChatMessages] = useState<string[]>([]);
	const [message, setMessage] = useState<string>("");
	const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [subquestsCompletedByUsers, setSubquestsCompletedByUsers] = useState<number[]>([]);
	const [loadingSubquests, setLoadingSubquests] = useState<boolean>(true);

	// Photo upload state management
	const [subquests, setSubquests] = useState<Subquest[]>([]);
	const [subquestsCompleted, setSubquestsCompleted] = useState<number[]>([]);


	// When session is done loading send a new message to the big chat

	useEffect(() => {
		if (authLoading || !session || !id) return;

		console.log(`event:${id}`);
		const channel = supabase.channel(`event:${id}`);

		// Subscribe to the channel
		channel
			.on("broadcast", { event: "*" }, (payload) => {
				console.log(payload)
				// const data = JSON.parse(payload);
				let msg = "";
				if (payload["event"] === "join") {
					msg = `Someone joined the event!`;
					setChatMessages(prev => [...prev, msg]);
				}
				if (payload["event"] === "complete") {
					console.log("SOMEONE COMPLETED SUBQUEST!!!!")
					// just set it itself to trigger the update i dont care about best practices
					updateLeaderboard();
				}
				if (payload["event"] === "message") {
					msg = payload["payload"]["message"];
					console.log(`Someone sent a message: ${msg}`);
					setChatMessages(prev => [...prev, msg]);
				}
			})
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') {
					console.log("Joined!");
					// Send join message after successfully subscribed
					channel.send({
						type: "broadcast",
						event: "join",
						payload: {
							user_id: session.user.id,
						}
					});
				}
			});

		// Cleanup function
		return () => {
			channel.unsubscribe();
		};
	}, [id, session, authLoading]);

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

			const comments = await Promise.all(rawComments!.map(async (comment: DBComment) => {
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
			setComments(comments);
		};

		const loadSubquests = async () => {
			setLoadingSubquests(true);
			let { data: rawSubquests } = await supabase.from("subquest")
				.select("*")
				.eq('quest_id', id);

			const subquests: Subquest[] = rawSubquests!;

			// Set subquests FIRST - this will trigger the useEffect to run updateLeaderboard
			setSubquests(subquests);

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
			setLoadingSubquests(false);
		}

		loadQuestData();
		loadCommentData();
		loadSubquests();
	}, [id, session]);

	const postComment = async () => {
		if (!session) return;
		console.log("posted comment")
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

	const sendMessage = async () => {
		channel.send({
			type: "broadcast",
			event: "message",
			payload: {
				user_id: session?.user.id,
				message
			}
		});
		setMessage("");
		setChatMessages(prev => [...prev, message]);
	}

	const onSubquestCompletion = async (newCompletedList: number[]) => {
		console.log("HERE!!! SUBQUEST COMPLETE!!!");
		if (!session) return;
		if (newCompletedList.length === 0) return;
		console.log("STILL HERE");
		channel.send({
			"event": "complete",
			"type": "broadcast",
			"payload": {
				"message": session.user.id
			}
		});

		// this triggers the subquests to update the leaderboard
		await updateLeaderboard();
		setChatMessages(prev => [...prev, "Somebody just completed a subquest!"]);
		console.log("SENT MESSAGE");

		// When the user completes all the subquests
		if (newCompletedList.length === subquests.length) {
			console.log("user finished all the subquests");
			// Check if user already completed quest
			const { data: winners } = await supabase.from("completion")
				.select("*")
				.eq("quest_id", id)
				.order("created_at", { ascending: true })
			const winnerIDs = winners!.map((winner) => winner.user_id)!;
			if (winnerIDs.includes(session.user.id)) return;


			// If quest is not completed, get the number of people who completed the quest before
			const place = winners!.length;
			console.log(`USER GOT PLACE: ${place}`)
			// Get the appropiate winner message.
		}
	}

	const updateLeaderboard = async () => {
		setLoadingProfiles(true);

		try {
			console.log(`Subquests used for the query`);
			console.log(subquests);
			console.log(`Subquests used for the query`);
			const subquestIDs = subquests.map((subquest) => subquest.id);
			const { data: completionData, error: completionError } = await supabase
				.from('submission')
				.select('*')
				.in('subquest_id', subquestIDs);
			if (completionError) throw completionError;

			if (!completionData) {
				setProfiles([]);
				setSubquestsCompletedByUsers([]);
				return;
			}

			// This stuff below gets the user IDs and number of subquests completed, orders them, and splits them into two lists
			const freqMap = completionData!.reduce((acc, log) => {
				acc[log.user_id] = (acc[log.user_id] || 0) + 1;
				return acc;
			}, {});

			const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
			const userListIDs = sorted.map(([user]) => user);
			const subquestsCompleted = sorted.map(([_, freq]) => freq);


			// Fetch profiles for each completion
			const profileIds = userListIDs.map((c: any) => c).filter(Boolean);
			if (profileIds.length === 0) {
				setProfiles([]);
				return;
			}

			const { data: profileData, error: profileError } = await supabase
				.from('profile')
				.select('*')
				.in('id', profileIds as string[]);

			if (profileError) throw profileError;

			profileData.reverse();

			setSubquestsCompletedByUsers(subquestsCompleted);
			setProfiles(profileData || []);
		} catch (err) {
			console.error('Error loading completions:', err);
			Alert.alert('Error', 'Failed to load completions');
		} finally {
			setLoadingProfiles(false);
		}
	}

	// This is the code that gets all of the leaderboard data
	useEffect(() => {
		if (!session) return;

		const update = async () => {
			setLoadingProfiles(true);

			try {
				console.log(`Subquests used for the query`);
				console.log(subquests);
				console.log(`Subquests used for the query`);
				const subquestIDs = subquests.map((subquest) => subquest.id);
				const { data: completionData, error: completionError } = await supabase
					.from('submission')
					.select('*')
					.in('subquest_id', subquestIDs);
				if (completionError) throw completionError;

				if (!completionData) {
					setProfiles([]);
					setSubquestsCompletedByUsers([]);
					return;
				}

				// This stuff below gets the user IDs and number of subquests completed, orders them, and splits them into two lists
				const freqMap = completionData!.reduce((acc, log) => {
					acc[log.user_id] = (acc[log.user_id] || 0) + 1;
					return acc;
				}, {});

				const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
				const userListIDs = sorted.map(([user]) => user);
				const subquestsCompleted = sorted.map(([_, freq]) => freq);


				// Fetch profiles for each completion
				const profileIds = userListIDs.map((c: any) => c).filter(Boolean);
				if (profileIds.length === 0) {
					setProfiles([]);
					return;
				}

				const { data: profileData, error: profileError } = await supabase
					.from('profile')
					.select('*')
					.in('id', profileIds as string[]);

				if (profileError) throw profileError;

				profileData.reverse();

				setSubquestsCompletedByUsers(subquestsCompleted);
				setProfiles(profileData || []);
			} catch (err) {
				console.error('Error loading completions:', err);
				Alert.alert('Error', 'Failed to load completions');
			} finally {
				setLoadingProfiles(false);
			}
		}

		update();
	}, [session, id, subquests]);

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
			<Button onPress={() => setState((state + 1) % 3)} style={styles.button}>Click to switch</Button>
			{state === 0 &&
				<>
					{/*  ===== Main screen =====  */}
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

						{/* The actual subquests */}
						{!loadingSubquests && subquests.map((subquest, idx) => {
							if (subquest.type === "PHOTO") {
								return <ImageCard
									key={idx}
									session={session}
									quest={quest}
									subquest={subquest}
									hasSubmitted={subquestsCompleted.includes(subquest.id)}
									submittedSubquests={subquestsCompleted}
									setSubmittedSubquests={setSubquestsCompleted}
									totalSubquests={subquests.length}
									onCompletion={onSubquestCompletion}
								/>
							}
							return <LocationCard
								key={idx}
								session={session}
								location={location!}
								quest={quest}
								subquest={subquest}
								hasSubmitted={subquestsCompleted.includes(subquest.id)}
								submittedSubquests={subquestsCompleted}
								setSubmittedSubquests={setSubquestsCompleted}
								totalSubquests={subquests.length}
								onCompletion={onSubquestCompletion}
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
							{comments.map((comment: CommentType, idx: number) => {
								return <Comment comment={comment} session={session} key={idx} />
							})}
						</View>}
					</ScrollView>
				</>
			}
			{state === 1 && (
				<View style={styles.chatContainer}>
					<ScrollView
						style={styles.messagesScrollView}
						contentContainerStyle={{ flexGrow: 1 }}
					>
						{state === 1 && (
							<View style={styles.chatContainer}>
								<ScrollView style={styles.messagesScrollView}>
									{chatMessages.map((msg, i) => (
										<View
											key={i}
											style={[
												styles.messageItem,
												i % 2 === 0 ? styles.messageItemEven : styles.messageItemOdd
											]}
										>
											<Text>{JSON.stringify(msg).replaceAll('"', '')}</Text>
										</View>
									))}
								</ScrollView>

								<View style={styles.inputContainer}>
									<Input
										placeholder='Message'
										style={styles.messageInput}
										value={message}
										onChangeText={setMessage}
									/>
									<Button onPress={sendMessage} style={styles.sendButton}>
										Send
									</Button>
								</View>
							</View>
						)}
					</ScrollView>
				</View>
			)}
			{state === 2 &&
				<>
					<Text>Leaderboard</Text>
					<ScrollView style={styles.container}>
						{loadingProfiles ? (
							<Text style={{ padding: 20, textAlign: 'center' }}>Loading completed users...</Text>
						) : profiles.length === 0 ? (
							<Text style={{ padding: 20, textAlign: 'center' }}>No completions found for this quest.</Text>
						) : (
							profiles.map((p: Profile, idx: number) => {
								return <EventProfileCard
									key={p.id}
									profile={p}
									subquestsCompleted={subquestsCompletedByUsers[idx]}
									totalSubquests={subquests.length}
									rank={idx + 1}
								/>
							})
						)}
					</ScrollView>
				</>
			}
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
	button: {
		backgroundColor: "#32908F",
		borderColor: "white"
	},
	chatContainer: {
		flex: 1,
	},
	messagesScrollView: {
		flex: 1,
	},
	messageItem: {
		padding: 12,
	},
	messageItemOdd: {
		backgroundColor: '#efefef',
	},
	messageItemEven: {
		backgroundColor: '#fff',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.15)',
		height: 48,
	},
	messageInput: {
		flex: 1,
		marginHorizontal: 4,
		backgroundColor: '#fff',
	},
	sendButton: {
		backgroundColor: '#333',
		borderRadius: 3,
		marginHorizontal: 4,
	},
});