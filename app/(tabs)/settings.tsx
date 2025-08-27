import { useState, useEffect } from 'react'
import {
	View,
	TextInput,
	StyleSheet,
	Alert,
	Image,
	ScrollView,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '@/context/Auth';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Button, Card, Text, Layout } from '@ui-kitten/components';
import { decode } from 'base64-arraybuffer'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, router } from 'expo-router';

export default function Settings() {
	const { session, loading } = useAuth();

	const [username, setUsername] = useState<string>('');
	const [age, setAge] = useState<number>(0);
	const [city, setCity] = useState<string>('');
	const [citySuggestion, setCitySuggestion] = useState<string | null>(null);
	const [image, setImage] = useState<string>('');
	const [uploading, setUploading] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);

	useEffect(() => {
		if (session) {
			(async () => {
				try {
					if (!session?.user) throw new Error('No user on the session!')

					const { data, error, status } = await supabase
						.from('profile')
						.select('city, age, username')
						.eq('id', session.user.id)
						.single();

					if (error && status !== 406) throw error

					if (data) {
						setCity(data.city || '')
						setAge(data.age || 0)
						setUsername(data.username || '')
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

		try {
			setSaving(true);

			const updates = {
				id: session.user.id,
				city: city.trim() || null,
				age: age || null,
				username: username.trim() || null,
			}

			const { error: profileErr } = await supabase.from('profile').upsert(updates)
			if (profileErr) {
				console.error(profileErr);
				Alert.alert('Error', 'Failed to update profile.');
				return;
			}

			if (image) {
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
					Alert.alert('Error', 'Failed to upload profile picture.');
					return;
				}
			}
			Alert.alert('Success', 'Profile updated successfully!');
		} catch (error) {
			console.error('Error updating profile:', error);
			Alert.alert('Error', 'Failed to update profile.');
		} finally {
			setSaving(false);
		}
	}

	const pickImage = async () => {
		try {
			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});
			if (!result.canceled && result.assets[0]) {
				setImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Error picking image:', error);
			Alert.alert('Error', 'Failed to pick image.');
		}
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		await AsyncStorage.clear();
		router.replace("/(auth)");
	}

	const updateCityResults = async (s: string) => {
		setCity(s);
		const { data, error } = await supabase
			.from('cities')
			.select('*')
			.ilike('place', `%${s}%`)
			.order('population', { ascending: false })
			.limit(1);
		if (error) console.error(error);
		console.log(data);
		if (data) setCitySuggestion(data[0].place!);
	}


	if (loading) return (
		<Layout style={styles.loadingContainer}>
			<Text category="h6">Loading...</Text>
		</Layout>
	);

	if (!session) return <Redirect href="/(auth)"/>

	return (
		<ScrollView style={styles.container}>
			{/* Header */}
			<Layout style={styles.header}>
				<Text category="h4" style={styles.headerTitle}>
					Settings
				</Text>
				<Text category="s1" style={styles.headerSubtitle}>
					Manage your profile and preferences
				</Text>
			</Layout>

			{/* Profile Picture Section */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Profile Picture
				</Text>

				<View style={styles.profileImageContainer}>
					{image ? (
						<Image source={{ uri: image }} style={styles.profileImage} />
					) : (
						<View style={styles.defaultAvatar}>
							<Text style={styles.avatarText}>
								{session.user.email?.charAt(0)?.toUpperCase() || 'U'}
							</Text>
						</View>
					)}

					<Button
						style={styles.imageButton}
						onPress={pickImage}
						disabled={uploading}
					>
						{uploading ? 'Uploading...' : 'Change Photo'}
					</Button>
				</View>
			</Card>

			{/* Account Information */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Account Information
				</Text>

				<View style={styles.inputGroup}>
					<Text category="s1" style={styles.inputLabel}>
						Email
					</Text>
					<Text category="p1" style={styles.emailText}>
						{session.user.email}
					</Text>
				</View>

				<View style={styles.inputGroup}>
					<Text category="s1" style={styles.inputLabel}>
						Username
					</Text>
					<TextInput
						style={styles.input}
						value={username}
						onChangeText={setUsername}
						placeholder="Enter your username"
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>
			</Card>

			{/* Personal Information */}
			<Card style={styles.section}>
				<Text category="h6" style={styles.sectionTitle}>
					Personal Information
				</Text>

				<View style={styles.inputGroup}>
					<Text category="s1" style={styles.inputLabel}>
						City
					</Text>
					<View style={styles.inputWrapper}>
						<TextInput
							style={styles.inputCity}
							value={city}
							onChangeText={(s) => updateCityResults(s)}
							placeholder="Enter city"
							autoCorrect={false}
							autoCapitalize="none"
						/>
						{citySuggestion && city && citySuggestion.toLowerCase().startsWith(city.toLowerCase()) && citySuggestion !== city && (
							<Text style={styles.suggestionText}>
								{city + citySuggestion.substring(city.length)}
							</Text>
						)}
					</View>
				</View>

				<View style={styles.inputGroup}>
					<Text category="s1" style={styles.inputLabel}>
						Age
					</Text>
					<TextInput
						style={styles.input}
						value={age.toString()}
						onChangeText={(str) => setAge(Number(str.replace(/[^0-9]/g, '')) || 0)}
						placeholder="Enter your age"
						keyboardType="numeric"
					/>
				</View>
			</Card>

			{/* Save Button */}
			<Card style={styles.section}>
				<Button
					style={styles.saveButton}
					onPress={updateProfile}
					disabled={saving || uploading}
				>
					{saving ? 'Saving...' : 'Save Changes'}
				</Button>
			</Card>

			{/* Sign Out */}
			<Card style={styles.section}>
				<Button
					style={styles.signOutButton}
					onPress={signOut}
					status="danger"
				>
					Sign Out
				</Button>
			</Card>
		</ScrollView>
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
	header: {
		padding: 20,
		alignItems: 'center',
		backgroundColor: '#fff',
		marginBottom: 10,
	},
	headerTitle: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	headerSubtitle: {
		color: '#666',
		textAlign: 'center',
	},
	section: {
		margin: 10,
		marginBottom: 10,
	},
	sectionTitle: {
		fontWeight: 'bold',
		marginBottom: 15,
	},
	profileImageContainer: {
		alignItems: 'center',
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 15,
	},
	defaultAvatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 15,
		backgroundColor: '#f0f0f0',
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarText: {
		fontSize: 40,
		fontWeight: 'bold',
		color: '#666',
	},
	imageButton: {
		width: '100%',
	},
	inputGroup: {
		marginBottom: 15,
	},
	inputLabel: {
		fontWeight: 'bold',
		marginBottom: 5,
		color: '#333',
	},
	emailText: {
		padding: 12,
		backgroundColor: '#f0f0f0',
		borderRadius: 8,
		color: '#666',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	saveButton: {
		width: '100%',
	},
	signOutButton: {
		width: '100%',
	},
	inputWrapper: {
		position: 'relative',
		width: '100%',
	},
	suggestionText: {
		position: 'absolute',
		top: 0,
		left: 0,
		color: '#aaa',
		fontSize: 16,
		backgroundColor: 'transparent',
		padding: 12,
		pointerEvents: 'none',
		zIndex: 1,
		fontFamily: 'System',
		fontWeight: '400',
		letterSpacing: 0,
	},
	inputCity: {
		borderColor: '#ccc',
		borderWidth: 1,
		padding: 12,
		color: '#000',
		fontSize: 16,
		backgroundColor: 'transparent',
		zIndex: 2,
		fontFamily: 'System',
		fontWeight: '400',
		letterSpacing: 0,
	},
});
