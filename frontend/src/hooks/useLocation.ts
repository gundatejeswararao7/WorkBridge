import { useState, useCallback } from 'react';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getCurrentLocation = useCallback((): Promise<LocationCoords | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const errMsg = 'Geolocation is not supported by your browser';
        setError(errMsg);
        setLoading(false);
        resolve(null);
        return;
      }

      const onSuccess = (position: GeolocationPosition) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setError(null);
        setLoading(false);
        resolve({ latitude: lat, longitude: lng });
      };

      const onError = (err: GeolocationPositionError) => {
        // If high accuracy failed due to timeout or position unavailable, attempt fallback with low accuracy
        if (err.code !== err.PERMISSION_DENIED) {
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            (fallbackErr) => {
              let errMsg = 'Unable to determine your current location.';
              if (fallbackErr.code === fallbackErr.PERMISSION_DENIED) {
                errMsg = 'Location permission was denied. Please allow location access in your browser.';
              } else if (fallbackErr.code === fallbackErr.TIMEOUT) {
                errMsg = 'Location request timed out. Please try again or select a city.';
              }
              setError(errMsg);
              setLoading(false);
              resolve(null);
            },
            {
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 120000,
            }
          );
          return;
        }

        const errMsg = 'Location permission was denied. Please allow location access in your browser.';
        setError(errMsg);
        setLoading(false);
        resolve(null);
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 60000,
      });
    });
  }, []);

  return { latitude, longitude, error, loading, getCurrentLocation };
}
