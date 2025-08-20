// app/submission/[id].tsx
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Card, Text } from "@ui-kitten/components";
import { useAuth } from '@/context/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { SUPABASE_URL } from '@/env';

export default function SubmissionView() {
	const { session, loading } = useAuth();
	const { userID, questID } = useLocalSearchParams();
	const [urls, setURLS] = useState<string[] | null>(null);

	useEffect(() => {
		if (!session) return;
		(async () => {
			const { data } = await supabase.storage.from('quest-upload').list(`${userID}/${questID}`);
			const urls = data!.map((file) => `${SUPABASE_URL}/storage/v1/object/public/quest-upload/${userID}/${questID}/${file.name}`);
			setURLS(urls);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	if (loading) return <Text>Loading...</Text>
	if (!session) return <Redirect href="/(auth)" />

	return <View style={styles.container}>

		{urls ? <ScrollView>
			{urls.map((url, idx) => {
				return <Card key={idx} style={styles.imageContainer}>
					<Image source={{ uri: url }} style={{ width: 200, height: 200 }} />
				</Card>
			})}
		</ScrollView> : <Text>Loading...</Text>}
	</View>
}
const styles = StyleSheet.create({
	titleText: {
		textAlign: "center",
		fontSize: 30
	},
	descriptionText: {
		fontSize: 30
	},
	container: {
		padding: 5,
	},
	image: {
		alignContent: "center"
	},
	imageContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});
