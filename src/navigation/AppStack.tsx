// navigation/AppStack.tsx
// Public (unauthenticated) routes for the security app: onboarding + code-based login.
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import IntroSliderScreen from '../screens/IntroSliderScreen';
import SecurityAuth from '../screens/security/Login';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator initialRouteName="onboarding" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" component={OnboardingScreen} />
      <Stack.Screen name="introslider" component={IntroSliderScreen} />
      <Stack.Screen name="security_auth" component={SecurityAuth} />
    </Stack.Navigator>
  );
};

export default AppStack;
