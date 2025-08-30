import { Stack } from 'expo-router'
import { AuthProvider } from '../context/Auth';
import { AppRegistry } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { LocationProvider } from '@/context/Location';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function App() {
	return (
		<AuthProvider>
			<LocationProvider>
				<ApplicationProvider {...eva} theme={eva.light}>
					<Stack>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen name="(auth)" options={{ headerShown: false }} />
					</Stack>
				</ApplicationProvider>
			</LocationProvider>
		</AuthProvider>
	)
}

AppRegistry.registerComponent("appName", () => App);

