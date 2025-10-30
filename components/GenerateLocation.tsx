import { View, TextInput, StyleSheet } from "react-native";
import { IndexPath, Layout, Select, SelectItem, Text } from "@ui-kitten/components";
import { useState } from "react";

type Subquest = {
	id: string;
	message: string;
	type: string;
	radius?: number;
}

interface SubquestInputFormat {
	idx: number,
	prompts: Subquest[],
	setPrompts: React.Dispatch<React.SetStateAction<Subquest[]>>
}

export default function SubquestInput({ idx, prompts, setPrompts }: SubquestInputFormat) {
	const [selectedIndex, setSelectedIndex] = useState<IndexPath | IndexPath[]>(new IndexPath(0));
	const [radius, setRadius] = useState<string>(prompts[idx].radius?.toString() || '');
	
	const updatePrompts = (content: string) => {
		console.log(`Text changed at index ${idx}. Content: ${content}`);
		let newPrompts = [...prompts];
		newPrompts[idx].message = content;
		if (selectedIndex instanceof IndexPath && selectedIndex.row === 0) {
			newPrompts[idx].type = "SCAN";
		} else {
			newPrompts[idx].type = "PHOTO";
			const radiusValue = parseFloat(radius);
			newPrompts[idx].radius = isNaN(radiusValue) ? undefined : radiusValue;
		}
		setPrompts(newPrompts);
	}
	
	const updateRadius = (radiusText: string) => {
		setRadius(radiusText);
		let newPrompts = [...prompts];
		const radiusValue = parseFloat(radiusText);
		newPrompts[idx].radius = isNaN(radiusValue) ? undefined : radiusValue;
		if (selectedIndex instanceof IndexPath && selectedIndex.row === 1) {
			newPrompts[idx].type = "PHOTO";
		}
		setPrompts(newPrompts);
	}
	
	// Check if second option (index 1) is selected
	const isRadiusOptionSelected = selectedIndex instanceof IndexPath && selectedIndex.row === 1;
	
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
				placeholder="Find the pole on ABC street."
				numberOfLines={3}
			/>
			<Layout
				style={styles.container}
				level='1'
			>
				<Select
					selectedIndex={selectedIndex}
					onSelect={index => setSelectedIndex(index)}
					style={{ borderColor: "white" }}
				>
					<SelectItem title='Scan something' />
					<SelectItem title='Find something at this location within a radius' />
				</Select>
			</Layout>
			
			{isRadiusOptionSelected && (
				<View style={styles.radiusInputGroup}>
					<Text category="s1" style={styles.inputLabel}>
						Radius (meters)
					</Text>
					<TextInput
						value={radius}
						onChangeText={updateRadius}
						style={styles.input}
						placeholder="Enter radius in meters"
						keyboardType="numeric"
					/>
				</View>
			)}
		</View>
	</>
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
		borderColor: "white"
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
	radiusInputGroup: {
		marginTop: 15,
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