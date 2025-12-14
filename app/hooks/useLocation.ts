'use client';

import { useState, useEffect } from 'react';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  coords: LocationCoords | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export function useLocation(): UseLocationReturn {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  return {
    coords,
    loading,
    error,
    requestLocation,
  };
}
