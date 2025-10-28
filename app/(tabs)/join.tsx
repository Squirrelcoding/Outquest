import { useState } from 'react'
import { View, TextInput, StyleSheet, Alert } from 'react-native'
import { Button, Text } from '@ui-kitten/components'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/Auth'
import { Redirect, router } from 'expo-router'

export default function JoinByCode() {
	const { session, loading } = useAuth()
	const [code, setCode] = useState<string>('')
	const [submitting, setSubmitting] = useState<boolean>(false)

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Redirect href="/(auth)" />

	async function handleJoin() {
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
				.eq('id', questData.id)
				.maybeSingle();

			if (questError || !quest) {
				console.error('Error loading quest for code:', questError)
				Alert.alert('Error', 'Could not load quest for this code.')
				return;
			}

			// Navigate to the appropriate post page based on quest type
			const routeType = quest.type || 'COMMUNITY'
			// router.push typing is strict in generated router types; cast to any for dynamic route
			router.push((`/browse/posts/${routeType}/${quest.id}`) as any)
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
				placeholder="Enter code"
				style={styles.input}
				autoCapitalize="characters"
				autoCorrect={false}
			/>

			<Button onPress={handleJoin} disabled={submitting || !code.trim()} style={styles.button}>
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
	button: {
		marginTop: 8,
	},
})
