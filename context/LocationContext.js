import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setIsLoading(false);
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Reverse geocode to get location name
        const geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const locationData = {
          coords: currentLocation.coords,
          city: geocode[0]?.city || 'Unknown',
          district: geocode[0]?.district || 'Unknown',
          region: geocode[0]?.region || 'Andhra Pradesh',
          country: geocode[0]?.country || 'India',
          timestamp: new Date().toISOString(),
        };

        setLocation(locationData);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Error getting location. Using default location.');
        // Set default location (Guntur) if there's an error
        setLocation({
          city: 'Guntur',
          district: 'Guntur',
          region: 'Andhra Pradesh',
          country: 'India',
          coords: {
            latitude: 16.2991,
            longitude: 80.4575,
          },
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ location, isLoading, error: errorMsg }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
