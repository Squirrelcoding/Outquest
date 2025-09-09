import CreateClassicQuest from '@/components/CreateClassicQuest';
import CreateLocationQuest from '@/components/CreateLocationQuest';
import { useAuth } from '@/context/Auth';
import { Button, Text } from "@ui-kitten/components";
import { Redirect } from 'expo-router';
import { useState } from 'react';

export default function CreateQuest() {
	const { session, loading } = useAuth();
	const [state, setState] = useState<boolean>(false);

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Redirect href="/(auth)" />

	return <>
		<Button onPress={() => setState(!state)}>Click to switch</Button>
		{state && <CreateClassicQuest session={session}/>}
		{!state && <CreateLocationQuest session={session}/>}
	</>
}
