import { supabase } from "@/lib/supabase";
import { Text, Button } from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

interface EmailVerificationProps {
	email: string;
	password: string;
	onVerificationComplete: () => void;
}

export function EmailVerification({ email, password, onVerificationComplete }: EmailVerificationProps) {
	const [verified, setVerified] = useState<boolean>(false);

	const handleVerification = async () => {
		setVerified(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("There was an error signing in");
			throw error;
		}

		onVerificationComplete();
	};

	useEffect(() => {
		const interval = setInterval(async () => {
			const res = await supabase.rpc('check_email_verified', { p_email: email })
			if (res.data) {
				handleVerification();
			}
		}, 5000);

		return () => clearInterval(interval);
	}, [email]);

	return (
		<View style={styles.content}>
			<Text style={styles.titleText}>Verify your email</Text>
			<Text style={styles.description}>
				Once we have verified your email, we may continue with the onboarding process.
				Please check your inbox and click the verification link.
			</Text>
			{verified && (
				<Button onPress={handleVerification} style={styles.button}>
					You have been verified! Click here to continue.
				</Button>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
	},
	container: {
		flex: 1,
		padding: 20,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	titleText: {
		fontSize: 28,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 20,
	},
	description: {
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 30,
		lineHeight: 24,
	},
	button: {
		width: '100%',
		marginTop: 20,
	},
});