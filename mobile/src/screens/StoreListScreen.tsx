import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Linking, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import api from '../services/api';

// Haversine formula to calculate distance in meters
const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d * 1000; // Distance in meters
}

const deg2rad = (deg: number) => {
  return deg * (Math.PI/180)
}

export default function StoreListScreen() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<any>(null);
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

  const handleStorePress = (store: any) => {
    setSelectedStore(store);
  };

  const handlePunch = async () => {
    if (!selectedStore) return;

    try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
            const permission = await Location.requestForegroundPermissionsAsync();
            status = permission.status;
        }
        
        if (status !== 'granted') {
             Alert.alert('Permission Denied', 'Location permission is required.');
             return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const distance = getDistanceFromLatLonInM(
            location.coords.latitude,
            location.coords.longitude,
            selectedStore.latitude,
            selectedStore.longitude
        );

        if (distance > 150) {
            Alert.alert('Too Far', `You are ${Math.round(distance)}m away from the store. You must be within 150m.`);
            return;
        }

        setSelectedStore(null);
        navigation.navigate('StoreVisit', { storeId: selectedStore.id, storeName: selectedStore.name });

    } catch (error) {
        Alert.alert('Error', 'Failed to get current location.');
        console.log(error);
    }
  };

  const handleNavigate = () => {
    if (!selectedStore) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${selectedStore.latitude},${selectedStore.longitude}`;
    const label = selectedStore.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) {
        Linking.openURL(url);
    }
    setSelectedStore(null);
  };

  const handleEdit = () => {
      if (!selectedStore) return;
      setSelectedStore(null);
      navigation.navigate('StoreOnboarding', { storeId: selectedStore.id, routeId });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('StoreDetail', { store: item })}
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

      {selectedStore && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={!!selectedStore}
          onRequestClose={() => setSelectedStore(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedStore.name}</Text>
              
              <TouchableOpacity style={styles.modalButton} onPress={handlePunch}>
                <Text style={styles.modalButtonText}>📷 Punch Visit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalButton} onPress={handleNavigate}>
                <Text style={styles.modalButtonText}>🗺️ Navigate</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
                <Text style={styles.modalButtonText}>✏️ Edit Store</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setSelectedStore(null)}>
                <Text style={[styles.modalButtonText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  cancelText: {
    color: '#fff',
  },
});
