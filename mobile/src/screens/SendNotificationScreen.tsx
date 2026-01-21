import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function SendNotificationScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const navigation = useNavigation();

  const sendNotification = async () => {
    if (!title || !message) {
      Alert.alert('Error', 'Please fill in both title and message.');
      return;
    }

    setSending(true);
    try {
      await api.post('/tracking/notifications/', {
        title,
        message,
      });
      Alert.alert('Success', 'Notification sent successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Failed to send notification. Please check your connection and permissions.';
      Alert.alert('Error', msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Important Update"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Type your message here..."
        value={message}
        onChangeText={setMessage}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.button} onPress={sendNotification} disabled={sending}>
        {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send to All</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 150,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
