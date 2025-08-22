import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import MapView, { Marker, MapPressEvent, Callout } from "react-native-maps";

type MarkerType = {
	id: string;
	latitude: number;
	longitude: number;
};

export default function MultiMarkerMap() {
	const [markers, setMarkers] = useState<MarkerType[]>([]);

	const handleMapPress = useCallback((event: MapPressEvent) => {
		try {
			const coordinate = event?.nativeEvent?.coordinate;
			if (!coordinate || typeof coordinate.latitude !== 'number' || typeof coordinate.longitude !== 'number') {
				console.error('Invalid coordinate data:', coordinate);
				return;
			}

			const { latitude, longitude } = coordinate;
			const id = `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			const newMarker = { id, latitude, longitude };
			console.log('Adding marker:', newMarker);

			setMarkers((prev) => [...prev, newMarker]);
		} catch (error) {
			console.error('Error in handleMapPress:', error);
		}
	}, []);

	const handleMarkerDelete = useCallback((id: string) => {
		try {
			console.log(`Attempting to delete marker: ${id}`);

			setMarkers((prevMarkers) => {
				console.log('Current markers before delete:', prevMarkers.length);
				const markerToDelete = prevMarkers.find(m => m.id === id);

				if (!markerToDelete) {
					console.warn(`Marker with id ${id} not found in current markers`);
					return prevMarkers;
				}

				const newMarkers = prevMarkers.filter((m) => m.id !== id);
				console.log('Markers after delete:', newMarkers.length);
				return newMarkers;
			});
		} catch (error) {
			console.error('Error in handleMarkerDelete:', error);
		}
	}, []);

	return (
		<View style={styles.container}>
			<MapView
				style={styles.map}
				initialRegion={{
					latitude: 37.78825,
					longitude: -122.4324,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				}}
				onPress={handleMapPress}
			>
				{markers.map((marker) => {
					// Add safety check for marker data
					if (!marker || typeof marker.latitude !== 'number' || typeof marker.longitude !== 'number') {
						console.warn('Invalid marker data:', marker);
						return null;
					}

					return (
						<Marker
							key={marker.id}
							coordinate={{
								latitude: marker.latitude,
								longitude: marker.longitude,
							}}
						>
							<Callout
								tooltip={false}
								onPress={() => {
									console.log(`Callout pressed for marker: ${marker.id}`);
									// Use setTimeout to delay the deletion slightly
									setTimeout(() => {
										handleMarkerDelete(marker.id);
									}, 100);
								}}
							>
								<View style={styles.callout}>
									<Text style={styles.calloutText}>Delete this marker</Text>
								</View>
							</Callout>
						</Marker>
					);
				})}
			</MapView>

			{/* Debug info */}
			<View style={styles.debugInfo}>
				<Text style={styles.debugText}>Markers: {markers.length}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	map: { flex: 1 },
	callout: {
		padding: 6,
		borderRadius: 6,
		backgroundColor: "#fff",
		minWidth: 100,
	},
	calloutText: {
		fontSize: 14,
		color: "red",
		fontWeight: "600",
		textAlign: "center",
	},
	debugInfo: {
		position: 'absolute',
		top: 50,
		left: 10,
		backgroundColor: 'rgba(0,0,0,0.7)',
		padding: 8,
		borderRadius: 4,
	},
	debugText: {
		color: 'white',
		fontSize: 12,
	},
});