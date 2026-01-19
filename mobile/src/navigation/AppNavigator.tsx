import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import { View, ActivityIndicator } from 'react-native';


// Manager Screens
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import EmployeeMapScreen from '../screens/EmployeeMapScreen';

// User Screen
import UserHomeScreen from '../screens/UserHomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, isManager, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : isManager ? (
           <>
             <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
             <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} options={{ headerShown: true, title: 'Add Employee' }} />
             <Stack.Screen name="EmployeeMap" component={EmployeeMapScreen} options={{ headerShown: true, title: 'Live Location' }} />
           </>
        ) : (
          <Stack.Screen name="UserHome" component={UserHomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import { Text } from 'react-native';
