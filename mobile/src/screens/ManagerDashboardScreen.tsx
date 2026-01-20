import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

export default function ManagerDashboardScreen() {
  const { signOut, username } = useAuth();
  const navigation = useNavigation<any>();
  const [isTracking, setIsTracking] = useState(false);

  const checkTaskStatus = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(hasStarted);
  };

  useFocusEffect(
    useCallback(() => {
      checkTaskStatus();
    }, [])
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.usernameText}>{username || 'Manager'}</Text>
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
          title="Agents" 
          subtitle="(Tracking)"
          icon="account-group" 
          onPress={() => navigation.navigate('AgentsSection')}
          color="#673AB7"
        />
        <DashboardCard 
          title="My Attendance" 
          icon="calendar-check" 
          onPress={() => navigation.navigate('MyAttendance')}
        />
        <DashboardCard 
          title="Holiday Calendar" 
          icon="weather-sunny" 
          onPress={() => navigation.navigate('HolidayCalendar')}
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
  title: {
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
