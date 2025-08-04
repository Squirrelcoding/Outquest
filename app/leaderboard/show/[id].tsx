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
import { router, useLocalSearchParams } from 'expo-router';

// import { Avatar, Button, Card, Text as RNText } from 'react-native-paper';

// const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />

export default function BrowseQuests() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();

	const [users, setUsers] = useState<any>(null);
	const [owner, setOwner] = useState<boolean>(false);

	useEffect(() => {
		if (!session) return;
		(async () => {
			console.log(`ID: ${id}`)
			const { data: metaData, error: metaError } = await supabase.from('leaderboard meta')
				.select()
				.eq('leaderboard_id', id)
				.single();
			if (metaError) console.error(metaError);
			setOwner(metaData!.owner_id);

			const {data: userIDData, error: userIDError} = await supabase.from('leaderboard')
				.select()
				.eq('leaderboard_id', id);
			
			const userIDs = userIDData!.map((user) => user.user_id);
			
			const {data: userData, error: userError} = await supabase.from('profile')
				.select()
				.in('id', userIDs);
			setUsers(userData);
		})();
	}, [id, session]);

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth />

	return <ScrollView>
		{users ? <View>
			{users.map((user: any, idx: number) => {
				return <Card key={idx} onPress={() => router.push(`/profile/${user.id}`)}>
					<Text>{user.id}</Text>
				</Card>
			})}
		</View> : <Text>Loading...</Text>}

		
	</ScrollView>
}
