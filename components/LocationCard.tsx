import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Button, Card, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { haversineDistance } from "@/lib/utils";

// Diabolical ad-hoc data structure
interface LocationCardParams {
	session: Session,
	location: any,
	quest: any,
	subquest: any,
	hasSubmitted: boolean,
	submittedSubquests: number[],
	setSubmittedSubquests: React.Dispatch<React.SetStateAction<number[]>>,
	totalSubquests: number
}

export default function LocationCard({
	session,
	quest,
	subquest,
	hasSubmitted,
	location
}: LocationCardParams) {

	const [verificationResult, setVerificationResult] = useState<boolean>(false);
	const [isSubmissionValid, setIsSubmissionValid] = useState<boolean>(false);
	const [isJudging, setIsJudging] = useState<boolean>(false);

	console.log(location);
	const { latitude: userLat, longitude: userLon } = location.coords;
	const { latitude: goalLat, longitude: goalLon } = JSON.parse(subquest.prompt);
	console.log(userLat, userLon, goalLat, goalLon)

	// Submit quest entry
	const submitEntry = async () => {
		const distanceMeters = haversineDistance([userLat, userLon], [goalLat, goalLon]) * 1000;
		if (distanceMeters > 10) return;

		// Add location
		const { error } = await supabase.from("submission")
			.insert({
				subquest_id: subquest.id,
				user_id: session.user.id,
			});
		Alert.alert(location.message);
		if (error) {
			console.error(error);
			throw error;
		}
	}

	return <>
		<Card style={styles.imageCard}>
			{hasSubmitted ? <>
				<Text>({location.message}) Image submitted! </Text>
			</>
				: <>
					<Text category="h6" style={styles.sectionTitle}>
						Title: {subquest.prompt} end of title.
					</Text>
					
					<Button
						style={styles.submitButton}
						onPress={submitEntry}
						disabled={verificationResult || isJudging}
					>
						{isJudging ? 'Judging...' : 'Submit Entry'}
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
					{verificationResult && !hasSubmitted && (
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
