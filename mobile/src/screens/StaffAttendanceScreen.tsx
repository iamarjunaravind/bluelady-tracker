import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import api from '../services/api';

export default function StaffAttendanceScreen() {
  const [markedDates, setMarkedDates] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const route = useRoute<any>();
  const { employeeId, employeeName } = route.params;

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/tracking/staff-attendance/', {
        params: { user_id: employeeId }
      });
      const records = response.data;
      
      const marked: any = {};
      const year = new Date().getFullYear();

      // 1. Mark Holidays & Sundays
      for (let month = 0; month < 12; month++) {
        let d = new Date(year, month, 1);
        while (d.getMonth() === month) {
          if (d.getDay() === 0) { // Sunday
            const dateString = d.toISOString().split('T')[0];
            marked[dateString] = { marked: true, dotColor: '#FF3B30' };
          }
          d.setDate(d.getDate() + 1);
        }
      }

      // 1b. Mark National Holidays
      const nationalHolidays = [
        `${year}-01-26`, // Republic Day
        `${year}-08-15`, // Independence Day
        `${year}-10-02`, // Gandhi Jayanti
        `${year}-12-25`, // Christmas
      ];

      nationalHolidays.forEach(date => {
        marked[date] = { marked: true, dotColor: '#FF3B30' };
      });

      // 2. Mark Punched Days
      records.forEach((record: any) => {
        const dateString = record.timestamp.split('T')[0];
        marked[dateString] = { 
          selected: true, 
          selectedColor: '#007AFF',
          marked: marked[dateString]?.marked || false,
          dotColor: marked[dateString]?.dotColor || undefined
        };
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAttendance();
    }, [employeeId])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance: {employeeName}</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <>
          <Calendar
            markedDates={markedDates}
            theme={{
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#ffffff',
            }}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.box, { backgroundColor: '#007AFF' }]} />
              <Text style={styles.legendText}>Present (Punched)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.legendText}>Holiday / Sunday</Text>
            </View>
          </View>
        </>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    marginTop: 50,
  },
  legend: {
    padding: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  box: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    marginLeft: 2,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});
