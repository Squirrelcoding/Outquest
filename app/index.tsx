import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Home Screen</Text>
      <Button title="Go to Profile" onPress={() => router.push('/profile')} />
    </View>
  );
}
