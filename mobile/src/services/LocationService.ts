import * as Location from 'expo-location';
import api from './api';
import { Alert } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

class LocationService {
    private static instance: LocationService;
    private subscription: Location.LocationSubscription | null = null;
    private isTracking = false;

    private constructor() {}

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    async startBackgroundLocation() {
        if (this.isTracking) return;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

        // Foreground tracking (works when app is open)
        this.subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 60000, // Update every 1 minute
                distanceInterval: 50, // Or every 50 meters
            },
            async (location) => {
                await this.sendLocationUpdate(location);
            }
        );

        this.isTracking = true;
        console.log("Location tracking started");
    }

    async stopBackgroundLocation() {
        if (this.subscription) {
            this.subscription.remove();
            this.subscription = null;
        }
        this.isTracking = false;
        console.log("Location tracking stopped");
    }

    private async sendLocationUpdate(location: Location.LocationObject) {
        try {
            await api.post('/tracking/update/', {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            console.log("Location sent:", location.coords.latitude, location.coords.longitude);
        } catch (error) {
            console.log("Failed to send location update", error);
        }
    }
}

export default LocationService.getInstance();
