import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RoutesScreen() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigation = useNavigation<any>();
  const { isManager } = useAuth();

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Refresh when focusing in case store counts change
  useFocusEffect(
    React.useCallback(() => {
      fetchRoutes();
    }, [])
  );

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/tracking/routes/');
      setRoutes(response.data);
    } catch (error) {
      console.log('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
      setEditingRoute(null);
      setName('');
      setDescription('');
      setModalVisible(true);
  };

  const handleEdit = (route: any) => {
      setEditingRoute(route);
      setName(route.name);
      setDescription(route.description || '');
      setModalVisible(true);
  };

  const handleSubmit = async () => {
      if (!name) {
          Alert.alert('Error', 'Name is required');
          return;
      }

      setSubmitting(true);
      try {
          if (editingRoute) {
              await api.patch(`/tracking/routes/${editingRoute.id}/`, { name, description });
              Alert.alert('Success', 'Route updated');
          } else {
              await api.post('/tracking/routes/', { name, description });
              Alert.alert('Success', 'Route created');
          }
          setModalVisible(false);
          fetchRoutes();
      } catch (error: any) {
          console.error("Route Save Error:", error);
          const msg = error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message || 'Failed to save route';
          Alert.alert('Error', msg);
      } finally {
          setSubmitting(false);
      }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
        <TouchableOpacity 
            style={styles.cardContent} 
            onPress={() => navigation.navigate('StoreList', { routeId: item.id, routeName: item.name })}
        >
            <View style={styles.info}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.store_count} Stores</Text>
            </View>
        </TouchableOpacity>
        
        {isManager && (
            <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
        )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <>
            <FlatList
            data={routes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            />
            
            {isManager && (
                <TouchableOpacity style={styles.fab} onPress={handleAdd}>
                    <Text style={styles.fabText}>+ Add Route</Text>
                </TouchableOpacity>
            )}
        </>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{editingRoute ? 'Edit Route' : 'Add new Route'}</Text>
                  
                  <Text style={styles.label}>Route Name</Text>
                  <TextInput 
                    style={styles.input} 
                    value={name} 
                    onChangeText={setName} 
                    placeholder="e.g. Downtown"
                  />

                  <Text style={styles.label}>Description</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]} 
                    value={description} 
                    onChangeText={setDescription} 
                    placeholder="Optional description"
                    multiline
                  />

                  <View style={styles.modalActions}>
                      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                          <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit} disabled={submitting}>
                          {submitting ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Save</Text>}
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
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
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      justifyContent: 'space-between',
  },
  info: {
      flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  editButton: {
      padding: 16,
      backgroundColor: '#f0f0f0',
      borderLeftWidth: 1,
      borderLeftColor: '#eee',
      justifyContent: 'center',
  },
  editButtonText: {
      color: '#007AFF',
      fontWeight: '600',
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
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
  },
  modalContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
  },
  label: {
      fontWeight: '600',
      marginBottom: 6,
      color: '#333',
  },
  input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      backgroundColor: '#FAFAFA',
  },
  textArea: {
      height: 80,
      textAlignVertical: 'top',
  },
  modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
  },
  button: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
  },
  cancelButton: {
      backgroundColor: '#999',
  },
  saveButton: {
      backgroundColor: '#007AFF',
  },
  buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
  },
});
