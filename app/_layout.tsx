import { Stack } from 'expo-router'
import { AuthProvider } from '../context/Auth';

export default function App() {
	return (
		<AuthProvider>
			<Stack />
		</AuthProvider>
	)
}
