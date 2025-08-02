import { Stack } from 'expo-router'
import { AuthProvider } from '../context/Auth';
import React from 'react';
// import { PaperProvider } from 'react-native-paper';
import { AppRegistry } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Text } from '@ui-kitten/components';

export default function App() {
	return (
		<AuthProvider>
			<ApplicationProvider {...eva} theme={eva.light}>
				<Stack />
			</ApplicationProvider>
			{/* <PaperProvider> */}
			{/* </PaperProvider> */}
		</AuthProvider>
	)
}
AppRegistry.registerComponent("appName", () => App);

