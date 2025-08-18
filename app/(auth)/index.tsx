import React, { useState } from 'react'
import {
	Alert,
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	AppState,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'

// Auto-refresh auth session while app is in foreground
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
})

export default function Auth() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	async function signInWithEmail() {
		setLoading(true)
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) Alert.alert('Sign in error', error.message)
		setLoading(false)
	}

	async function signUpWithEmail() {
		setLoading(true)
		const {
			data: { session },
			error,
		} = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			Alert.alert('Sign up error', error.message);
		}
		if (!session) {
			Alert.alert('Please check your inbox for email verification!');
			router.push(`/(auth)/onboarding/page1/${email}/${password}`);
		}
		setLoading(false);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.titleText}>Get started today</Text>
			<View style={styles.inputContainer}>
				<Text style={styles.label}>Email</Text>
				<TextInput
					style={styles.input}
					value={email}
					onChangeText={setEmail}
					placeholder="email@address.com"
					autoCapitalize="none"
					keyboardType="email-address"
				/>
			</View>

			<View style={styles.inputContainer}>
				<Text style={styles.label}>Password</Text>
				<TextInput
					style={styles.input}
					value={password}
					onChangeText={setPassword}
					placeholder="Password"
					secureTextEntry
					autoCapitalize="none"
				/>
			</View>

			<TouchableOpacity
				style={[styles.button, loading && styles.disabledButton]}
				onPress={signInWithEmail}
				disabled={loading}
			>
				{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.button, loading && styles.disabledButton]}
				onPress={signUpWithEmail}
				disabled={loading}
			>
				{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 10,
		padding: 16,
	},
	inputContainer: {
		marginBottom: 16,
	},
	label: {
		marginBottom: 4,
		fontSize: 16,
		fontWeight: 'bold',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 6,
		padding: 12,
		fontSize: 16,
	},
	button: {
		backgroundColor: '#007AFF',
		padding: 12,
		borderRadius: 6,
		alignItems: 'center',
		marginTop: 12,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	disabledButton: {
		backgroundColor: '#aaa',
	},
	titleText: {
		fontSize: 30,
		textAlign: "center"
	}
})