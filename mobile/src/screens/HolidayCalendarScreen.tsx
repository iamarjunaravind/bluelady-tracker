import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HolidayCalendarScreen() {
  const [markedDates, setMarkedDates] = useState(() => {
    const holidays: any = {};
    const year = new Date().getFullYear();
    
    // 1. Mark all Sundays
    for (let month = 0; month < 12; month++) {
      let d = new Date(year, month, 1);
      while (d.getMonth() === month) {
        if (d.getDay() === 0) { // Sunday
          const dateString = d.toISOString().split('T')[0];
          holidays[dateString] = { selected: true, selectedColor: '#FF3B30', title: 'Sunday' };
        }
        d.setDate(d.getDate() + 1);
      }
    }

    // 2. Mark National Holidays (India example)
    const nationalHolidays = [
      `${year}-01-26`, // Republic Day
      `${year}-08-15`, // Independence Day
      `${year}-10-02`, // Gandhi Jayanti
      `${year}-12-25`, // Christmas
    ];

    nationalHolidays.forEach(date => {
      holidays[date] = { selected: true, selectedColor: '#FF3B30', title: 'Holiday' };
    });

    return holidays;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Holiday Calendar {new Date().getFullYear()}</Text>
      </View>
      <Calendar
        markedDates={markedDates}
        theme={{
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
          indicatorColor: '#007AFF',
        }}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Holiday / Sunday</Text>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  legend: {
    padding: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});
