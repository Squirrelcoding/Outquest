import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Layout, Card, Text } from "@ui-kitten/components";

export default function HorizontalFeed() {
	const items = ["One", "Two", "Three", "Four", "Five"];

	return (
		<Layout style={styles.container}>
			<Text category="h5" style={styles.title}>
				Horizontal Feed
			</Text>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scrollContainer}
			>
				{items.map((item, index) => (
					<Card key={index} style={styles.card}>
						<Text>{item}</Text>
					</Card>
				))}
			</ScrollView>
		</Layout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 50,
	},
	title: {
		marginLeft: 16,
		marginBottom: 12,
	},
	scrollContainer: {
		paddingHorizontal: 16,
		// alignItems: "center", // keeps cards aligned in the middle
	},
	card: {
		width: 150,
		height: 50, // <-- sets card height explicitly
		marginRight: 12,
		justifyContent: "center", // centers text inside
	},
});
