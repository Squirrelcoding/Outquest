import Auth from "@/components/Auth";
import { useAuth } from "@/context/Auth";
import { Redirect } from "expo-router";

export default function Page() {
	const {session } = useAuth();

	if (session) return <Redirect href={"/(tabs)"}/>

	return <>
		<Auth/>
	</>
}