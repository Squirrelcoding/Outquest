import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import Entypo from '@expo/vector-icons/Entypo';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
	const insets = useSafeAreaInsets();

	return <SafeAreaView style={{ flex: 1 }}>
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: '#32908F',
				tabBarInactiveTintColor: '#8E8E93',
				tabBarStyle: {
					backgroundColor: '#fff',
					borderTopWidth: 1,
					borderTopColor: '#E5E5EA',
					paddingTop: 5,
					height: 30 + insets.bottom,
					paddingBottom: insets.bottom,
				},
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home-outline" size={size} color={color} />
					),
					tabBarIconStyle: { marginBottom: -3 },
				}}
			/>
			<Tabs.Screen
				name="browse/index"
				options={{
					title: 'Browse',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="search-outline" size={size} color={color} />
					),
					tabBarIconStyle: { marginBottom: -3 },
				}}
			/>
			<Tabs.Screen
				name="create"
				options={{
					title: 'Create',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="add-circle-outline" size={size} color={color} />
					),
					tabBarIconStyle: { marginBottom: -3 },
				}}
			/>


			<Tabs.Screen
				name="create_qr"
				options={{
					title: 'Location Quest',
					tabBarIcon: ({ color, size }) => (
						<Entypo name="globe" size={size} color={color} />
					),
					tabBarIconStyle: { marginBottom: -3 },
				}}
			/>

			<Tabs.Screen
				name="leaderboard"
				options={{
					title: 'Leaderboard',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="people" size={size} color={color} />
					),
					tabBarIconStyle: { marginBottom: -3 },
				}}
			/>

			<Tabs.Screen
				name="chat"
				options={{
					title: 'Settings',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="settings-outline" size={size} color={color} />
					),
					tabBarIconStyle: { marginBottom: -3 },
				}}
			/>



		</Tabs>

	</SafeAreaView>
}