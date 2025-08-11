import { Stack } from 'expo-router'
import { AuthProvider } from '../context/Auth';
import React from 'react';
import { AppRegistry } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { LocationProvider } from '@/context/Location';

export default function App() {
	return (
		<AuthProvider>
			<LocationProvider>
				<ApplicationProvider {...eva} theme={eva.light}>
					<Stack>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					</Stack>
				</ApplicationProvider>
			</LocationProvider>
			{/* <PaperProvider> */}
			{/* </PaperProvider> */}
		</AuthProvider>
	)
}
AppRegistry.registerComponent("appName", () => App);

