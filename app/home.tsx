import "react-native-url-polyfill/auto";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { supabase } from "../supabase";
import Auth from "../auth";
import { Session } from "@supabase/supabase-js";


export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

	return (
		      <View>
        {!session ? (
          <Auth />
        ) : (
          <View style={{ padding: 16 }}>
            <Text>Signed in as: {session.user.email}</Text>
          </View>
        )}
      </View>
	)
}
