import { createContext, useContext, useEffect, useState } from "react";

import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const LocationContext = createContext<{
	location: Location.LocationObject | null,
	loading: boolean
}>({ location: null, loading: true });

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
	const [location, setLocation] = useState<Location.LocationObject | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function getCurrentLocation() {
			if (Platform.OS === 'android' && !Device.isDevice) {
				return;
			}
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				return;
			}

			let locationData = await Location.getCurrentPositionAsync({});
			setLocation(locationData);
			setLoading(false);
		}

		getCurrentLocation();
	}, []);



	return (
		<LocationContext value={{ location, loading }}>
			{children}
		</LocationContext>
	)
}

export const useLocation = () => useContext(LocationContext);
