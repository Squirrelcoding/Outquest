import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Home() {
	return (
		<View>
			<Button
				onPress={() => router.push("/settings")}
				title="Settings"
				color="#841584"
				accessibilityLabel="Click to access settings"
			/>
		</View>
	);
}
