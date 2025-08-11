import { Tabs } from 'expo-router'
import { AuthProvider } from '../context/Auth';
import React from 'react';
import { AppRegistry } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { LocationProvider } from '@/context/Location';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function App() {
	return (
		<AuthProvider>
			<LocationProvider>
				<ApplicationProvider {...eva} theme={eva.light}>
					<Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
						<Tabs.Screen
							name="index"
							options={{
								title: 'Home',
								tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
							}}
						/>
						<Tabs.Screen
							name="settings"
							options={{
								title: 'Settings',
								tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
							}}
						/>
						<Tabs.Screen
							name="browse"
							options={{
								title: 'Explore',
								tabBarIcon: ({ color }) => <FontAwesome size={28} name="search" color={color} />,
							}}
						/>
						<Tabs.Screen
							name="create"
							options={{
								title: 'Create',
								tabBarIcon: ({ color }) => <FontAwesome size={28} name="plus" color={color} />,
							}}
						/>
						<Tabs.Screen
							name="(tabs)/leaderboard/make"
							options={{
								href: null,
							}}
						/>
						<Tabs.Screen
							name="(tabs)/leaderboard/join"
							options={{
								href: null,
							}}
						/>
						<Tabs.Screen
							name="(tabs)/leaderboard/show/[id]"
							options={{
								href: null,
							}}
						/>
						<Tabs.Screen
							name="(tabs)/profile/[id]"
							options={{
								href: null,
							}}
						/>
						<Tabs.Screen
							name="(tabs)/submission/[userID]/[questID]"
							options={{
								href: null,
							}}
						/>
					</Tabs>
				</ApplicationProvider>
			</LocationProvider>
		</AuthProvider >
	)
}
AppRegistry.registerComponent("appName", () => App);

