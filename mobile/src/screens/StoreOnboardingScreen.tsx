import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Switch
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

export default function StoreOnboardingScreen() {
  const [name, setName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('small');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(true);

  const navigation = useNavigation();
  const route = useRoute<any>();
  const { routeId } = route.params;

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to add a store.');
        navigation.goBack();
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
      setFetchingLocation(false);
    } catch (error) {
      console.log('Error getting location', error);
      Alert.alert('Error', 'Failed to fetch location. Please try again.');
      setFetchingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !managerName || !phoneNumber || !address) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!location) {
        Alert.alert('Error', 'Location not captured yet. Please wait.');
        return;
    }

    setLoading(true);
    try {
      await api.post('/tracking/stores/', {
        route: routeId,
        name,
        manager_name: managerName,
        phone_number: phoneNumber,
        address,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        capacity_size: capacity,
      });
      Alert.alert('Success', 'Store added successfully! Pending approval.');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding store:', error);
      Alert.alert('Error', 'Failed to add store.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingLocation) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Fetching accurate location...</Text>
          </View>
      );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Store Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter store name" />

        <Text style={styles.label}>Store Manager Name</Text>
        <TextInput style={styles.input} value={managerName} onChangeText={setManagerName} placeholder="Enter manager name" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput 
            style={styles.input} 
            value={phoneNumber} 
            onChangeText={setPhoneNumber} 
            placeholder="Enter phone number" 
            keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput 
            style={[styles.input, styles.textArea]} 
            value={address} 
            onChangeText={setAddress} 
            placeholder="Enter full address" 
            multiline 
        />

        <Text style={styles.label}>Capacity</Text>
        <View style={styles.capacityContainer}>
            {['small', 'medium', 'large'].map((size) => (
                <TouchableOpacity 
                    key={size} 
                    style={[styles.capacityButton, capacity === size && styles.capacityButtonActive]}
                    onPress={() => setCapacity(size)}
                >
                    <Text style={[styles.capacityText, capacity === size && styles.capacityTextActive]}>
                        {size.toUpperCase()}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
                📍 Location Captured: {location?.coords.latitude.toFixed(5)}, {location?.coords.longitude.toFixed(5)}
            </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Store</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  loadingText: {
      marginTop: 10,
      color: '#666',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  capacityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  capacityButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  capacityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  capacityText: {
    color: '#333',
    fontWeight: '600',
  },
  capacityTextActive: {
    color: '#fff',
  },
  locationInfo: {
      backgroundColor: '#E3F2FD',
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
  },
  locationText: {
      color: '#007AFF',
      textAlign: 'center',
      fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
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
