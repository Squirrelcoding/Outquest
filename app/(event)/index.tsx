import { useAuth } from '@/context/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from "@ui-kitten/components";
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function CreateQuest() {
	const { session, loading } = useAuth();
	const [eventID, setEventID] = useState<number>(-1);

	useEffect(() => {
		(async () => {
			const val = await AsyncStorage.getItem('currentEvent');
			console.log(`READ VALUE: ${val}`)
			if (val) setEventID(+val);
		})();
	}, []);

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Redirect href="/(auth)" />


	return <>
		<Text>{eventID}</Text>
	</>
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#32908F",
		borderColor: "white"
	}
})