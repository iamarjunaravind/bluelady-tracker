import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function ManagerApprovalScreen() {
  const [activeTab, setActiveTab] = useState<'stores' | 'visits'>('stores');
  const [pendingStores, setPendingStores] = useState([]);
  const [pendingVisits, setPendingVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await api.get('/tracking/manager/pending/');
      setPendingStores(response.data.pending_stores);
      setPendingVisits(response.data.pending_visits);
    } catch (error) {
      console.log('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveStore = async (id: number) => {
    try {
      await api.post(`/tracking/manager/approve/store/${id}/`);
      Alert.alert('Success', 'Store approved.');
      fetchPendingApprovals(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Failed to approve store.');
    }
  };

  const approveVisit = async (id: number) => {
    try {
      await api.post(`/tracking/manager/approve/visit/${id}/`);
      Alert.alert('Success', 'Visit approved.');
      fetchPendingApprovals(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Failed to approve visit.');
    }
  };

  const renderStoreItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>New Store</Text>
        </View>
      </View>
      <Text style={styles.details}>Manager: {item.manager_name}</Text>
      <Text style={styles.details}>Phone: {item.phone_number}</Text>
      <Text style={styles.address}>{item.address}</Text>
      <Text style={styles.meta}>Route: {item.route_name} • Size: {item.capacity_size}</Text>
      
      <TouchableOpacity style={styles.approveButton} onPress={() => approveStore(item.id)}>
        <Text style={styles.approveButtonText}>Approve Store</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVisitItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.store_name}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <Text style={styles.details}>Agent: {item.username}</Text>
      
      {item.photo && (
        <Image source={{ uri: item.photo }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.approveButton} onPress={() => approveVisit(item.id)}>
        <Text style={styles.approveButtonText}>Approve Visit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'stores' && styles.activeTab]} 
            onPress={() => setActiveTab('stores')}
        >
            <Text style={[styles.tabText, activeTab === 'stores' && styles.activeTabText]}>Stores ({pendingStores.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'visits' && styles.activeTab]} 
            onPress={() => setActiveTab('visits')}
        >
            <Text style={[styles.tabText, activeTab === 'visits' && styles.activeTabText]}>Visits ({pendingVisits.length})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={activeTab === 'stores' ? pendingStores : pendingVisits}
          renderItem={activeTab === 'stores' ? renderStoreItem : renderVisitItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending items.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
      backgroundColor: '#FFF3E0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
  },
  badgeText: {
      color: '#FF9800',
      fontSize: 12,
      fontWeight: 'bold',
  },
  timestamp: {
      fontSize: 12,
      color: '#999',
  },
  details: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  meta: {
      fontSize: 12,
      color: '#888',
      marginBottom: 12,
  },
  previewImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginVertical: 12,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});
