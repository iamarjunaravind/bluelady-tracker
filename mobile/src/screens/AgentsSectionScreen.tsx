import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import DashboardCard from '../components/DashboardCard';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export default function AgentsSectionScreen() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users/list/');
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch employees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEmployees();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.first_name?.[0]?.toUpperCase() || item.username[0].toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#EEF2FF' }]} 
          onPress={() => navigation.navigate('EmployeeMap', { employeeId: item.id, employeeName: item.username })}
        >
          <Text style={[styles.actionText, { color: '#4F46E5' }]}>Live Track</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#F0FDF4' }]} 
          onPress={() => navigation.navigate('StaffAttendance', { employeeId: item.id, employeeName: item.username })}
        >
          <Text style={[styles.actionText, { color: '#16A34A' }]}>Attendance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tracking Views</Text>
      </View>
      
      <View style={styles.trackingOptions}>
        <DashboardCard 
          title="Team View" 
          subtitle="(All Agents)"
          icon="account-group" 
          onPress={() => navigation.navigate('AllAgentsMap')}
          color="#673AB7"
        />
        <DashboardCard 
          title="Add New Agent" 
          icon="account-plus" 
          onPress={() => navigation.navigate('AddEmployee')}
          color="#007AFF"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Individual View</Text>
      </View>

      <FlatList
        data={employees}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No employees found</Text> : null}
      />

      {loading && <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
  },
  trackingOptions: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  username: {
    fontSize: 12,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
