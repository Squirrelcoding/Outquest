import { Text } from "@ui-kitten/components";
import { StyleSheet } from "react-native";

export default function Page1() {
	return <>
		<Text style={styles.titleText}>Almost there!</Text>
		<Text>Enter in some personal details to help Outquest recommend you the best quests.</Text>
	</>
}

const styles = StyleSheet.create({
	container: {
		marginTop: 10,
		padding: 16,
	},
	inputContainer: {
		marginBottom: 16,
	},
	label: {
		marginBottom: 4,
		fontSize: 16,
		fontWeight: 'bold',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 6,
		padding: 12,
		fontSize: 16,
	},
	button: {
		backgroundColor: '#007AFF',
		padding: 12,
		borderRadius: 6,
		alignItems: 'center',
		marginTop: 12,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	disabledButton: {
		backgroundColor: '#aaa',
	},
	titleText: {
		fontSize: 30,
		textAlign: "center"
	}
})