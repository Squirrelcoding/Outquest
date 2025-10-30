import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Button, Card, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { haversineDistance } from "@/lib/utils";
import { LocationObject } from "expo-location";
import { Quest, Subquest } from "@/types";


// Diabolical ad-hoc data structure
interface LocationCardParams {
	session: Session,
	location: LocationObject,
	quest: Quest,
	subquest: Subquest,
	hasSubmitted: boolean,
	submittedSubquests: number[],
	setSubmittedSubquests: React.Dispatch<React.SetStateAction<number[]>>,
	totalSubquests: number,
	onCompletion: any,
}

const TOLERANCE_RADIUS_METERS = 50;

export default function LocationCard({
	session,
	quest,
	subquest,
	hasSubmitted,
	submittedSubquests,
	setSubmittedSubquests,
	totalSubquests,
	location,
	onCompletion
}: LocationCardParams) {

	const [isSubmissionValid, setIsSubmissionValid] = useState<boolean>(false);
	const [isJudging, setIsJudging] = useState<boolean>(false);

	console.log(location);
	const { latitude: userLat, longitude: userLon } = location.coords;

	const goalLat = subquest.latitude!;
	const goalLon = subquest.longitude!;

	// Submit quest entry
	const submitEntry = async () => {
		setIsJudging(true);
		const distanceMeters = haversineDistance([userLat, userLon], [goalLat, goalLon]) * 1000;

		console.log(`user lat: ${userLat} | goal lat: ${goalLat}`);
		console.log(`user lon: ${userLon} | goal lon: ${goalLon}`);
		console.log(`Calculated distance: ${distanceMeters}`)

		if (distanceMeters > TOLERANCE_RADIUS_METERS) {
			setIsJudging(false);
			Alert.alert("Your location did not match the required one. Try again.");
			setIsSubmissionValid(false);
		} else {
			// Add location
			const { error } = await supabase.from("submission")
				.insert({
					subquest_id: subquest.id,
					user_id: session.user.id,
				});

			const newSubmitted = [...submittedSubquests, subquest.id];
			setSubmittedSubquests(newSubmitted);

			if (newSubmitted.length === totalSubquests) {
				const { error } = await supabase.from("completion")
					.insert({
						quest_id: quest.id,
						user_id: session.user.id
					});
				console.log("user completed location quest")
				if (error) throw error;
			}

			setIsJudging(false);
			if (error) {
				console.error(error);
				throw error;
			}
			setIsSubmissionValid(true);
			await onCompletion(newSubmitted);
		}
	}

	return <>
		<Card style={styles.imageCard}>
			{hasSubmitted ? <>
				{/* Submission Status */}

				<Card style={styles.submittedCard}>
					<Text category="h6" style={styles.sectionTitle}>
						✅ Quest Completed!
					</Text>
				</Card>
			</>
				: <>
					<Text category="h6" style={styles.sectionTitle}>
						{subquest.prompt} {'\n'}
					</Text>
					<Text>
						Visit the coordinates {goalLon}, {goalLat}
					</Text>

					<Button
						style={styles.submitButton}
						onPress={submitEntry}
						disabled={isJudging}
					>
						{isJudging ? 'Judging...' : 'I\'m here'}
					</Button>
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
