import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

interface AgentLocation {
  id: number;
  user: number;
  username: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function AllAgentsMapScreen() {
  const [agents, setAgents] = useState<AgentLocation[]>([]);
  const [managerLocation, setManagerLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const regionSetRef = useRef(false);

  useEffect(() => {
    startManagerTracking();
    fetchAllAgents();
    const interval = setInterval(fetchAllAgents, 1000); // Poll every 1 second
    return () => clearInterval(interval);
  }, []);

  const startManagerTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      setManagerLocation(location);
    } catch (e) {
       console.log("Error getting manager location", e);
    } finally {
       // We don't stop loading here because we wait for agents, but good to handle error
    }
    
    // Watch location for real-time manager updates
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        setManagerLocation(newLocation);
      }
    );
  };

  const fetchAllAgents = async () => {
    try {
      const response = await api.get('/tracking/all/');
      setAgents(response.data);
    } catch (error) {
      console.log('Error fetching all agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const centerOnManager = () => {
    if (managerLocation) {
        mapRef.current?.animateToRegion({
            latitude: managerLocation.coords.latitude,
            longitude: managerLocation.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={false} // We handle manager location manually for more control
        initialRegion={{
            latitude: 20.5937, // Default center (India) if no location yet
            longitude: 78.9629,
            latitudeDelta: 10,
            longitudeDelta: 10,
        }}
        onMapReady={() => {
            if (managerLocation && !regionSetRef.current) {
                centerOnManager();
                regionSetRef.current = true;
            }
        }}
      >
        {/* Manager Marker */}
        {managerLocation && (
          <Marker
            coordinate={{
              latitude: managerLocation.coords.latitude,
              longitude: managerLocation.coords.longitude,
            }}
            title="You (Manager)"
            pinColor="blue"
          >
             <View style={styles.managerMarkerContainer}>
                <View style={styles.managerMarker} />
             </View>
          </Marker>
        )}

        {/* Agent Markers */}
        {agents.map((agent) => (
          <Marker
            key={agent.id}
            coordinate={{ latitude: agent.latitude, longitude: agent.longitude }}
            title={agent.username}
            description={`Last Seen: ${new Date(agent.timestamp).toLocaleTimeString()}`}
            pinColor="red"
          />
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading agents...</Text>
        </View>
      )}

      <TouchableOpacity style={styles.centerButton} onPress={centerOnManager}>
         <Text style={styles.centerButtonText}>Center on Me</Text>
      </TouchableOpacity>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Agents ({agents.length})</Text>
        </View>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  managerMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  managerMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  centerButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  centerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  legend: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
