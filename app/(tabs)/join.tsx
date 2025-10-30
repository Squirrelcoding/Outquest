import { useState } from 'react'
import { View, TextInput, StyleSheet, Alert } from 'react-native'
import { Button, Text } from '@ui-kitten/components'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/Auth'
import { Redirect, router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function JoinByCode() {
	const { session, loading } = useAuth()
	const [code, setCode] = useState<string>('')
	const [submitting, setSubmitting] = useState<boolean>(false)

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Redirect href="/(auth)" />

	async function handleJoin() {
		if (!session) return;
		const trimmed = code.trim()
		if (!trimmed) {
			Alert.alert('Enter code', 'Please enter a valid join code.')
			return
		}

		setSubmitting(true)
		try {
			// Look for a subquest with this code. Community/scan codes are stored in a `code` table.
			const { data: questData, error: subError } = await supabase
				.from('code')
				.select("*")
				.eq("code", code)
				.single();

			if (subError) {
				console.error('Error finding code:', subError)
				Alert.alert('Error', 'Failed to lookup code. Please try again.')
				return
			}

			if (!questData) {
				Alert.alert('Not found', 'Code not found. Check the code and try again.')
				return
			}

			// Load parent quest to check type and privacy
			const { data: quest, error: questError } = await supabase
				.from('quest')
				.select("*")
				.eq('id', questData.quest_id)
				.maybeSingle();

			if (questError || !quest) {
				console.error('Error loading quest for code:', questError)
				Alert.alert('Error', 'Could not load quest for this code.')
				return;
			}

			// Navigate to the appropriate post page based on quest type

			// Make the user join the participant table when they join a live community event and subscribe them to some the event channels
			await supabase.from("event participant").insert({
				user_id: session.user.id,
				quest_id: quest.id
			});
			// Set the current event ID in the global state and send the user to the page
			AsyncStorage.setItem('currentEvent', String(quest.id)).then(() => {
				console.log("Right after");
				router.push((`event/${quest.id}`) as any)
			});

		} finally {
			setSubmitting(false)
		}
	}

	return (
		<View style={styles.container}>
			<Text category="h5">Join Event</Text>

			<Text category="s1" style={styles.label}>
				Enter the invitation code shared by the event host
			</Text>

			<TextInput
				value={code}
				onChangeText={setCode}
				placeholder="Enter code..."
				style={styles.input}
			/>

			<Button onPress={handleJoin} disabled={submitting || !code.trim()} style={styles.actionButton}>
				{submitting ? 'Joining…' : 'Join'}
			</Button>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		gap: 12,
	},
	label: {
		color: '#444',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		backgroundColor: '#fff',
		fontSize: 16,
	},
	actionButton: {
		backgroundColor: "#32908F",
		borderColor: "white",
		marginTop: 10,
	}
})
