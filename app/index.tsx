// app/profile.tsx or any screen
import { View, Text } from 'react-native'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { supabase } from '@/lib/supabase'
import Auth from '../components/Auth';
import { useAuth } from '../context/Auth';
import { router } from 'expo-router';
import { Button } from '@ui-kitten/components';

export default function Profile() {
	const { session, loading } = useAuth();	


	if (loading) return <Text>Loading...</Text>

	if (!session) return <Auth/>


	return (
		
		<View>
			<Text>Welcome, {session.user.email}</Text>
			<Text>Home</Text>
			<Button onPress={() => router.push('/settings')}>Go to Settings</Button>

			<Button onPress={() => router.push('/create')}>Make a quest</Button>
			
			<Button onPress={() => router.push('/browse')}>Browse quests</Button>
		</View>
	)
}
