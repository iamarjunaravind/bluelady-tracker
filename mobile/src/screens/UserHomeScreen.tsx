import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import LocationService from '../services/LocationService';

// TaskManager logic is now handled inside LocationService (or you can keep the definition there if you move it)
// For now, let's assume LocationService handles the foreground tracking mostly effectively for this use case
// based on the "Live Track" requirement.

import DashboardCard from '../components/DashboardCard';

export default function UserHomeScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const { signOut, username } = useAuth();
  const navigation = useNavigation<any>();
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  const [todaysRoute, setTodaysRoute] = useState<any>(null);

  useEffect(() => {
    checkPermissions();
    fetchTodaysRoute();
    
    // Auto-start tracking if permissions allow, or wait for user action?
    // "Live Track" implies passive tracking or active. 
    // Let's start it on load for now.
    LocationService.startBackgroundLocation();
    setIsTracking(true);

    return () => {
        // Optional: Stop on unmount? Or keep running?
        // Usually we want to keep running if it's "Shift" based.
        // For now, let's keep it running.
    };
  }, []);

  const fetchTodaysRoute = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await api.get(`/tracking/assignments/?date=${today}`);
        if (response.data && response.data.length > 0) {
            setTodaysRoute(response.data[0]);
        }
    } catch (error) {
        console.log('Error fetching todays route:', error);
    }
  };

  const checkPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    let finalStatus = foregroundStatus;
    setPermissionStatus(finalStatus);
    return finalStatus;
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
      fetchTodaysRoute();
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
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.usernameText}>{username || 'User'}</Text>
        </View>
        {todaysRoute && (
          <TouchableOpacity 
            style={styles.routeBadge}
            onPress={() => navigation.navigate('StoreList', { routeId: todaysRoute.route, routeName: todaysRoute.route_name })}
          >
            <Text style={styles.routeLabel}>Today's Route:</Text>
            <Text style={styles.routeName}>{todaysRoute.route_name}</Text>
          </TouchableOpacity>
        )}
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
          title="Routes" 
          icon="map-marker-path" 
          onPress={() => navigation.navigate('Routes')}
        />
        <DashboardCard 
          title="My Regularization" 
          icon="calendar-edit" 
          onPress={() => navigation.navigate('Regularization')}
        />
        <DashboardCard 
          title="Notifications" 
          subtitle="(Process Updates)"
          icon="bell" 
          onPress={() => navigation.navigate('Notifications')}
          color="#FF9800"
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
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  usernameText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  routeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  routeLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  routeName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'flex-start',
  },
});
