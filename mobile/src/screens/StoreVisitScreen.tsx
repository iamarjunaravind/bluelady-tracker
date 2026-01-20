import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import api from '../services/api';

export default function StoreVisitScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { storeId, storeName } = route.params;

  useEffect(() => {
    navigation.setOptions({ title: `Visit: ${storeName}` });
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });
      setPhoto(result);
    }
  };

  const submitVisit = async () => {
    if (!photo) return;

    setUploading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      
      const formData = new FormData();
      formData.append('store', String(storeId));
      formData.append('latitude', String(location.coords.latitude));
      formData.append('longitude', String(location.coords.longitude));
      
      const filename = photo.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;
      
      formData.append('photo', {
        uri: photo.uri,
        name: filename,
        type: type,
      } as any);

      await api.post('/tracking/store-visit/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Store visit recorded successfully!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit visit. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          <View style={styles.controls}>
            <TouchableOpacity style={styles.retakeButton} onPress={() => setPhoto(null)}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={submitVisit} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Visit</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} ref={cameraRef} />
          <View style={styles.overlay}>
             <View style={styles.buttonContainer}>
               <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                 <View style={styles.captureInner} />
               </TouchableOpacity>
             </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 64,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    left: '50%',
    marginLeft: -35,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000',
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain', 
  },
  controls: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
    backgroundColor: '#000',
  },
  retakeButton: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 8,
    width: '40%',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '40%',
  },
});
