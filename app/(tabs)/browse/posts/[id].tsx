// app/posts/[id].tsx
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Text, Layout, Spinner } from "@ui-kitten/components";
import { useAuth } from '@/context/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, Image, ScrollView, Alert, Pressable, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import Comment from '@/components/Comment';

export default function QuestBox() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();

	// State management
	const [quest, setQuest] = useState<any>(null);
	const [authorUsername, setAuthorUsername] = useState<string>("");
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isJudging, setIsJudging] = useState<boolean>(false);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [judgmentResult, setJudgmentResult] = useState<string | null>(null);
	const [isSubmissionValid, setIsSubmissionValid] = useState<boolean>(false);
	const [submissions, setSubmissions] = useState<number>(0);
	const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
	const [submissionQuestId, setSubmissionQuestId] = useState<number>(-1);
	const [loadingQuest, setLoadingQuest] = useState<boolean>(true);
	const [comments, setComments] = useState<any>(null);
	const [commentInput, setCommentInput] = useState<any>(null);
	const [liked, setLiked] = useState<boolean>(false);
	const [questLikes, setQuestLikes] = useState<number>(0);

	// Photo upload state management
	const [images, setSelected] = useState<boolean[]>([]);

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

				// Check if user has already submitted
				const { data: submissionData, error: submissionError } = await supabase
					.from('submission')
					.select('quest_id')
					.eq('quest_id', id)
					.eq('user_id', session.user.id)
					.single();

				if (submissionError && submissionError.code !== 'PGRST116') {
					console.error('Error checking submission:', submissionError);
				}

				// Get all submissions

				const { count: submissionsCount } = await supabase
					.from('submission')
					.select("*", { count: 'exact', head: true })
					.eq('quest_id', id);

				setSubmissions(submissionsCount!);

				if (submissionData) {
					setHasSubmitted(true);
					setSubmissionQuestId(submissionData.quest_id);
				}

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

		loadQuestData();
		loadCommentData();
	}, [id, session]);

	// Pick image from camera roll
	const pickImage = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
			});

			if (!result.canceled && result.assets[0]) {
				setSelectedImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Error picking image:', error);
			Alert.alert('Error', 'Failed to pick image from camera roll');
		}
	};

	// Submit quest entry
	const submitEntry = async () => {
		if (!selectedImage || !session || !quest) {
			Alert.alert('Error', 'Please select an image first');
			return;
		}

		try {
			setIsUploading(true);

			// Convert image to base64
			const base64 = await FileSystem.readAsStringAsync(selectedImage, {
				encoding: FileSystem.EncodingType.Base64,
			});

			// Upload image to storage
			const fileName = `${session.user.id}/${quest.id}/img-${Date.now()}.jpg`;
			const { error: uploadError } = await supabase.storage
				.from('quest-upload')
				.upload(fileName, decode(base64), {
					contentType: 'image/jpeg',
					upsert: true
				});

			if (uploadError) {
				console.error('Upload error:', uploadError);
				Alert.alert('Error', 'Failed to upload image');
				return;
			}

			setIsUploading(false);
			setIsJudging(true);

			// Judge the submission using AI
			const { data: judgmentData, error: judgmentError } = await supabase.functions.invoke('replicate-call', {
				body: {
					image: fileName,
					question: `Does the image match the following description? Reply YES or NO. ${quest.photo_prompt}`
				},
			});

			if (judgmentError) {
				console.error('Judgment error:', judgmentError);
				Alert.alert('Error', 'Failed to judge submission');
				return;
			}

			setIsJudging(false);
			setJudgmentResult(judgmentData);

			// If submission is valid, record it in database
			if (judgmentData === "YES") {
				const { error: submissionError } = await supabase.from("submission").insert({
					user_id: session.user.id,
					quest_id: quest.id,
					time: new Date()
				});

				if (submissionError) {
					console.error('Submission error:', submissionError);
					Alert.alert('Error', 'Failed to record submission');
					return;
				}

				setIsSubmissionValid(true);
				setHasSubmitted(true);
				Alert.alert('Success!', 'Your submission has been accepted!');
			} else {
				Alert.alert('Submission Rejected', 'Your image does not match the quest requirements. Please try again.');
			}
		} catch (error) {
			console.error('Error submitting entry:', error);
			Alert.alert('Error', 'Failed to submit entry');
		} finally {
			setIsUploading(false);
			setIsJudging(false);
		}
	};

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
						Photo Challenge
					</Text>
					<Text category="p1" style={styles.promptText}>
						{quest.description}
					</Text>
				</Card>

				{/* Image Selection - Only show if user hasn't submitted */}
				{!hasSubmitted && (
					<Card style={styles.imageCard}>
						<Text category="h6" style={styles.sectionTitle}>
							Your Submission
						</Text>

						{selectedImage ? (
							<View style={styles.selectedImageContainer}>
								<Image source={{ uri: selectedImage }} style={styles.selectedImage} />
								<Button
									style={styles.changeImageButton}
									onPress={pickImage}
								>
									Change Image
								</Button>
							</View>
						) : (
							<View style={styles.imagePlaceholder}>
								<Text category="s1" style={styles.placeholderText}>
									No image selected
								</Text>
								<Button
									style={styles.pickImageButton}
									onPress={pickImage}
								>
									Pick Image from Camera Roll
								</Button>
							</View>
						)}
					</Card>
				)}

				{/* Submission Status */}
				{hasSubmitted && (
					<Card style={styles.submittedCard}>
						<Text category="h6" style={styles.sectionTitle}>
							✅ Quest Completed!
						</Text>
						<Text category="p1" style={styles.submittedText}>
							You have already completed this quest.
						</Text>
						<Button
							style={styles.viewSubmissionButton}
							onPress={() => router.push(`/browse/submission/${session.user.id}/${submissionQuestId}`)}
						>
							View Your Submission
						</Button>
					</Card>
				)}

				{/* Submit Button */}
				{!hasSubmitted && (
					<Card style={styles.submitCard}>
						<Button
							style={styles.submitButton}
							onPress={submitEntry}
							disabled={!selectedImage || isUploading || isJudging}
						>
							{isUploading ? 'Uploading...' :
								isJudging ? 'Judging...' : 'Submit Entry'}
						</Button>

						{(isUploading || isJudging) && (
							<View style={styles.loadingIndicator}>
								<Spinner size="small" />
								<Text category="s1" style={styles.loadingText}>
									{isUploading ? 'Uploading your image...' : 'AI is judging your submission...'}
								</Text>
							</View>
						)}
					</Card>
				)}

				{/* Judgment Result */}
				{judgmentResult && !hasSubmitted && (
					<Card style={styles.resultCard}>
						<Text category="h6" style={styles.sectionTitle}>
							{isSubmissionValid ? '🎉 Success!' : '❌ Submission Rejected'}
						</Text>
						<Text category="p1" style={styles.resultText}>
							{isSubmissionValid
								? 'Your submission has been accepted! Great job!'
								: 'Your image does not match the quest requirements. Please try again with a different image.'
							}
						</Text>
					</Card>
				)}

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
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
});
