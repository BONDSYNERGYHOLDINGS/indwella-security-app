// navigation/AppStack.tsx
// Public (unauthenticated) routes for the security app: intro slider + code-based login.
//
// This app ships to security agents only - residents have their own app and
// facility managers use the web admin - so there is no role-picker step. The
// intro slider is the first screen.
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntroSliderScreen from '../screens/IntroSliderScreen';
import SecurityAuth from '../screens/security/Login';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator initialRouteName="introslider" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="introslider" component={IntroSliderScreen} />
      <Stack.Screen name="security_auth" component={SecurityAuth} />
    </Stack.Navigator>
  );
};

export default AppStack;
