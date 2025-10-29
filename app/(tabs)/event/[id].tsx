// app/posts/[id].tsx
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/Auth';
import { supabase } from '@/lib/supabase';

import { useLocation } from '@/context/Location';
import MainScreen from '@/components/event_screens/MainScreen';

// The event page is one where the user is temporarily "locked" into one event. They cannot complete any other quests as long as they are here.
// It's a special type of quest.

// TODO:
// - Implement register functionality by first getting the geographic location 
//   and then displaying a list of active community quests within that area so
//   that the user can display it. This should be the actual thing and the actual submit UI
//		should just be a component. This also makes it easy to leave the community quest.

export default function QuestBox() {
	const { session, loading: authLoading } = useAuth();
	const { location, } = useLocation();
	const { id } = useLocalSearchParams();

	console.log(`event:${id}`)
	const channel = supabase.channel(`event:${id}`);

	// When session is done loading send a new message to the big chat
	if (!authLoading) {
		channel.send({
			type: "broadcast",
			event: "join",
			payload: {
				user_id: session?.user.id,
			}
		});
	}

	channel.subscribe();

	if (!session) return <Redirect href="/(auth)" />;

	return (
		<MainScreen session={session} location={location} id={id} />
	);
}
