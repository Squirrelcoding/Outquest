import { Tabs } from 'expo-router'
import { AuthProvider } from '../context/Auth';
import React from 'react';
import { AppRegistry } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { LocationProvider } from '@/context/Location';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
	return (
		<AuthProvider>
			<LocationProvider>
				<ApplicationProvider {...eva} theme={eva.light}>
					<Tabs 
						screenOptions={{ 
							tabBarActiveTintColor: '#007AFF',
							tabBarInactiveTintColor: '#8E8E93',
							tabBarStyle: {
								backgroundColor: '#fff',
								borderTopWidth: 1,
								borderTopColor: '#E5E5EA',
								paddingBottom: 5,
								paddingTop: 5,
								height: 60,
							},
							headerShown: false,
						}}
					>
						<Tabs.Screen
							name="(tabs)/index"
							options={{
								title: 'Home',
								tabBarIcon: ({ color, size }) => (
									<Ionicons name="home-outline" size={size} color={color} />
								),
								tabBarIconStyle: { marginBottom: -3 },
							}}
						/>
						<Tabs.Screen
							name="(tabs)/browse"
							options={{
								title: 'Browse',
								tabBarIcon: ({ color, size }) => (
									<Ionicons name="search-outline" size={size} color={color} />
								),
								tabBarIconStyle: { marginBottom: -3 },
							}}
						/>
						<Tabs.Screen
							name="(tabs)/create"
							options={{
								title: 'Create',
								tabBarIcon: ({ color, size }) => (
									<Ionicons name="add-circle-outline" size={size} color={color} />
								),
								tabBarIconStyle: { marginBottom: -3 },
							}}
						/>
						<Tabs.Screen
							name="(tabs)/settings"
							options={{
								title: 'Settings',
								tabBarIcon: ({ color, size }) => (
									<Ionicons name="settings-outline" size={size} color={color} />
								),
								tabBarIconStyle: { marginBottom: -3 },
							}}
						/>
						
						{/* Hidden screens - not shown in tab bar */}
						<Tabs.Screen
							name="(tabs)/posts/[id]"
							options={{
								href: null,
							}}
						/>
						<Tabs.Screen
							name="(tabs)/leaderboard"
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
						<Tabs.Screen
							name="(tabs)/debug"
							options={{
								href: null,
							}}
						/>
					</Tabs>
				</ApplicationProvider>
			</LocationProvider>
		</AuthProvider>
	)
}

AppRegistry.registerComponent("appName", () => App);

