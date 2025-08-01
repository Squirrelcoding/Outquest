import { Stack } from 'expo-router'
import { AuthProvider } from '../context/Auth';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AppRegistry } from 'react-native';

export default function App() {
	return (
		<AuthProvider>
			<PaperProvider>
				<Stack />
			</PaperProvider>
		</AuthProvider>
	)
}
AppRegistry.registerComponent("appName", () => App);

