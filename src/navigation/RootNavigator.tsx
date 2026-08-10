// navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AppStack from './AppStack';
import SecurityStack from './SecurityStack';
import { useAuth } from '../contexts/AuthContext';

const Drawer = createDrawerNavigator();

const RootNavigator = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Drawer.Navigator screenOptions={{ headerShown: false }}>
          <Drawer.Screen name="SecurityApp" component={SecurityStack} />
        </Drawer.Navigator>
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
