import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import api from '../services/api';

export default function RouteAssignmentScreen() {
    const [step, setStep] = useState(1); // 1: Select Staff, 2: Select Date, 3: Select Route
    const [staff, setStaff] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, routesRes] = await Promise.all([
                api.get('/users/list/'),
                api.get('/tracking/routes/')
            ]);
            setStaff(usersRes.data);
            setRoutes(routesRes.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const checkAndAssign = async () => {
        if (!selectedStaff || !selectedDate || !selectedRoute) return;

        // Check if already assigned
        try {
            const checkRes = await api.get(`/tracking/assignments/?user=${selectedStaff.id}&date=${selectedDate}`);
            if (checkRes.data && checkRes.data.length > 0) {
                const existing = checkRes.data[0];
                Alert.alert(
                    'Assignment Exists',
                    `${selectedStaff.username} is already assigned to "${existing.route_name}" on ${selectedDate}. Do you want to reassign?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Reassign', onPress: handleAssign }
                    ]
                );
            } else {
                // No conflict, proceed
                handleAssign();
            }
        } catch (error) {
            console.log(error);
            // If check fails, just try to assign
            handleAssign();
        }
    };

    const handleAssign = async () => {
        setAssigning(true);
        try {
            await api.post('/tracking/assignments/', {
                user: selectedStaff.id,
                route: selectedRoute.id,
                date: selectedDate
            });
            Alert.alert('Success', `Route assigned to ${selectedStaff.username} for ${selectedDate}`);
            // Reset for next assignment
            setStep(1);
            setSelectedStaff(null);
            setSelectedDate('');
            setSelectedRoute(null);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to assign route');
        } finally {
            setAssigning(false);
        }
    };

    const renderStaffItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.card, selectedStaff?.id === item.id && styles.selectedCard]} 
            onPress={() => {
                setSelectedStaff(item);
                setStep(2);
            }}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{item.username}</Text>
        </TouchableOpacity>
    );

    const renderRouteItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.card, selectedRoute?.id === item.id && styles.selectedCard]} 
            onPress={() => {
                setSelectedRoute(item);
                // Prompt confirmation
                Alert.alert(
                    'Confirm Assignment',
                    `Assign ${item.name} to ${selectedStaff.username} for ${selectedDate}?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Assign', onPress: checkAndAssign }
                    ]
                );
            }}
        >
            <View>
                <Text style={styles.routeName}>{item.name}</Text>
                <Text style={styles.routeDesc}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.progress}>
                <View style={[styles.step, step >= 1 && styles.activeStep]}><Text style={styles.stepText}>1. Staff</Text></View>
                <View style={styles.line} />
                <View style={[styles.step, step >= 2 && styles.activeStep]}><Text style={styles.stepText}>2. Date</Text></View>
                <View style={styles.line} />
                <View style={[styles.step, step >= 3 && styles.activeStep]}><Text style={styles.stepText}>3. Route</Text></View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
            ) : (
                <View style={styles.content}>
                    {step === 1 && (
                        <FlatList
                            data={staff}
                            renderItem={renderStaffItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.list}
                        />
                    )}

                    {step === 2 && (
                        <View style={styles.calendarContainer}>
                            <Text style={styles.instruction}>Select Date for Assignment</Text>
                            <Calendar
                                onDayPress={(day: any) => {
                                    setSelectedDate(day.dateString);
                                    setStep(3);
                                }}
                                markedDates={{
                                    [selectedDate]: { selected: true, selectedColor: '#007AFF' }
                                }}
                                minDate={new Date().toISOString().split('T')[0]}
                            />
                            <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                                <Text style={styles.backButtonText}>Back to Staff Selection</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 3 && (
                        <>
                            <Text style={styles.summary}>
                                Assigning to: <Text style={{fontWeight: 'bold'}}>{selectedStaff.username}</Text> on <Text style={{fontWeight: 'bold'}}>{selectedDate}</Text>
                            </Text>
                            <FlatList
                                data={routes}
                                renderItem={renderRouteItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.list}
                            />
                            <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                                <Text style={styles.backButtonText}>Back to Date Selection</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

            {assigning && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{color: '#fff', marginTop: 10}}>Assigning Route...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    progress: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
        elevation: 2,
    },
    step: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    activeStep: {
        backgroundColor: '#007AFF',
    },
    stepText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    line: {
        width: 20,
        height: 2,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 5,
    },
    content: {
        flex: 1,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    name: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    calendarContainer: {
        padding: 20,
    },
    instruction: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    backButton: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    routeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    routeDesc: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    summary: {
        padding: 16,
        fontSize: 15,
        color: '#444',
        backgroundColor: '#E3F2FD',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
