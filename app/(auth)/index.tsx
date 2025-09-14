import { useState } from 'react'
import {
	Alert,
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	AppState,
	Image as RNImage,
	Dimensions
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { Redirect, router } from 'expo-router'
import { useAuth } from '@/context/Auth'
import { Image } from 'expo-image';
import { EmailVerification } from '@/components/EmailVerification'

const imageSource = require("../../assets/images/grass-touching.jpg");
const screenWidth = Dimensions.get('window').width;

// Auto-refresh auth session while app is in foreground
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh()
	} else {
		supabase.auth.stopAutoRefresh()
	}
});

export default function Auth() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	const { session } = useAuth();
	if (session) return <Redirect href="/(tabs)" />

	async function signInWithEmail() {
		setLoading(true);
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		console.log(`DATA: ${JSON.stringify(data)}`);

		if (error) Alert.alert('Sign in error', error.message)
		setLoading(false);

		router.replace("/(tabs)");
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
			router.replace(`/(auth)/onboarding/page1/${email}/${password}`);
		}
		setLoading(false);
	}

	const registerPage = () => {
		router.replace("/(auth)/page0");
	}

	const { width: imageWidth, height: imageHeight } = RNImage.resolveAssetSource(imageSource);
	const scaledHeight = (imageHeight / imageWidth) * screenWidth;


	return (
		<>
			<Image
				source={imageSource}
				style={{ width: screenWidth, height: scaledHeight }}
				contentFit="contain" // scales correctly
			/>
			<View style={styles.container}>
				<Text style={styles.titleText}>Get started today!{'\n'}</Text>
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

				{/* <Text style={styles.forgotPasswordText}>Forgot Password?</Text> */}

				<TouchableOpacity
					style={[styles.button, loading && styles.disabledButton]}
					onPress={signInWithEmail}
					disabled={loading}
				>
					{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
				</TouchableOpacity>

				<View style={{ alignItems: "center", marginTop: 20 }}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Text>Don&apos;t have an account? </Text>
						<TouchableOpacity onPress={registerPage}>
							<Text style={styles.forgotPasswordText}>Sign up!</Text>
						</TouchableOpacity>
					</View>
				</View>

			</View>
		</>
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
		fontFamily: ""
	},
	forgotPasswordText: {
		fontWeight: 'bold',
		color: "#32908F"
	},
	disabledButton: {
		backgroundColor: '#aaa',
	},
	titleText: {
		fontSize: 30,
		textAlign: "center",
		fontWeight: "bold"
	},
	centerBox: {
		alignItems: "center"
	},
	image: {
		flex: 1,
		width: '100%',
		backgroundColor: '#0553',
	},
});
