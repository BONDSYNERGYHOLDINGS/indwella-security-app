import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Icon from '../../components/Icon';
import { api } from '../../lib/apiClient';
import { useAuth } from '../../../contexts/AuthContext';
import DeviceInfo from 'react-native-device-info';
// import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';


const SecurityAuth = () => {
    const [showSecurityCode, setShowSecurityCode] = React.useState(false);
    const [securityCode, setSecurityCode] = React.useState('');
   const [loading, setLoading] = React.useState(false);

      const {login} = useAuth();

// const getIn = () => {
//   navigation.navigate('SecurityApp', {
//     screen: 'security_home'
//   });
// }

const handleLogin = async () => {
  if (!securityCode) {
    Alert.alert('Error', 'Please enter security code to login.');
    return;
  }

  setLoading(true);
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceName = await DeviceInfo.getDeviceName();
    const deviceBrand = DeviceInfo.getBrand();
    const deviceModel = DeviceInfo.getModel();
    const systemName = DeviceInfo.getSystemName();
    const systemVersion = DeviceInfo.getSystemVersion();

    const response = await api.post('/security_login', {
      code: securityCode,
      device_id: deviceId,
      device_name: deviceName,
      device_brand: deviceBrand,
      device_model: deviceModel,
      system_name: systemName,
      system_version: systemVersion,
    });


    // ✅ Handle success case
    if (response.data.message === 'Login successful' && response.data.access_token) {
      await login(response.data.access_token, response.data.refresh_token);
    } else {
      Alert.alert('Login failed', response.data.message || 'Unknown error');
    }
  } catch (error: any) {
    const backendMessage =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      'Invalid or expired code. Please try again.';

    Alert.alert('Login failed', backendMessage);
  } finally {
    setLoading(false);
  }
};




  return (
    <View style={styles.container}>
      <View style={styles.imgContainer}>
        <Image
          source={require('../../assets/slide1.png')}
          style={styles.image}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputContainer]}>
          {/* Header section with title and subtitle */}
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              gap: 3,
            }}>
            <Icon name="arrowRFilled" size={20} style={{marginTop: 8}} />
            <View
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}>
              <Text
                style={{
                  fontSize: 30,
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#000000',
                  marginBottom: 0,
                }}>
                Log in
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  textAlign: 'left',
                  fontWeight: '500',
                  color: '#000000',
                  marginBottom: 10,
                }}>
                Enter your email to log in
              </Text>
            </View>
          </View>

          {/* // ===== Security LOGIN FORM ===== */}
          <View style={{width: '100%'}}>
            {/* Security Token*/}
            <View style={styles.inputDetails}>
              <View>
                <Text style={styles.label}>Security Code</Text>
                <TextInput
                  placeholder="********"
                  value={securityCode}
                  onChangeText={setSecurityCode}
                  secureTextEntry={!showSecurityCode}
                  placeholderTextColor={'#CCCCCC'}
                  style={styles.inputBox}
                  keyboardType="default"
                  autoCorrect={false}
                  autoComplete="current-password"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowSecurityCode(!showSecurityCode)}>
                <Text style={{ color: '#8506FF', fontSize: 15, fontWeight: '700', marginBottom: 10, textAlign: 'right' }}>
                  {showSecurityCode ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            //  onPress={handleLogin}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SecurityAuth;

// ============= STYLES =============
const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingTop: 150,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Image container styles
  imgContainer: {
    width: '100%',
    height: '60%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'white',
  },
  // Image styles
  image: {
    width: '100%',
    height: '60%',
    resizeMode: 'contain',
  },

    // Form container styles
  inputContainer: {
    flex: 1,
    backgroundColor: '#F7EFFF',
    width: '100%',
    // height: '55%',
    paddingVertical: 40,
    paddingHorizontal: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },

  // Input field container styles
  inputDetails: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 1,
    marginVertical: 3,
    borderColor: '#CCCCCC',
  },
  // Input field styles
  inputBox: {
    width: '100%',
    borderWidth: 0,
    borderColor: '#CCCCCC',
    marginTop: 0,
    color: '#000000',
    fontSize: 18,
    paddingVertical: 10,
  },
  // Label styles
  label: {
    color: '#8506FF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: -8,
    marginTop: 5,
  },
  // Error container styles
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
  },
  // Error text styles
  errorText: {
    color: '#FF0000',
    fontSize: 14,
  },


  // Disabled button styles
  buttonDisabled: {
    opacity: 0.7,
  },
  // Button styles
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 330,
    // width: '100%',
    paddingHorizontal: 25,
    paddingVertical: 17,
    borderRadius: 6,
    backgroundColor: '#8506FF',
    marginTop: 20,
  },
  // Button text styles
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 25,
  },
  // Mode switch button styles
  switchModeButton: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 8,
  },
  // Mode switch text styles
  switchModeText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    color: '#000000',
  },
});
