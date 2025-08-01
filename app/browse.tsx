import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
	Alert,
	Text,
	View,
} from 'react-native'
import { Avatar, Button, Card, Text as RNText } from 'react-native-paper';

const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />

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

	return <View>
		{quests ? <Text>{JSON.stringify(quests)}</Text> : <Text>Loading...</Text>}

		<Card>
			<Card.Title title="Card Title" subtitle="Card Subtitle" left={LeftContent} />
			<Card.Content>
				<RNText variant="titleLarge">Card title</RNText>
				<RNText variant="bodyMedium">Card content</RNText>
			</Card.Content>
			<Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
			<Card.Actions>
				<Button>Cancel</Button>
				<Button>Ok</Button>
			</Card.Actions>
		</Card>
	</View>
}
