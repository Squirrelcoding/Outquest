import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
	Alert,
	ScrollView,
	TextInput,
	View,
	StyleSheet,
} from 'react-native';
import { Button, Card, Text } from '@ui-kitten/components';
import { router } from 'expo-router';
import { useLocation } from '@/context/Location';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNDateTimePicker from '@react-native-community/datetimepicker';

export default function BrowseQuests() {
	const { session, loading } = useAuth();
	const { location, loading: locLoading } = useLocation();

	const [quests, setQuests] = useState<any>(null);
	const [usernames, setUsernames] = useState<string[]>([]);

	// Search settings
	const [deadline, setDeadline] = useState<Date>(new Date());
	const [radius, setRadius] = useState<number | null>(null);
	const [title, setTitle] = useState<string>("");

	const [date, setDate] = useState(new Date());
	const [show, setShow] = useState(false);

	const onChange = (event: any, selectedDate: any) => {
		const currentDate = selectedDate;
		setShow(false);
		setDate(currentDate);
	};

	const showMode = (currentMode: any) => {
		setShow(true);
	};

	const showDatepicker = () => {
		showMode('date');
	};

	const showTimepicker = () => {
		showMode('time');
	};

	useEffect(() => {
		if (session) {
			(async () => {
				try {
					if (!session?.user) throw new Error('No user on the session!')

					const { data, error, status } = await supabase.from('quest').select();

					if (error && status !== 406) throw error

					if (data) setQuests(data);

					// Get the usernames for each quest author
					const usernames = await Promise.all(
						data!.map(async (quest) => {
							const { data: usernameData, error: usernameError } = await supabase.from("profile").select("*").eq('id', quest.author);
							if (usernameError) throw usernameError;
							return usernameData[0].username;
						})
					);
					setUsernames(usernames);

				} catch (error) {
					if (error instanceof Error) {
						Alert.alert('Error loading quest data', error.message)
					}
				}
			})();
		};
	}, [session]);

	const submitQuery = async () => {
		if (radius) {
			if (!location) {
				console.error("failed to get location");
				return;
			}
			console.log(location);
			const { data, error } = await supabase.rpc('get_search_results', {
				current_lat: location.coords.latitude,
				current_long: location.coords.longitude,
				radius_meters: radius
			});

			const questIDs = data.map((result: any) => result.id);

			let query = supabase.from("quest")
				.select("*")
				.in('id', questIDs);

			if (deadline) query = query.lt('deadline', deadline);
			if (title) query = query.ilike('title', `%${title}%`);

			const { data: questData, error: questError } = await query;
			setQuests(questData);

			if (questError) {
				console.error(questError);
				throw questError;
			}
		} else {
			let query = supabase.from("quest")
				.select("*");

			if (title) query = query.ilike('title', `%${title}%`);
			if (deadline) query = query.lt('deadline', deadline);

			const { data: questData, error } = await query;

			if (error) {
				console.error(error);
				throw error;
			}
			setQuests(questData);
		}
	};


	if (loading && locLoading) return <Text>Loading...</Text>
	if (!session) return <Auth />

	return <ScrollView>
		<TextInput placeholder='Quest Title' style={styles.input} onChangeText={setTitle} />
		<TextInput placeholder='Radius (Set 0 for same city)' style={styles.input} onChangeText={(str) => setRadius(Number(str))} />
		<DateTimePicker
			testID="dateTimePicker"
			value={deadline}
			mode={"date"}
			is24Hour={true}
			onChange={onChange}
		/>
		<Button onPress={submitQuery}>Submit Query</Button>
		{/* <TextInput placeholder='Minimum likes' style={styles.input} /> */}
		{/* <TextInput placeholder='Time Left' style={styles.input} /> */}
		{/* <TextInput placeholder='Maximum likes' style={styles.input} /> */}
		{/* <TextInput placeholder='Author username' style={styles.input} /> */}
		{/* <TextInput placeholder='Author UUID' style={styles.input} /> */}
		{/* <TextInput placeholder='Quest UUID' style={styles.input} /> */}

		<Text>{"\n"}</Text>

		{quests ? <View>
			{quests.map((quest: any, idx: number) => {
				return <Card key={idx} onPress={() => router.push(`/posts/${quest.id}`)}>
					<Text>{quest.title}</Text>
					<Text>By {usernames[idx] || "..."}</Text>
					<Text>{quest.description}</Text>
					<Text>Created {new Date(quest.created_at).toDateString()}</Text>
					<Text>Ends {new Date(quest.deadline).toDateString()}</Text>
				</Card>
			})}
		</View> : <Text>Loading...</Text>}
	</ScrollView>
}

const styles = StyleSheet.create({
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 4,
		paddingVertical: 8,
	},
	avatar: {
		marginHorizontal: 4,
	},
})