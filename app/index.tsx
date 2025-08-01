// app/profile.tsx or any screen
import { View, Text, Button } from 'react-native'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { supabase } from '@/lib/supabase'
import Auth from '../components/Auth';
import { useAuth } from '../context/Auth';
import { router } from 'expo-router';

export default function Profile() {
	const { session, loading } = useAuth();

	if (loading) return <Text>Loading...</Text>

	if (!session) return <Auth/>
	// await supabase.auth.signOut()
	// await AsyncStorage.clear()

	return (
		<View>
			<Text>Welcome, {session.user.email}</Text>
			<Text>Home</Text>
			<Button title="Go to Settings" onPress={() => router.push('/settings')} />
			<Button title="Make a quest" onPress={() => router.push('/create')} />
		</View>
	)
}
