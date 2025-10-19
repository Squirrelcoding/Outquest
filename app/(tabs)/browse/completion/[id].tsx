// app/posts/[id].tsx
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProfileCard from "@/components/ProfileCard";
import { StyleSheet, ScrollView, Alert, Pressable, TextInput } from 'react-native';
import { Text } from "@ui-kitten/components";

import { Profile, Subquest } from '@/types';


export default function Post() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();

	// State management
	const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [completions, setCompletions] = useState<Subquest[]>([]);

	// Photo upload state management
	const [subquests, setSubquests] = useState<Subquest[]>([]);
	const [subquestsCompleted, setSubquestsCompleted] = useState<number[]>([]);


	// Run this code when the user completes the quest
	useEffect(() => {
	}, [subquestsCompleted, subquests, session, id]);

	// Load quest details and check submission status
	useEffect(() => {
		if (!session) return;

		const loadCompletions = async () => {
			setLoadingProfiles(true);

			try {
				const { data: completionData, error: completionError } = await supabase
					.from('completion')
					.select('*')
					.eq('quest_id', id);

				console.log(`Quest id: ${id}`)
				console.log(`COMPLETION DATA: ${completionData}`);
				if (completionError) throw completionError;

				if (!completionData) {
					setProfiles([]);
					setCompletions([]);
					return;
				}

				setCompletions(completionData);

				// Fetch profiles for each completion
				const profileIds = completionData.map((c: any) => c.user_id).filter(Boolean);
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

				setProfiles(profileData || []);
			} catch (err) {
				console.error('Error loading completions:', err);
				Alert.alert('Error', 'Failed to load completions');
			} finally {
				setLoadingProfiles(false);
			}
		};

		loadCompletions();
	}, [session, id]);

	if (!session) return <Redirect href="/(auth)" />;

	return (
		<>
			<ScrollView style={styles.container}>
				{loadingProfiles ? (
					<Text style={{ padding: 20, textAlign: 'center' }}>Loading completed users...</Text>
				) : profiles.length === 0 ? (
					<Text style={{ padding: 20, textAlign: 'center' }}>No completions found for this quest.</Text>
				) : (
					profiles.map((p: Profile, idx: number) => {
						const completion = completions.find((c: any) => c.user_id === p.id) as any;
						return <ProfileCard key={p.id} profile={p} completion={completion} rank={idx + 1} />
					})
				)}
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
