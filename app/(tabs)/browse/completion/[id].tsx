// app/posts/[id].tsx
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Text, Layout } from "@ui-kitten/components";
import { useAuth } from '@/context/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, ScrollView, Alert, Pressable, TextInput } from 'react-native';

import { Profile, Subquest } from '@/types';


export default function Post() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();

	// State management
	const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
	const [profiles, setProfiles] = useState<Profile | null>(null);

	// Photo upload state management
	const [subquests, setSubquests] = useState<Subquest[]>([]);
	const [subquestsCompleted, setSubquestsCompleted] = useState<number[]>([]);


	// Run this code when the user completes the quest
	useEffect(() => {
	}, [subquestsCompleted, subquests, session, id]);

	// Load quest details and check submission status
	useEffect(() => {
		if (!session) return;

		const loadQuestData = async () => {
			setLoadingProfiles(true);

			// Load people who have completed the quest
			const { data: winnerIDs, error: questError } = await supabase
				.from('completion')
				.select('*')
				.eq('id', id)
				.single();

			// Get all the profiles of the winners 

			if (questError) {
				console.error('Error loading quest:', questError);
				Alert.alert('Error', 'Failed to load quest details');
				return;
			}
		};
	});

	if (!session) return <Redirect href="/(auth)" />;

	return (
		<>
			<ScrollView style={styles.container}>

				{subquests.map((subquest, idx) => {
					return <ProfileCard
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
