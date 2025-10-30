import { useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import { Button, Text } from '@ui-kitten/components';
import { router } from "expo-router";

export default function Page0() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const submitForm = () => {
		if (password !== confirmPassword) {
			Alert.alert("Passwords do not match! Try again.");
			return;
		};
		router.replace(`/(auth)/onboarding/page1/${email}/${password}`)
	}

	return <>
		<Text style={styles.titleText}>Register</Text>
		<View style={styles.inputContainer}>
			<TextInput
				style={styles.input}
				value={email}
				onChangeText={setEmail}
				placeholder="Email address"
				autoCapitalize="none"
				keyboardType="email-address"
			/>
		</View>

		<View style={styles.inputContainer}>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				placeholder="Password"
				secureTextEntry
				autoCapitalize="none"
			/>
		</View>

		<View style={styles.inputContainer}>
			<TextInput
				style={styles.input}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				placeholder="Confirm Password"
				secureTextEntry
				autoCapitalize="none"
			/>
		</View>
		<Button style={styles.button} onPress={submitForm}>
			<Text>Unlike</Text>
		</Button>
	</>
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
		backgroundColor: '#32908F',
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
});