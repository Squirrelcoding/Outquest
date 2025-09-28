import { useAuth } from '@/context/Auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
	Alert,
	ScrollView,
	TextInput,
	View,
	StyleSheet,
	RefreshControl,
	ActivityIndicator,
} from 'react-native';
import { Button, Card, Text, Layout } from '@ui-kitten/components';
import { useLocation } from '@/context/Location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import QuestBox from '@/components/QuestBox';
import { Redirect } from 'expo-router';
import { Quest } from '@/types';

export default function BrowseQuests() {
	const { session, loading } = useAuth();
	const { location, loading: locLoading } = useLocation();

	const [quests, setQuests] = useState<Quest[]>([]);
	const [usernames, setUsernames] = useState<string[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [searching, setSearching] = useState(false);

	// Search settings
	const [deadline, setDeadline] = useState<Date>(new Date());
	const [radius, setRadius] = useState<number | null>(null);
	const [title, setTitle] = useState<string>("");
	const [showExpired, setShowExpired] = useState<boolean>(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const onChange = (event: any, selectedDate: any) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDeadline(selectedDate);
		}
	};

	const showDatepicker = () => {
		setShowDatePicker(true);
	};

	const loadQuests = async () => {
		try {
			if (!session?.user) throw new Error('No user on the session!')

			let query = supabase.from('quest').select();

			// Filter out expired quests by default
			if (!showExpired) {
				query = query.gt('deadline', new Date().toISOString());
			}

			const { data, error, status } = await query;

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
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadQuests();
		setRefreshing(false);
	};

	useEffect(() => {
		if (session) {
			loadQuests();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session, showExpired]);

	const submitQuery = async () => {
		setSearching(true);
		try {
			if (radius !== null) {
				if (!location) {
					Alert.alert('Location Error', 'Unable to get your location. Please enable location services.');
					return;
				}

				const { data, error } = await supabase.rpc('get_search_results', {
					current_lat: location.coords.latitude,
					current_long: location.coords.longitude,
					radius_meters: radius
				});

				if (error) throw error;

				const questIDs = data.map((result: any) => result.id);

				let query = supabase.from("quest")
					.select("*")
					.in('id', questIDs);

				if (deadline) query = query.lte('deadline', deadline.toISOString());
				if (title) query = query.ilike('title', `%${title}%`);

				// Filter out expired quests unless showExpired is true
				if (!showExpired) {
					query = query.gt('deadline', new Date().toISOString());
				}

				const { data: rawQuestData, error: questError } = await query;
				const questData: Quest[] = rawQuestData!;
				if (questError) throw questError;
				setQuests(questData);
			} else {
				let query = supabase.from("quest").select("*");

				if (title) query = query.ilike('title', `%${title}%`);
				if (deadline) query = query.lte('deadline', deadline.toISOString());

				// Filter out expired quests unless showExpired is true
				if (!showExpired) {
					query = query.gt('deadline', new Date().toISOString());
				}

				const { data: questData, error } = await query;
				if (error) throw error;
				setQuests(questData);
			}
		} catch (error) {
			console.error('Search error:', error);
			Alert.alert('Search Error', 'Failed to search quests. Please try again.');
		} finally {
			setSearching(false);
		}
	};

	const clearFilters = () => {
		setTitle("");
		setRadius(null);
		setDeadline(new Date());
		setShowExpired(false);
		loadQuests();
	};

	if (loading || locLoading) {
		return (
			<Layout style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
				<Text category="s1" style={styles.loadingText}>Loading...</Text>
			</Layout>
		);
	}

	if (!session) return <Redirect href="/(auth)" />;

	return (
		<Layout style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{/* Header */}
				<Layout style={styles.header}>
					<Text category="h4" style={styles.headerTitle}>
						Browse Quests
					</Text>
					<Text category="s1" style={styles.headerSubtitle}>
						Discover and join exciting quests
					</Text>
				</Layout>

				{/* Search Filters */}
				<Card style={styles.searchCard}>
					<Text category="h6" style={styles.sectionTitle}>
						Search Filters
					</Text>

					<View style={styles.inputGroup}>
						<Text category="s1" style={styles.inputLabel}>
							Quest Title
						</Text>
						<TextInput
							placeholder='Search by title...'
							style={styles.input}
							value={title}
							onChangeText={setTitle}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text category="s1" style={styles.inputLabel}>
							Search Radius (km)
						</Text>
						<TextInput
							placeholder='0 = same city, leave empty for all'
							style={styles.input}
							value={radius?.toString() || ''}
							onChangeText={(str) => setRadius(str ? Number(str) : null)}
							keyboardType="numeric"
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text category="s1" style={styles.inputLabel}>
							Deadline
						</Text>
						<Button
							style={styles.dateButton}
							onPress={showDatepicker}
							appearance="outline"
						>
							{deadline.toDateString()}
						</Button>
					</View>

					<View style={styles.inputGroup}>
						<View style={styles.checkboxContainer}>
							<Button
								style={styles.checkbox}
								appearance={showExpired ? "filled" : "outline"}
								onPress={() => setShowExpired(!showExpired)}
							>
								{showExpired ? "✓" : ""}
							</Button>
							<Text category="s1" style={styles.checkboxLabel}>
								Show expired quests
							</Text>
						</View>
					</View>

					{showDatePicker && (
						<DateTimePicker
							testID="dateTimePicker"
							value={deadline}
							mode="date"
							onChange={onChange}
						/>
					)}

					<View style={styles.buttonGroup}>
						<Button
							style={styles.searchButton}
							onPress={submitQuery}
							disabled={searching}
						>
							{searching ? 'Searching...' : 'Search Quests'}
						</Button>
						<Button
							style={styles.clearButton}
							onPress={clearFilters}
							appearance="ghost"
						>
							{evaProps => (
								<Text {...evaProps} style={[evaProps.style, styles.greenTextStyle]}>
									Clear Filters
								</Text>
							)}
						</Button>
					</View>
				</Card>

				{/* Results Section */}
				<Card style={styles.resultsCard}>
					<View style={styles.resultsHeader}>
						<Text category="h6" style={styles.sectionTitle}>
							Available Quests
						</Text>
						{quests && (
							<Text category="s1" style={styles.resultCount}>
								{quests.length} quest{quests.length !== 1 ? 's' : ''} found
							</Text>
						)}
					</View>

					{quests ? (
						quests.length > 0 ? (
							<View style={styles.questsList}>
								{quests.map((quest: Quest, idx: number) => (
									<QuestBox
										key={idx}
										id={quest.id}
										title={quest.title!}
										author_username={usernames[idx]}
										description={quest.description!}
										deadline={quest.deadline!}
										created_at={quest.created_at!}
										type={quest.type}
									/>
								))}
							</View>
						) : (
							<View style={styles.emptyState}>
								<Ionicons name="search-outline" size={48} color="#ccc" />
								<Text category="h6" style={styles.emptyTitle}>
									No quests found
								</Text>
								<Text category="p1" style={styles.emptySubtitle}>
									Try adjusting your search filters
								</Text>
							</View>
						)
					) : (
						<View style={styles.loadingState}>
							<ActivityIndicator size="large" />
							<Text category="s1" style={styles.loadingText}>Loading quests...</Text>
						</View>
					)}
				</Card>
			</ScrollView>
		</Layout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	scrollView: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
	},
	loadingText: {
		marginTop: 10,
		color: '#666',
	},
	header: {
		padding: 20,
		alignItems: 'center',
		backgroundColor: '#fff',
		marginBottom: 10,
	},
	headerTitle: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	headerSubtitle: {
		color: '#666',
		textAlign: 'center',
	},
	searchCard: {
		margin: 10,
		marginBottom: 10,
	},
	resultsCard: {
		margin: 10,
		marginBottom: 20,
	},
	sectionTitle: {
		fontWeight: 'bold',
		marginBottom: 15,
	},
	inputGroup: {
		marginBottom: 15,
	},
	inputLabel: {
		fontWeight: 'bold',
		marginBottom: 5,
		color: '#333',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	dateButton: {
		width: '100%',
	},
	buttonGroup: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 10,
	},
	searchButton: {
		flex: 1,
		backgroundColor: "#32908F",
		borderColor: "white"
	},
	clearButton: {
		flex: 1,
	},
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 4,
	},
	checkboxLabel: {
		color: '#333',
		flex: 1,
	},
	resultsHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	resultCount: {
		color: '#666',
	},
	questsList: {
		gap: 10,
	},
	emptyState: {
		alignItems: 'center',
		padding: 40,
	},
	emptyTitle: {
		marginTop: 15,
		marginBottom: 5,
		color: '#666',
	},
	emptySubtitle: {
		color: '#999',
		textAlign: 'center',
	},
	loadingState: {
		alignItems: 'center',
		padding: 40,
	},
	greenTextStyle: {
		color: "#32908F",
	}
});