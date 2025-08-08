import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
	Alert,
	ScrollView,
	TextInput,
	View,
	StyleSheet
} from 'react-native';
import { Avatar, Button, Card, Layout, Popover, Text } from '@ui-kitten/components';
import { router } from 'expo-router';

// import { Avatar, Button, Card, Text as RNText } from 'react-native-paper';

// const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />

export default function BrowseQuests() {
	const { session, loading } = useAuth();
	const [quests, setQuests] = useState<any>(null);
	const [usernames, setUsernames] = useState<string[]>([]);

	// Search settings
	const [timeLeft, setTimeLeft] = useState<string[]>([]);
	const [radius, setRadius] = useState<number>();
	const [numUploads, setNumUploads] = useState<number>();
	const [minimumLikeLimit, setMinimumLikeLimit] = useState<number>(10000000);
	const [maximumLikeLimit, setMaximumLikeLimit] = useState<number>(0);
	const [author, setAuthor] = useState<string>("");
	const [title, setTitle] = useState<string>("");

	const [searchVisible, setSearchVisible] = useState<boolean>(false);

	useEffect(() => {
		if (session) {
			(async () => {
				try {
					if (!session?.user) throw new Error('No user on the session!')

					const { data, error, status } = await supabase.from('quest').select();

					if (error && status !== 406) throw error

					if (data) setQuests(data);

					console.log(data);

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

	const renderToggleButton = (): React.ReactElement => (
		<Button onPress={() => setSearchVisible(true)}>
			TOGGLE POPOVER
		</Button>
	);

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth />

	return <ScrollView>
		<TextInput placeholder='Quest Title' style={styles.input} />
		<TextInput placeholder='Time Left' style={styles.input} />
		<TextInput placeholder='Radius' style={styles.input} />
		<TextInput placeholder='Number of uploads' style={styles.input} />
		<TextInput placeholder='Minimum likes' style={styles.input} />
		<TextInput placeholder='Maximum likes' style={styles.input} />
		<TextInput placeholder='Author username' style={styles.input} />
		<TextInput placeholder='Author UUID' style={styles.input} />
		<TextInput placeholder='Quest title' style={styles.input} />
		<TextInput placeholder='Quest UUID' style={styles.input} />
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

		<Popover
			visible={searchVisible}
			anchor={renderToggleButton}
			fullWidth={true}
			onBackdropPress={() => setSearchVisible(false)}
		>
			<Layout style={styles.content}>
				<Text>
					Welcome to UI Kitten 😻
				</Text>
			</Layout>
		</Popover>
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