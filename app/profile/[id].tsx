import Auth from "@/auth";
import { useAuth } from "@/context/Auth";
import {Text} from "@ui-kitten/components";

export default function Profile() {
	const { session, loading } = useAuth();

	if (loading) return <Text>Loading...</Text>
	if (!session) return <Auth />


}