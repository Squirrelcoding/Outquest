import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, View, Image, StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { decode } from 'base64-arraybuffer';
import { Button, Card, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { Quest, Subquest } from "@/types";
// TODO: Let the viewer see their submissions right here.

// Diabolical ad-hoc data structure
interface ImageCardParams {
	session: Session,
	quest: Quest,
	subquest: Subquest,
	hasSubmitted: boolean,
	submittedSubquests: number[],
	setSubmittedSubquests: React.Dispatch<React.SetStateAction<number[]>>,
	totalSubquests: number,
	onCompletion: any,
}

export default function ImageCard({
	session,
	quest,
	subquest,
	hasSubmitted,
	submittedSubquests,
	setSubmittedSubquests,
	totalSubquests,
	onCompletion
}: ImageCardParams) {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [judgmentResult, setJudgmentResult] = useState<string | null>(null);
	const [isSubmissionValid, setIsSubmissionValid] = useState<boolean>(false);
	const [isJudging, setIsJudging] = useState<boolean>(false);

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

	const handleWinner = async () => {
		const { error: submissionError } = await supabase.from("submission").insert({
			user_id: session.user.id,
			subquest_id: subquest.id,
			time: new Date()
		});

		if (submissionError) {
			console.error('Submission error:', submissionError);
			Alert.alert('Error', 'Failed to record submission');
			return;
		}

		// Check whether completing this quest completes the entire quest
		const newSubmitted = [...submittedSubquests, subquest.id];
		setSubmittedSubquests(newSubmitted);
		console.log(newSubmitted, totalSubquests);
		
		if (newSubmitted.length === totalSubquests) {
			const { error } = await supabase.from("completion")
				.insert({
					quest_id: quest.id,
					user_id: session.user.id
				});
			console.log("HERE");
			if (error) throw error;

		}


		setIsSubmissionValid(true);
		Alert.alert('Success!', 'Your submission has been accepted!');


		// Check if the user is the first to complete the quest

		console.log("Running quest completion function");

		// Get the number of people who already completed the quest.
		const { data: winners } = await supabase.from("completion")
			.select("*", { head: false, count: 'exact' })
			.eq("quest_id", quest.id);

		console.log(`Past winners: ${JSON.stringify(winners)}`);
		console.log(!winners);
		console.log(winners!.length);
		// The winners list is empty so the user is the first to complete it
		if (!winners || winners.length === 1) {
			console.log("USER IS FIRST. AWARDING ACHIEVEMENT...");
			// Award a user an achievement
			const { error: achievementError } = await supabase.from("achievement").insert({
				user_id: session.user.id,
				achievement_name: 2,
				announced: true
			});
			if (achievementError) throw achievementError;
		}

		await onCompletion(newSubmitted);
	};

	const processImage = async () => {
		if (!selectedImage || !session || !quest) {
			Alert.alert('Error', 'Please select an image first');
			return;
		}
		// Convert image to base64
		const base64 = await FileSystem.readAsStringAsync(selectedImage, {
			encoding: FileSystem.EncodingType.Base64,
		});

		// Upload image to storage
		const fileName = `${session.user.id}/${quest.id}/${subquest.id}.jpg`;
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
		return fileName;
	};

	// Submit quest entry
	const submitEntry = async () => {
		if (!selectedImage || !session || !quest) {
			Alert.alert('Error', 'Please select an image first');
			return;
		}
		setIsUploading(true);

		const fileName = await processImage();
		console.log(`FILE NAME`);
		console.log(fileName);
		console.log(`FILE NAME`);

		setIsUploading(false);
		setIsJudging(true);

		// Judge the submission using AI
		console.log(`Does the image match the following description? Reply YES or NO. ${subquest.prompt}`)
		const { data: judgmentData, error: judgmentError } = await supabase.functions.invoke('replicate-call', {
			body: {
				image: fileName,
				question: `Does the image match the following description? Reply YES or NO. ${subquest.prompt}`
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
			await handleWinner();
		} else {
			Alert.alert('Submission Rejected', 'Your image does not match the quest requirements. Please try again.');
		}

		setIsUploading(false);
		setIsJudging(false);
	};

	return <>

		<Card style={styles.imageCard}>
			{hasSubmitted ? <>
				<Text>({subquest.prompt}) Image submitted! </Text>
				<Button onPress={() => router.push(`/(tabs)/browse/submission/${session.user.id}/${quest.id}`)}>View submission</Button>
			</>
				: <>
					<Text category="h6" style={styles.sectionTitle}>
						{subquest.prompt}
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
					<Button
						style={styles.submitButton}
						onPress={submitEntry}
						disabled={!selectedImage || isUploading || isJudging}
					>
						{isUploading ? 'Uploading...' :
							isJudging ? 'Judging...' : 'Submit Entry'}
					</Button>
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

								onPress={() => router.push(`/browse/submission/${session.user.id}/${quest.id}`)}
							>
								View Your Submission
							</Button>
						</Card>
					)}
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
				</>}

		</Card>

	</>

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
		backgroundColor: "#32908F",
		borderColor: "white",
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
