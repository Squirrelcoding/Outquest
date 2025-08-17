import { supabase } from "@/lib/supabase";
import { Text } from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

interface Page1Props {
	email: string;
}

export default function Page1({ email }: Page1Props) {
	const [verified, setVerified] = useState<boolean>(false);

	useEffect(() => {
		const interval = setInterval(async () => {
			const { data } = await supabase.rpc('check_email_verified', { p_email: email })
			if (data) setVerified(true);
		}, 5000) // check every 5 seconds

		return () => clearInterval(interval)
	}, [email]);

	return <>
		<Text style={styles.titleText}>Verify your email</Text>
		<Text>Once we have verified your email, we may continue with the onboarding process. Click the button below once you have </Text>
		{verified && <Text>You have been verified!</Text>}
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