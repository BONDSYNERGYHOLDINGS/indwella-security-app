// navigation/SecurityStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SecurityHomeScreen from '../screens/security/Home';
import VisitDetailsScreen from '../screens/security/VisitDetails';


const Stack = createNativeStackNavigator();

const SecurityStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="security_home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="security_home" component={SecurityHomeScreen} />
      <Stack.Screen name="visit_details" component={VisitDetailsScreen} />
      
      
    </Stack.Navigator>
  );
};

export default SecurityStack;
