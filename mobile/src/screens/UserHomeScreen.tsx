import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      try {
          const token = await SecureStore.getItemAsync('userToken');
          if (token) {
            await api.post('/tracking/update/', {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }, {
              headers: { Authorization: `Token ${token}` }
            });
            console.log('Location sent:', location.coords);
          } else {
             console.log('No token found in background task');
          }
      } catch (err) {
        console.error('Failed to send location', err);
      }
    }
  }
});

export default function UserHomeScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const { signOut } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  useEffect(() => {
    checkPermissions();
    checkTaskStatus();
  }, []);

  const checkPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      setPermissionStatus(backgroundStatus);
    } else {
      setPermissionStatus(foregroundStatus);
    }
  };

  const checkTaskStatus = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    setIsTracking(isRegistered);
  };

  const toggleTracking = async () => {
    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
      Alert.alert('Checked Out', 'Location tracking stopped.');
    } else {
      if (permissionStatus !== 'granted') {
          await checkPermissions();
          if (permissionStatus !== 'granted') {
            Alert.alert('Permission Required', 'Background location is required to check in.');
            return;
          }
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 10, // 10 meters
        foregroundService: {
          notificationTitle: "You are checked in",
          notificationBody: "Tracking your location for attendance",
        },
      });
      setIsTracking(true);
      Alert.alert('Checked In', 'Location tracking started.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>BlueLady</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.statusCard, isTracking ? styles.online : styles.offline]}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <Text style={styles.statusText}>{isTracking ? 'ON DUTY' : 'OFF DUTY'}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, isTracking ? styles.checkOut : styles.checkIn]} 
          onPress={toggleTracking}
        >
          <Text style={styles.buttonText}>{isTracking ? 'CHECK OUT' : 'CHECK IN'}</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          {isTracking 
            ? 'Your location is being tracked in the background.' 
            : 'Check in to start your shift and enable location tracking.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  logout: {
    color: '#FF3B30',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    alignItems: 'center',
  },
  statusCard: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    marginBottom: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  online: {
    backgroundColor: '#E0F2F1', // Light Teal
    borderWidth: 2,
    borderColor: '#009688',
  },
  offline: {
    backgroundColor: '#FFEBEE', // Light Red
    borderWidth: 2,
    borderColor: '#EF5350',
  },
  statusTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 32,
  },
  checkIn: {
    backgroundColor: '#007AFF', // Blue
  },
  checkOut: {
    backgroundColor: '#FF3B30', // Red
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  hint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    maxWidth: 240,
  }
});
