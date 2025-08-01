import { useState, useEffect } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
} from 'react-native'
import { supabase } from '../lib/supabase'
import Auth from '@/components/Auth';
import { useAuth } from '@/context/Auth';


export default function CreateQuest() {
	const { session, loading } = useAuth();
	
	const [age, setAge] = useState<number>(0)
	const [city, setCity] = useState<string>('')

	useEffect(() => {
		if (session) {
			(async () => {
				console.log("CALLED!")
				try {
					if (!session?.user) throw new Error('No user on the session!')

					const { data, error, status } = await supabase
						.from('profiles')
						.select('city, age')
						.eq('id', session.user.id)
						.single();
					console.log(session.user.id);

					if (error && status !== 406) throw error

					if (data) {
						setCity(data.city)
						setAge(data.age)
					}
				} catch (error) {
					if (error instanceof Error) {
						Alert.alert('Error loading profile', error.message)
					}
				}
			})();
		};
	}, [session]);

	async function updateProfile({
		city, age
	}: {
	city: string
	age: number
  }) {
		try {
			if (!session?.user) throw new Error('No user on the session!')

			const updates = {
				id: session.user.id,
				city,
				age
			}

			const { error } = await supabase.from('profiles').upsert(updates)

			if (error) {
				console.error(error)
				throw error
			}
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert('Error updating profile', error.message)
			}
		}
	}

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth/>

	return (
		<View>
			<Text>Make a Quest.</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 40,
		padding: 16,
	},
	verticallySpaced: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 6,
		padding: 12,
		fontSize: 16,
	},
	disabledInput: {
		padding: 12,
		backgroundColor: '#eee',
		borderRadius: 6,
		fontSize: 16,
		color: '#666',
	},
	button: {
		backgroundColor: '#007AFF',
		padding: 12,
		borderRadius: 6,
		alignItems: 'center',
		marginTop: 8,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	disabledButton: {
		backgroundColor: '#aaa',
	},
	buttonOutline: {
		padding: 12,
		borderRadius: 6,
		borderColor: '#007AFF',
		borderWidth: 1,
		alignItems: 'center',
		marginTop: 12,
	},
	buttonOutlineText: {
		color: '#007AFF',
		fontWeight: 'bold',
		fontSize: 16,
	},
})
