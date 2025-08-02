// app/posts/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { Button, Text } from "@ui-kitten/components";
import Auth from '@/auth';
import { useAuth } from '@/context/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


export default function PostDetail() {
	const { session, loading } = useAuth();
	const { id } = useLocalSearchParams();
	const [post, setPost] = useState<any>(null);
	const [image, setImage] = useState<string | null>(null);

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

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth />

	return <View style={styles.container}>
		{post ?
			<View>
				<Text style={styles.titleText}>{post.title}</Text>
				<View style={styles.imageContainer}>
					<Image source={require("../../assets/images/react-logo.png")} />
				</View>
				<Text>By {post.author}</Text>
				<Text>{post.description}</Text>
				<Text>Created {new Date(post.created_at).toDateString()}</Text>
				<Text>Ends {new Date(post.deadline).toDateString()}</Text>

				<Button onPress={pickImage}>Pick an image from camera roll</Button>
				<Text>{image}</Text>
			</View> :
			<Text>Loading...</Text>
		}
		{image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }}  />}
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
	}
});
