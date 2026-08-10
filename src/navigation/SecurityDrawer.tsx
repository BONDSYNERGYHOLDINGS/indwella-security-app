import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';

const SecurityDrawer = (props: DrawerContentComponentProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Image style={styles.img} source={require('../assets/logo.png')} />

      <Text style={styles.sectionTitle}>Support</Text>
      <TouchableOpacity onPress={() => Linking.openURL('tel:+123456789')}>
        <Text style={styles.item}>Call</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/2347012345678')}>
        <Text style={styles.item}>WhatsApp</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Powered by <Text style={{ fontWeight: 'bold' }}>LCR</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingVertical: 70 },
  img: {
    width: 145,
    height: 145,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    marginBottom: 0,
  },
  item: {
    paddingVertical: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    color: '#333',
    marginBottom: 20,
  },
  sectionTitle: { marginTop: 20, fontWeight: 'bold', color: '#555', fontSize: 20 },
  footer: { marginTop: 'auto', fontSize: 12, color: '#888', marginBottom: 20 },
});

export default SecurityDrawer;
