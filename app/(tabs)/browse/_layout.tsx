import { Stack } from "expo-router"

export default function BrowseLayout() {
	return (
		<Stack
			screenOptions={{
				headerTitle: "",
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="posts/[id]" />
		</Stack>

	)
}