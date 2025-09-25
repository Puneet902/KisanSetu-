import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalization } from '../hooks/useLocalization';
import { ChevronLeftIcon, RefreshIcon } from './Icons';
import { supabase } from '../src/lib/supabaseClient';

const MarketScreen = ({ navigation }) => {
  const { t } = useLocalization();
  const [location, setLocation] = useState('Loading location...');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [refreshing, setRefreshing] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user location from database
  const fetchUserLocation = async () => {
    try {
      setLoadingLocation(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('name, latitude, longitude')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching user location:', fetchError);
        setError('Failed to fetch location');
        setLocation('Unknown Location');
        return;
      }

      if (data && data.length > 0) {
        const { name, latitude, longitude } = data[0];
        
        // Try to get detailed location using reverse geocoding
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'KisanSetu-App/1.0'
              }
            }
          );
          
          if (res.ok) {
            const locationData = await res.json();
            
            if (locationData && locationData.address) {
              const address = locationData.address;
              
              // Get the most relevant single location name
              const singleLocation = 
                address.town ||
                address.village ||
                address.city_district ||
                address.city ||
                address.county ||
                address.state ||
                address.country;
              
              if (singleLocation) {
                setLocation(singleLocation);
              } else {
                setLocation(`${name}'s Location`);
              }
            } else {
              setLocation(`${name}'s Location`);
            }
          } else {
            setLocation(`${name}'s Location`);
          }
        } catch (geoError) {
          console.log('Geocoding error:', geoError);
          setLocation(`${name}'s Location`);
        }
      } else {
        setLocation('Unknown Location');
      }
    } catch (err) {
      console.error('Error in fetchUserLocation:', err);
      setError('Error loading location');
      setLocation('Unknown Location');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Load location when component mounts
  useEffect(() => {
    fetchUserLocation();
  }, []);

  // Mock market data
  const marketData = [
    { id: 1, name: 'Tomato', price: '₹45-60/kg', change: '+5%', trend: 'up' },
    { id: 2, name: 'Potato', price: '₹25-35/kg', change: '-2%', trend: 'down' },
    { id: 3, name: 'Onion', price: '₹30-45/kg', change: '0%', trend: 'neutral' },
    { id: 4, name: 'Rice', price: '₹45-55/kg', change: '+3%', trend: 'up' },
    { id: 5, name: 'Wheat', price: '₹22-28/kg', change: '-1%', trend: 'down' },
    { id: 6, name: 'Brinjal', price: '₹35-50/kg', change: '+7%', trend: 'up' },
    { id: 7, name: 'Carrot', price: '₹40-60/kg', change: '+2%', trend: 'up' },
    { id: 8, name: 'Cauliflower', price: '₹30-45/kg', change: '-4%', trend: 'down' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh both the market data and location
      await Promise.all([
        fetchUserLocation(),
        // Simulate market data refresh
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#10B981'; // green
      case 'down': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeftIcon width={24} height={24} color="#e2e8f0" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {loadingLocation ? (
              <View style={styles.loadingLocation}>
                <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
                <Text style={styles.locationText}>Loading location...</Text>
              </View>
            ) : error ? (
              <Text style={[styles.locationText, { color: '#FECACA' }]}>📍 {error}</Text>
            ) : (
              <Text style={styles.locationText}>📍 {location}</Text>
            )}
            <Text style={styles.headerText}>Market Prices</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshIcon width={24} height={24} color="#e2e8f0" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Market Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {lastUpdated}
          </Text>
        </View>

        <View style={styles.marketContainer}>
          {marketData.map((item) => (
            <View key={item.id} style={styles.marketItem}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemPrice}>{item.price}</Text>
                <Text 
                  style={[
                    styles.itemChange, 
                    { color: getTrendColor(item.trend) }
                  ]}
                >
                  {getTrendIcon(item.trend)} {item.change}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 16,
  },
  loadingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scrollView: {
    flex: 1,
  },
  lastUpdated: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#64748b',
  },
  marketContainer: {
    padding: 16,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemLeft: {
    flex: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  itemChange: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MarketScreen;
