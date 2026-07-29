import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SecurityStackParamList } from '../../navigation/types';
import { api } from '../../lib/apiClient';

type VisitDetailsScreenProps = NativeStackScreenProps<SecurityStackParamList, 'visit_details'>;

const formatClockTime = (value: string) => {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return value;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  if (Number.isNaN(hours)) {
    return value;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

const VisitDetailsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SecurityStackParamList>>();
  const route = useRoute<VisitDetailsScreenProps['route']>();
  const { code, visitor } = route.params;
  const [approvalStatus, setApprovalStatus] = useState(visitor.approval_status || 'pending');
  const [departureConfirmed, setDepartureConfirmed] = useState(Boolean(visitor.departure_confirmed));
  const [visitStatus, setVisitStatus] = useState(
    visitor.departure_confirmed || visitor.status === 'Time up' ? 'Time up' : 'Active',
  );
  const [timeLeft, setTimeLeft] = useState(visitor.departure_confirmed ? '0:00:00' : visitor.time_left);
  const isPending = approvalStatus.toLowerCase() === 'pending';
  const isApproved = approvalStatus.toLowerCase() === 'approved';
  const visitStatusStyle = visitStatus === 'Active' ? styles.statusActive : styles.statusTimeUp;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.popToTop();
      return;
    }

    navigation.navigate('security_home');
  };

  const handleApprove = async () => {
    try {
      const res = await api.post(`/security/approve-visitor/${code}`);
      setApprovalStatus('approved');
      Alert.alert('Info', res.data.message || 'Visit approved successfully!');
    } catch (err: any) {
      console.error('Approve error:', err);
      Alert.alert('Info', err?.response?.data?.detail || 'Failed to approve visit');
    }
  };

  const handleDiscard = async () => {
    try {
      const res = await api.post(`/disapprove-visitor/${code}`);
      setApprovalStatus('disapproved');
      Alert.alert('Info', res.data.message || 'Visit discarded successfully!');
    } catch (err: any) {
      console.error('Discard error:', err);
      Alert.alert('Info', err?.response?.data?.detail || 'Failed to discard visit');
    }
  };

  const handleConfirmDeparture = async () => {
    try {
      const res = await api.post(`/security/confirm-departure/${code}`);
      setDepartureConfirmed(true);
      setTimeLeft('0:00:00');
      setVisitStatus('Time up');
      Alert.alert('Info', res.data.message || 'Departure confirmed successfully');
    } catch (err: any) {
      console.error('Confirm departure error:', err);
      Alert.alert('Info', err?.response?.data?.detail || 'Failed to confirm departure');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrowLLine" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Visit Details</Text>
          <Text style={styles.headerSubtitle}>Review this visitor before entry</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.profileContainer}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>{visitor.visitor_name?.[0]?.toUpperCase() || 'V'}</Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Time left:</Text>
            <Text style={styles.timerValue}>{timeLeft}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Visitor name</Text>
              <Text style={styles.detailValue}>{visitor.visitor_name}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, visitStatusStyle]}>{visitStatus}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Visitor phone</Text>
              <Text style={styles.detailValue}>{visitor.visitor_phone}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Access code</Text>
              <Text style={styles.detailValue}>{code}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Start time</Text>
              <Text style={styles.detailValue}>{formatClockTime(visitor.start_time)}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>End time</Text>
              <Text style={styles.detailValue}>{formatClockTime(visitor.end_time)}</Text>
            </View>
          </View>

          <View style={[styles.detailRow, styles.lastRow]}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Property Unit</Text>
              <Text style={styles.detailValue}>{visitor.house_address}</Text>
            </View>
            {isPending && (
              <View style={styles.detailColumn}>
                <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
                  <Text style={styles.discardButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!!visitor.comment && (
            <View style={styles.commentSection}>
              <Text style={styles.detailLabel}>Additional comment</Text>
              <Text style={styles.commentValue}>{visitor.comment}</Text>
            </View>
          )}

          {isApproved && (
            <TouchableOpacity
              style={[styles.departureButton, departureConfirmed && styles.departureButtonDisabled]}
              onPress={handleConfirmDeparture}
              disabled={departureConfirmed}
            >
              <Text style={styles.departureButtonText}>Confirm departure</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isPending && (
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
};

export default VisitDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F7EFFF',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
    width: 40,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileContainer: {
    flex: 1,
  },
  profileCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E7D8F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8506FF',
  },
  timerContainer: {
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerLabel: {
    color: '#666',
    marginRight: 6,
  },
  timerValue: {
    color: '#111',
    fontWeight: '700',
  },
  detailsContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    padding: 16,
    gap: 18,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  statusActive: {
    color: '#08A95A',
    fontWeight: '700',
  },
  statusTimeUp: {
    color: '#D92D20',
    fontWeight: '700',
  },
  lastRow: {
    alignItems: 'flex-end',
  },
  discardButton: {
    backgroundColor: '#FDE8E8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#C62828',
    fontWeight: '600',
  },
  commentSection: {
    marginTop: -2,
  },
  commentValue: {
    backgroundColor: '#F8F8F8',
    borderColor: '#eee',
    borderRadius: 10,
    borderWidth: 1,
    color: '#111',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    padding: 12,
  },
  bottomSection: {
    padding: 16,
  },
  approveButton: {
    backgroundColor: '#8506FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  departureButton: {
    backgroundColor: '#8506FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  departureButtonDisabled: {
    opacity: 0.4,
  },
  departureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
