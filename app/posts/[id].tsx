// app/posts/[id].tsx
import { router, useLocalSearchParams } from 'expo-router';
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
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [questID, setQuestID] = useState<number>(-1);

	console.log(id);

	useEffect(() => {
		if (!session) return;
		(async () => {
			const { data, error } = await supabase.from('quest').select().eq('id', id).single();
			if (error) console.error(error);
			setPost(data);
			const { data: postData, error: postError } = await supabase
				.from('submission')
				.select()
				.eq('quest_id', id)
				.eq('user_id', session.user.id);
			if (postError) console.error(postError);
			if (postData!.length) {
				setSubmitted(true);
				setQuestID(postData![0].quest_id);
			};
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
		if (!session) return;
		setUploading(true);

		const base64 = await FileSystem.readAsStringAsync(image, {
			encoding: FileSystem.EncodingType.Base64,
		});

		const fileName = `${session.user.id}/${post.id}/img-${Date.now()}.jpg`;
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

		// If it's a successful submission then we create add some new rows to the submission table
		if (edgeData === "YES") {
			const { error } = await supabase.from("submission").insert({
				user_id: session?.user.id,
				quest_id: post.id,
				time: new Date()
			});
			if (error) console.error(error);
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

		<Button onPress={submitEntry} disabled={submitted}>Submit entry</Button>

		{submitted && <View>
			<Text>You have already completed this quest!</Text>	
			<Button onPress={() => router.push(`/submission/${session.user.id}/${questID}`)}>Click here to see your submission.</Button>
		</View>}
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
