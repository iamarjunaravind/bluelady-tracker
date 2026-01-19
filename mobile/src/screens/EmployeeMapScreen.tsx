import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function EmployeeMapScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const route = useRoute<any>();
  const { employeeId, employeeName } = route.params;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLocation = async () => {
    try {
      const response = await api.get(`/tracking/${employeeId}/latest/`);
      const { latitude, longitude, timestamp } = response.data;
      setLocation({ latitude, longitude, timestamp });
      
      // Animate map to new location
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);

    } catch (error) {
      console.log('Error fetching location:', error);
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title={employeeName}
            description={`Last update: ${new Date(location.timestamp).toLocaleTimeString()}`}
          />
        </MapView>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={{ marginTop: 10 }}>Fetching location...</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Tracking: {employeeName}</Text>
        {location && <Text style={styles.lastSeen}>Last Seen: {new Date(location.timestamp).toLocaleTimeString()}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastSeen: {
    color: '#666',
    marginTop: 4,
  },
});
