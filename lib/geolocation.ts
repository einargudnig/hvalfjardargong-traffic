// Function to check if user is within the geofence of a tunnel entrance
export const isWithinTunnelGeofence = (
  userLat: number,
  userLng: number,
  tunnelLat: number,
  tunnelLng: number,
  radiusMeters: number = 200 // Default radius of 200 meters
): boolean => {
  // Calculate distance using Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (tunnelLat * Math.PI) / 180;
  const Δφ = ((tunnelLat - userLat) * Math.PI) / 180;
  const Δλ = ((tunnelLng - userLng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusMeters;
};

// Get user's current position using browser's Geolocation API
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};
