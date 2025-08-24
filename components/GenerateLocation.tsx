import { View, TextInput, StyleSheet } from "react-native";
import { Button, Text } from "@ui-kitten/components";

type QRType = {
	id: string;
	message: string;
}

interface SubquestInputFormat {
	idx: number,
	prompts: QRType[],
	setPrompts: React.Dispatch<React.SetStateAction<QRType[]>>
}

export default function SubquestInput({idx, prompts, setPrompts}: SubquestInputFormat) {
	const updatePrompts = (content: string) => {
		console.log(`Text changed at index ${idx}. Content: ${content}`);
		let newPrompts = [...prompts];
		newPrompts[idx].message = content;
		setPrompts(newPrompts);
	}
	

	return <>
		<View style={styles.inputGroup}>
			<Text category="s1" style={styles.inputLabel}>
				Message {prompts[idx].id}
			</Text>
			<TextInput
				value={prompts[idx].message}
				onChangeText={(c) => updatePrompts(c)}
				multiline
				style={[styles.input, styles.textArea]}
				placeholder="Congratulations!"
				numberOfLines={3}
			/>
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
