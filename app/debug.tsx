import { View } from "react-native";
import { Button, Text } from "@ui-kitten/components";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Test() {

	const makeRequest = async () => {
		await AsyncStorage.clear();
	};

	return <View>
		<Button onPress={makeRequest}><Text>Destroy async storage</Text></Button>
	</View>
}