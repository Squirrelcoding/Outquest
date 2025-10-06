/**
 * Calculates the haversine distance between point A, and B, in kilometers.
 * @param {number[]} latlngA [lat, lng] point A
 * @param {number[]} latlngB [lat, lng] point B
*/

import { Achievement, Completion } from "@/types";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const haversineDistance = (
	[lat1, lon1]: [number, number],
	[lat2, lon2]: [number, number], 
) => {
	const toRadian = (angle: number) => (Math.PI / 180) * angle;
	const distance = (a: number, b: number) => (Math.PI / 180) * (a - b);
	const RADIUS_OF_EARTH_IN_KM = 6371;

	const dLat = distance(lat2, lat1);
	const dLon = distance(lon2, lon1);

	lat1 = toRadian(lat1);
	lat2 = toRadian(lat2);

	// Haversine Formula
	const a =
		Math.pow(Math.sin(dLat / 2), 2) +
		Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
	const c = 2 * Math.asin(Math.sqrt(a));

	let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

	return finalDistance;
};

export async function awardAchievement(user: User, achievement: Achievement) {
	await supabase.from("achievemement").insert({
		user_id: user.id,
		achievement_id: achievement.id
	});
}

/// Returns `true` if the actual achievement can be awarded. `false` otherwise.
export async function addAchievementProgress(userID: string, achievementID: number) {
	// Check if the quest is associated with any achievement
	// If so, insert a new record into the progress table
	// Check if the requirements of the achievement are satisfied
	// If so, then award the user and return true and message
	await supabase.from("achievemement").insert({
		user_id: userID,
		achievement_id: achievementID
	});
	return false;
}