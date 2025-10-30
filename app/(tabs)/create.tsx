import CreateClassicQuest from '@/components/create_quest/CreateClassicQuest';
import CreateCommunityQuest from '@/components/create_quest/CreateEventQuest';
import { useAuth } from '@/context/Auth';
import { Button, Text } from "@ui-kitten/components";
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

export default function CreateQuest() {
	const { session, loading } = useAuth();
	const [state, setState] = useState<boolean>(false);

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Redirect href="/(auth)" />

	return <>
		<Button onPress={() => setState(!state)} style={styles.button}>Click to switch</Button>
		{state && <CreateClassicQuest session={session} />}
		{!state && <CreateCommunityQuest session={session} />}
	</>
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#32908F",
		borderColor: "white"
	}
})