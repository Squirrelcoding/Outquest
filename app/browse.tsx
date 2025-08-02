import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
	Alert,
	ScrollView,
	View,
} from 'react-native';
import { Card, Text } from '@ui-kitten/components';
import { router } from 'expo-router';

// import { Avatar, Button, Card, Text as RNText } from 'react-native-paper';

// const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />

export default function BrowseQuests() {
	const { session, loading } = useAuth();

	const [quests, setQuests] = useState<any>(null);

	useEffect(() => {
		if (session) {
			(async () => {
				try {
					if (!session?.user) throw new Error('No user on the session!')

					const { data, error, status } = await supabase.from('quest').select();

					if (error && status !== 406) throw error

					if (data) setQuests(data);
				} catch (error) {
					if (error instanceof Error) {
						Alert.alert('Error loading quest data', error.message)
					}
				}
			})();
		};
	}, [session]);

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth />

	return <ScrollView>
		{quests ? <View>
			{quests.map((quest: any, idx: number) => {
				return <Card key={idx} onPress={() => router.push(`/posts/${quest.id}`)}>
					<Text>{quest.title}</Text>
					<Text>By {quest.author}</Text>
					<Text>{quest.description}</Text>
					<Text>Created {new Date(quest.created_at).toDateString()}</Text>
					<Text>Ends {new Date(quest.deadline).toDateString()}</Text>
				</Card>
			})}
		</View> : <Text>Loading...</Text>}

	</ScrollView>
}
