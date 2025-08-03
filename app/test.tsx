import { supabase } from "../lib/supabase";
import { View } from "react-native";
import { Button, Text } from "@ui-kitten/components";
import { useState } from "react";

export default function Test() {
	const [ddata, setDdata] = useState(null);

	const makeRequest = async () => {
		const { data, error } = await supabase.functions.invoke('replicate-call', {
			body: { image: "https://upload.wikimedia.org/wikipedia/commons/1/15/EasternGraySquirrel_GAm.jpg", question: "What is the animal shown here?" },
		});
		console.log("CALLED FUNCTION!");
		if (error) console.error(error);
		setDdata(data);
	};

	return <View>
		<Button onPress={makeRequest}>Make request</Button>
		<Text>{JSON.stringify(ddata)}</Text>
	</View>
}