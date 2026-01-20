import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

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

import DashboardCard from '../components/DashboardCard';

export default function UserHomeScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const { signOut, username } = useAuth();
  const navigation = useNavigation<any>();
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  useEffect(() => {
    checkPermissions();
    checkTaskStatus();
  }, []);

  const checkPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    let finalStatus = foregroundStatus;
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      finalStatus = backgroundStatus;
    }
    setPermissionStatus(finalStatus);
    return finalStatus;
  };

  const checkTaskStatus = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    setIsTracking(isRegistered);
  };

  const toggleTracking = async () => {
    const nextStatus = isTracking ? 'Check Out' : 'Check In';
    Alert.alert(
      'Punch Confirmation',
      `Do you want to ${nextStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => navigation.navigate('PunchPhoto', { isCheckIn: !isTracking })
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      checkTaskStatus();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Dashboard</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.usernameText}>{username || 'User'}</Text>
      </View>

      <View style={styles.grid}>
        <DashboardCard 
          title="Punch" 
          subtitle={isTracking ? '(Checked In)' : '(Checked Out)'}
          icon="map-marker-radius" 
          onPress={toggleTracking}
          color={isTracking ? '#4CAF50' : '#007AFF'}
        />
        <DashboardCard 
          title="My Attendance" 
          icon="calendar-check" 
          onPress={() => navigation.navigate('MyAttendance')}
        />
        <DashboardCard 
          title="My Regularization" 
          icon="calendar-edit" 
          onPress={() => Alert.alert('Coming Soon', 'Regularization is under development.')}
        />
        <DashboardCard 
          title="View Process List" 
          subtitle="(Request Status)"
          icon="format-list-bulleted" 
          onPress={() => Alert.alert('Coming Soon', 'Process list is under development.')}
        />
        <DashboardCard 
          title="Holiday Calendar" 
          icon="weather-sunny" 
          onPress={() => navigation.navigate('HolidayCalendar')}
        />
        <DashboardCard 
          title="My Timeoff" 
          subtitle="(Leave Request)"
          icon="calendar-plus" 
          onPress={() => Alert.alert('Coming Soon', 'Leave requests are under development.')}
        />
        <DashboardCard 
          title="Offboarding" 
          icon="account-off" 
          onPress={() => Alert.alert('Coming Soon', 'Offboarding is under development.')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logout: {
    color: '#FF3B30',
    fontSize: 16,
  },
  welcomeBanner: {
    backgroundColor: '#0055D4',
    margin: 16,
    padding: 24,
    borderRadius: 8,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    opacity: 0.9,
  },
  usernameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'flex-start',
  },
});
