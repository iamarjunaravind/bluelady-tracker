import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import api from '../services/api';

export default function RegularizationScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/tracking/regularization/');
      setRequests(response.data);
    } catch (error) {
      console.log('Error fetching regularization requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
      if (!selectedDate || !reason) {
          Alert.alert('Error', 'Please select a date and enter a reason.');
          return;
      }

      setSubmitting(true);
      try {
          await api.post('/tracking/regularization/', {
              date: selectedDate,
              reason: reason
          });
          Alert.alert('Success', 'Request submitted successfully.');
          setModalVisible(false);
          setReason('');
          setSelectedDate('');
          fetchRequests();
      } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Failed to submit request.');
      } finally {
          setSubmitting(false);
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'approved': return '#4CAF50';
          case 'rejected': return '#F44336';
          default: return '#FF9800';
      }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{item.date}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.reasonLabel}>Reason:</Text>
      <Text style={styles.reason}>{item.reason}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No regularization requests found.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Request</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Request Regularization</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
              </View>

              <View style={styles.form}>
                  <Text style={styles.label}>Select Date</Text>
                  <Calendar
                    onDayPress={(day: any) => setSelectedDate(day.dateString)}
                    markedDates={{
                        [selectedDate]: {selected: true, disableTouchEvent: true, selectedColor: '#007AFF'}
                    }}
                    maxDate={new Date().toISOString().split('T')[0]} // Cannot select future dates
                  />

                  <Text style={styles.label}>Reason</Text>
                  <TextInput
                    style={styles.input}
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Why did you miss the punch?"
                    multiline
                  />

                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
                      {submitting ? <ActivityIndicator color="#fff"/> : <Text style={styles.submitButtonText}>Submit Request</Text>}
                  </TouchableOpacity>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  date: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
  },
  badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
  },
  badgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
  },
  reasonLabel: {
      fontSize: 12,
      color: '#999',
      marginBottom: 2,
  },
  reason: {
      fontSize: 15,
      color: '#555',
  },
  empty: {
      textAlign: 'center',
      marginTop: 50,
      color: '#999',
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
  modalContainer: {
      flex: 1,
      backgroundColor: '#fff',
  },
  modalHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 40,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  closeText: {
      color: '#007AFF',
      fontSize: 16,
  },
  form: {
      padding: 20,
  },
  label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      color: '#333',
  },
  input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      height: 100,
      textAlignVertical: 'top',
      backgroundColor: '#FAFAFA',
      fontSize: 16,
  },
  submitButton: {
      marginTop: 30,
      backgroundColor: '#007AFF',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
  },
  submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },
});
