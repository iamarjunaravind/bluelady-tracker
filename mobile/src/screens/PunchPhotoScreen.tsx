import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function PunchPhotoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isCheckIn } = route.params;

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

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
    if (cameraRef.current && isCameraReady) {
        try {
            const photoData = await cameraRef.current.takePictureAsync({
                quality: 0.3,
            });
            setPhoto(photoData);
            
            // Capture location immediately with photo
            // Use timeout to prevent hanging
            Promise.race([
                Location.getCurrentPositionAsync({}),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
            ]).then((loc) => {
                if (loc) setLocation(loc as Location.LocationObject);
                else Alert.alert("Warning", "Location fetch timed out. Using last known location if available.");
            });

        } catch (e) {
            console.log(e);
            Alert.alert("Error", "Failed to capture photo.");
        }
    }
  };

  const submitPunch = async () => {
    if (!photo) {
        Alert.alert("Missing Info", "Please capture a photo.");
        return;
    }
    if (!location) {
        Alert.alert("Error", "Agent not on the location");
        return;
    }

    setUploading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        throw new Error("No auth token found");
      }

      const formData = new FormData();
      formData.append('latitude', String(location.coords.latitude));
      formData.append('longitude', String(location.coords.longitude));
      
      const uriParts = photo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('photo', {
        uri: photo.uri.startsWith('file://') ? photo.uri : `file://${photo.uri}`,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      console.log("Submitting punch via fetch...", { latitude: location.coords.latitude, longitude: location.coords.longitude });

      // Use native fetch to avoid Axios FormData issues
      const response = await fetch(`${api.defaults.baseURL}/tracking/punch/`, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json',
            // Content-Type must be undefined to let browser set boundary
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || "Failed to submit punch.");
      }

      Alert.alert('Success', `You have successfully ${isCheckIn ? 'checked in' : 'checked out'}.`);
      navigation.goBack();
    } catch (error: any) {
      console.error("Punch Error:", error);
      Alert.alert('Error', error.message || "Failed to submit punch.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          
          {location && (
            <View style={styles.locationOverlay}>
                <Text style={styles.locationText}>
                    Lat: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                    Long: {location.coords.longitude.toFixed(6)}
                </Text>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity style={styles.retakeButton} onPress={() => setPhoto(null)}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={submitPunch} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Punch</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView 
            style={styles.camera} 
            ref={cameraRef} 
            onCameraReady={() => setIsCameraReady(true)}
          />
          
          <View style={styles.overlay}>
             <View style={styles.buttonContainer}>
               <TouchableOpacity 
                    style={[styles.captureButton, { opacity: isCameraReady ? 1 : 0.5 }]} 
                    onPress={takePicture}
                    disabled={!isCameraReady}
                >
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
  locationOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 8,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
