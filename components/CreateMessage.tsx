import { View, TextInput, StyleSheet } from "react-native";
import { Button, Text } from "@ui-kitten/components";

interface CreateMessageFormat {
	idx: number,
	messages: string[],
	setMessages: React.Dispatch<React.SetStateAction<string[]>>
}

export default function CreateMessage({idx, messages, setMessages}: CreateMessageFormat) {
	const updateMessages = (content: string) => {
		console.log(`[create messages] Text changed at index ${idx}. Content: ${content}`);
		let newMessages = [...messages];
		newMessages[idx] = content;
		setMessages(newMessages);
	}
	
	const deleteMessages = () => {
		if (messages.length === 1) return;
		let newMessages = [...messages];
		newMessages = newMessages.filter((_, index) => index !== idx);

		setMessages(newMessages);
	};

	return <>
		<View style={styles.inputGroup}>
			<Text category="s1" style={styles.inputLabel}>
				{idx + 1 === messages.length ? "Default" : idx + 1} Winner message
			</Text>
			<TextInput
				value={messages[idx]}
				onChangeText={(c) => updateMessages(c)}
				multiline
				style={[styles.input, styles.textArea]}
				placeholder="Congratulations!"
				numberOfLines={3}
			/>
			<Button onPress={deleteMessages}>Delete prompt</Button>
		</View>

	</>
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	header: {
		padding: 20,
		alignItems: 'center',
		backgroundColor: '#fff',
		marginBottom: 10,
	},
	headerTitle: {
		fontWeight: 'bold',
		marginBottom: 5,
	},
	headerSubtitle: {
		color: '#666',
		textAlign: 'center',
	},
	section: {
		margin: 10,
		marginBottom: 10,
	},
	sectionTitle: {
		fontWeight: 'bold',
		marginBottom: 15,
	},
	inputGroup: {
		marginBottom: 15,
	},
	inputLabel: {
		fontWeight: 'bold',
		marginBottom: 5,
		color: '#333',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	textArea: {
		minHeight: 80,
		textAlignVertical: 'top',
	},
	dateButton: {
		width: '100%',
	},
	dateInfo: {
		color: '#666',
		marginTop: 10,
		fontWeight: 'bold',
	},
	submitButton: {
		width: '100%',
		marginBottom: 10,
	},
	helpText: {
		textAlign: 'center',
		color: '#666',
		fontStyle: 'italic',
	},
});
