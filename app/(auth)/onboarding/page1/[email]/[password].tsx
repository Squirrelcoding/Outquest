import { supabase } from "@/lib/supabase";
import { Text, Button } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

export default function Page1() {
	const [verified, setVerified] = useState<boolean>(false);
	const { email, password } = useLocalSearchParams();

	const continueOnboarding = async () => {
		setVerified(true);
		// Sign the user in
		const { error } = await supabase.auth.signInWithPassword({
			email: email as string,
			password: password as string,
		});

		if (error) {
			console.error("There was an error. You're cooked.");
			throw error;
		}
		console.log("HEREEE");
		router.replace(`/(auth)/onboarding/page2/${email}/${password}`);
	};

	useEffect(() => {
		const interval = setInterval(async () => {
			const res = await supabase.rpc('check_email_verified', { p_email: email })
			console.log(`Entire result: ${JSON.stringify(res)}`);
			if (res.data) {
				continueOnboarding();
			};
		}, 5000) // check every 5 seconds

		return () => clearInterval(interval)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [email]);

	return <>
		<Text style={styles.titleText}>Verify your email</Text>
		<Text>Once we have verified your email, we may continue with the onboarding process. Click the button below once you have </Text>
		{verified && <Button onPress={continueOnboarding} style={styles.button}>
			You have been verified! If you have not been automatically redirected, click here.
		</Button>}
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