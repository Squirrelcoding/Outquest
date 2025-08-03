import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { View } from "react-native";
import {Text} from "@ui-kitten/components";

export default function Test() {
	useEffect(() => {
		(async () => {
			const { data, error } = await supabase.functions.invoke('replicate-call', {
				body: { image: "https://upload.wikimedia.org/wikipedia/commons/1/15/EasternGraySquirrel_GAm.jpg", question: "What is the animal shown here?" },
			});
			console.log("CALLED FUNCTION!");
			if (error) console.error(error);
			console.log(data);
		})();
	});
	return <View>
		<Text>Hello!</Text>	
	</View>
}