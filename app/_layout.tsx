import { Stack } from 'expo-router'
import { AuthProvider } from '../context/Auth';
import { AppRegistry, SafeAreaView } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { LocationProvider } from '@/context/Location';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { default as mapping } from '../styles/mapping.json';

const combinedMapping = {
	...eva.mapping,
	...mapping,
};

export default function App() {
	return (
		<SafeAreaProvider>
			<AuthProvider>
				<LocationProvider>
					<ApplicationProvider {...eva} theme={eva.light} customMapping={combinedMapping}>
						<Stack>
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
							<Stack.Screen name="(auth)" options={{ headerShown: false }} />
						</Stack>
					</ApplicationProvider>
				</LocationProvider>
			</AuthProvider>
		</SafeAreaProvider>
	)
}

AppRegistry.registerComponent("appName", () => App);

