import { useState, useEffect } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	Image,
} from 'react-native'
import { supabase } from '../lib/supabase'
import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Button } from '@ui-kitten/components';
import { decode } from 'base64-arraybuffer'

export default function Settings() {
	const { session, loading } = useAuth();

	const [age, setAge] = useState<number>(0);
	const [city, setCity] = useState<string>('');
	const [image, setImage] = useState<string>('');
	const [uploading, setUploading] = useState<boolean>(false);

	useEffect(() => {
		if (session) {
			(async () => {
				console.log("CALLED!")
				try {
					if (!session?.user) throw new Error('No user on the session!')

					const { data, error, status } = await supabase
						.from('profiles')
						.select('city, age')
						.eq('id', session.user.id)
						.single();
					console.log(session.user.id);

					if (error && status !== 406) throw error

					if (data) {
						setCity(data.city)
						setAge(data.age)
					}
				} catch (error) {
					if (error instanceof Error) {
						Alert.alert('Error loading profile', error.message)
					}
				}
			})();
		};
	}, [session]);

	const updateProfile = async () => {
		if (!session) return;
		if (!session?.user) throw new Error('No user on the session!')

		const updates = {
			id: session.user.id,
			city,
			age
		}

		const { error: profileErr } = await supabase.from('profiles').upsert(updates)
		if (!profileErr) console.error(profileErr);

		setUploading(true);

		const base64 = await FileSystem.readAsStringAsync(image, {
			encoding: FileSystem.EncodingType.Base64,
		});

		const fileName = `${session.user.id}.jpg`;
		let { error } = await supabase
			.storage
			.from('profile-pics')
			.upload(fileName, decode(base64), {
				contentType: 'image/jpeg',
				upsert: true
			});

		setUploading(false);
		if (error) {
			console.error(error);
			return;
		}
	}


	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images', 'videos'],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});
		console.log(result);

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth />

	return (
		<View>
			<View style={styles.verticallySpaced}>
				<Text style={styles.label}>Email: {session?.user?.email}</Text>
			</View>

			<View style={styles.verticallySpaced}>
				<Text style={styles.label}>City</Text>
				<TextInput
					style={styles.input}
					value={city}
					onChangeText={(str) => setCity(str)}
					placeholder="Los Angeles, California"
				/>
			</View>

			<View style={styles.verticallySpaced}>
				<Text style={styles.label}>Age</Text>
				<TextInput
					style={styles.input}
					value={age.toString()}
					onChangeText={(str) => setAge(Number(str.replace(/[^0-9]/g, '')))}
					placeholder="18"
				/>
			</View>

			<Button onPress={pickImage}>Pick an image from camera roll!!</Button>

			<TouchableOpacity
				style={[styles.button, loading && styles.disabledButton]}
				onPress={updateProfile}
				disabled={loading}
			>
				{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
			</TouchableOpacity>


			{image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}

			<TouchableOpacity style={styles.buttonOutline} onPress={() => supabase.auth.signOut()}>
				<Text style={styles.buttonOutlineText}>Sign Out</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 40,
		padding: 16,
	},
	verticallySpaced: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 6,
		padding: 12,
		fontSize: 16,
	},
	disabledInput: {
		padding: 12,
		backgroundColor: '#eee',
		borderRadius: 6,
		fontSize: 16,
		color: '#666',
	},
	button: {
		backgroundColor: '#007AFF',
		padding: 12,
		borderRadius: 6,
		alignItems: 'center',
		marginTop: 8,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	disabledButton: {
		backgroundColor: '#aaa',
	},
	buttonOutline: {
		padding: 12,
		borderRadius: 6,
		borderColor: '#007AFF',
		borderWidth: 1,
		alignItems: 'center',
		marginTop: 12,
	},
	buttonOutlineText: {
		color: '#007AFF',
		fontWeight: 'bold',
		fontSize: 16,
	},
})
