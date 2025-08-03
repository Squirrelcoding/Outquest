// app/posts/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { Button, Card, Text } from "@ui-kitten/components";
import Auth from '@/auth';
import { useAuth } from '@/context/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer'


export default function PostDetail() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();
	const [post, setPost] = useState<any>(null);
	const [image, setImage] = useState<string | null>(null);
	const [judging, setJudging] = useState<boolean>(false);
	const [uploading, setUploading] = useState<boolean>(false);
	const [output, setOutput] = useState<any>(null);
	const [validSubmission, setValidSubmission] = useState<boolean>(false);

	console.log(id);

	useEffect(() => {
		(async () => {
			const { data, error } = await supabase.from('quest').select().eq('id', id).single();
			if (error) console.error(error);
			setPost(data);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images', 'videos'],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});
		console.log(result);

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	const submitEntry = async () => {
		if (!image) return;
		setUploading(true);

		const base64 = await FileSystem.readAsStringAsync(image, {
			encoding: FileSystem.EncodingType.Base64,
		});

		const fileName = `img-${Date.now()}.jpg`;
		let { error } = await supabase
			.storage
			.from('quest-upload')
			.upload(fileName, decode(base64), {
				contentType: 'image/jpeg',
				upsert: true
			});

		setUploading(false);
		if (error) {
			console.error(error);
			return;
		}

		setJudging(true);

		let { data: edgeData, error: edgeError } = await supabase.functions.invoke('replicate-call', {
			body: { image: fileName, question: "Does the image match the following description? Reply YES or NO. " + post.photo_prompt },
		});

		if (edgeError) {
			console.error(edgeError);
		}
		setJudging(false);
		setOutput(edgeData);
		console.log(edgeData);
		if (edgeData === "YES") {
			setValidSubmission(true);
		}
	};

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth />

	return <View style={styles.container}>
		{post ?
			<View>
				<Text style={styles.titleText}>{post.title}</Text>
				<View style={styles.imageContainer}>
					<Image source={require("../../assets/images/react-logo.png")} />
				</View>
				<Text>Author ID:  {post.author}{"\n"}</Text>
				<Text>Task: {post.description}{"\n"}</Text>
				<Text>Created {new Date(post.created_at).toDateString()}</Text>
				<Text>Ends {new Date(post.deadline).toDateString()}</Text>

				<Button onPress={pickImage}>Pick an image from camera roll</Button>
			</View> :
			<Text>Loading...</Text>
		}
		{image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}

		<Button onPress={submitEntry}>Submit entry</Button>

		{uploading && <Text>Uploading...</Text>}
		{judging && <Text>Judging...</Text>}
		{output && <View>
			{validSubmission ?

				<Card>
					<Text>
						Success!
					</Text>
				</Card>
				:
				<Card>
					<Text>
						Submission did not pass🫩
					</Text>
				</Card>
			}
		</View>}


	</View>
}
const styles = StyleSheet.create({
	titleText: {
		textAlign: "center",
		fontSize: 30
	},
	descriptionText: {
		fontSize: 30
	},
	container: {
		padding: 5,
	},
	image: {
		alignContent: "center"
	},
	imageContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});
