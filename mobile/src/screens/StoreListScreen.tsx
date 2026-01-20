import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

export default function StoreListScreen() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { routeId, routeName } = route.params;

  useEffect(() => {
    navigation.setOptions({ title: routeName });
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await api.get(`/tracking/stores/?route_id=${routeId}`);
      setStores(response.data);
    } catch (error) {
      console.log('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('StoreVisit', { storeId: item.id, storeName: item.name })}
    >
      <View>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.details}>{item.manager_name} • {item.phone_number}</Text>
        <Text style={styles.address}>{item.address}</Text>
      </View>
      <View style={styles.capacityBadge}>
        <Text style={styles.capacityText}>{item.capacity_size.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <>
          <FlatList
            data={stores}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>No stores found for this route.</Text>}
          />
          <TouchableOpacity 
            style={styles.fab} 
            onPress={() => navigation.navigate('StoreOnboarding', { routeId })}
          >
            <Text style={styles.fabText}>+ Add Store</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  address: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  capacityBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  capacityText: {
    color: '#388E3C',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
