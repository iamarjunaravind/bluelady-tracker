import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';

// Manager Screens
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import EmployeeMapScreen from '../screens/EmployeeMapScreen';

// Common & User Screens
import UserHomeScreen from '../screens/UserHomeScreen';
import AllAgentsMapScreen from '../screens/AllAgentsMapScreen';
import AgentsSectionScreen from '../screens/AgentsSectionScreen';
import PunchPhotoScreen from '../screens/PunchPhotoScreen';
import HolidayCalendarScreen from '../screens/HolidayCalendarScreen';
import MyAttendanceScreen from '../screens/MyAttendanceScreen';
import StaffAttendanceScreen from '../screens/StaffAttendanceScreen';
import RoutesScreen from '../screens/RoutesScreen';
import StoreListScreen from '../screens/StoreListScreen';
import StoreOnboardingScreen from '../screens/StoreOnboardingScreen';
import StoreVisitScreen from '../screens/StoreVisitScreen';
import ManagerApprovalScreen from '../screens/ManagerApprovalScreen';

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

  const CommonScreens = (
    <>
      <Stack.Screen name="PunchPhoto" component={PunchPhotoScreen} options={{ headerShown: true, title: 'Capture Photo' }} />
      <Stack.Screen name="HolidayCalendar" component={HolidayCalendarScreen} options={{ headerShown: true, title: 'Holiday Calendar' }} />
      <Stack.Screen name="MyAttendance" component={MyAttendanceScreen} options={{ headerShown: true, title: 'My Attendance' }} />
      <Stack.Screen name="Routes" component={RoutesScreen} options={{ headerShown: true, title: 'Routes' }} />
      <Stack.Screen name="StoreList" component={StoreListScreen} options={{ headerShown: true, title: 'Stores' }} />
      <Stack.Screen name="StoreOnboarding" component={StoreOnboardingScreen} options={{ headerShown: true, title: 'Add New Store' }} />
      <Stack.Screen name="StoreVisit" component={StoreVisitScreen} options={{ headerShown: true, title: 'Store Visit' }} />
      <Stack.Screen name="ManagerApproval" component={ManagerApprovalScreen} options={{ headerShown: true, title: 'Approvals' }} />
    </>
  );

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
             <Stack.Screen name="AllAgentsMap" component={AllAgentsMapScreen} options={{ headerShown: true, title: 'All Agents Map' }} />
             <Stack.Screen name="AgentsSection" component={AgentsSectionScreen} options={{ headerShown: true, title: 'Agents Section' }} />
             <Stack.Screen name="StaffAttendance" component={StaffAttendanceScreen} options={{ headerShown: true, title: 'Staff Attendance' }} />
             {CommonScreens}
           </>
        ) : (
          <>
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            {CommonScreens}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
