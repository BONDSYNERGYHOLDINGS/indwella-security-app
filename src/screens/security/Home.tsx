import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../lib/apiClient';
import Icon from '../../components/Icon';
import { SecurityStackParamList } from '../../navigation/types';

const CODE_LENGTH = 6;

const formatDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

const CalendarGlyph = () => (
  <View style={styles.calendarGlyph}>
    <View style={styles.calendarRingRow}>
      <View style={styles.calendarRing} />
      <View style={styles.calendarRing} />
    </View>
    <View style={styles.calendarTopBar} />
    <View style={styles.calendarGrid}>
      <View style={styles.calendarGridDot} />
      <View style={styles.calendarGridDot} />
      <View style={styles.calendarGridDot} />
      <View style={styles.calendarGridDot} />
    </View>
  </View>
);

type SecurityVisitorResponse = {
  id: number;
  visitor_name: string;
  visitor_phone: string;
  house_address: string;
  start_time: string;
  end_time: string;
  time_left: string;
  status: string;
  approval_status: string;
  comment?: string | null;
  departure_confirmed?: boolean;
};

type SecurityVisitHistoryItem = {
  id: number;
  visitor_name: string;
  visitor_phone: string;
  access_code: string;
  house_address: string;
  visit_date: string;
  visit_time: string;
  end_time: string;
  approval_status: string;
  status: string;
};

export default function SecurityHome() {
  const navigation = useNavigation<NativeStackNavigationProp<SecurityStackParamList>>();
  const codeInputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<SecurityVisitHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailsLoadingCode, setDetailsLoadingCode] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedVisitDate, setSelectedVisitDate] = useState<Date | null>(null);
  const [invalidCode, setInvalidCode] = useState(false);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await api.get<SecurityVisitHistoryItem[]>('/visitor-history');
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching security visitor history:', err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, []),
  );

  const handleCodeChange = (value: string) => {
    setInvalidCode(false);
    setCode(value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, CODE_LENGTH));
  };

  const handleVisitDateChange = (_event: DateTimePickerEvent, nextDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (nextDate) {
      setSelectedVisitDate(nextDate);
    }
  };

  const handleVerifyVisitor = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length !== CODE_LENGTH) {
      setInvalidCode(true);
      Alert.alert('Info', 'Enter a complete visitor access code first.');
      return;
    }

    try {
      setLoading(true);
      setInvalidCode(false);
      const res = await api.get<SecurityVisitorResponse>(`/verify-visitor-details/${trimmedCode}`);

      setCode('');
      navigation.navigate('visit_details', {
        code: trimmedCode,
        visitor: res.data,
      });
    } catch (err: any) {
      setInvalidCode(true);
      Alert.alert(
        'Info',
        err?.response?.data?.detail || err?.response?.data?.message || 'Could not verify this visitor code.',
      );
    } finally {
      setLoading(false);
    }
  };

  const openVisitDetails = async (accessCode: string) => {
    if (!accessCode) {
      Alert.alert('Info', 'This visit does not have an access code.');
      return;
    }

    try {
      setDetailsLoadingCode(accessCode);
      const res = await api.get<SecurityVisitorResponse>(`/security/visitor-details/${accessCode}`);
      navigation.navigate('visit_details', {
        code: accessCode,
        visitor: res.data,
      });
    } catch (err: any) {
      console.error('Error opening visitor details:', err);
      Alert.alert(
        'Info',
        err?.response?.data?.detail || err?.response?.data?.message || 'Could not open this visitor.',
      );
      fetchHistory();
    } finally {
      setDetailsLoadingCode(null);
    }
  };

  const filteredHistory = history.filter((item) => {
    const query = search.trim().toLowerCase();
    const selectedDateKey = selectedVisitDate ? formatDateKey(selectedVisitDate) : '';
    const matchesDate = !selectedDateKey || item.visit_date?.startsWith(selectedDateKey);
    const matchesSearch = !query || [item.visitor_name, item.house_address, item.approval_status, item.access_code]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));

    return matchesDate && matchesSearch;
  });

  const renderCodeDots = () => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.codeBox, invalidCode && styles.codeBoxInvalid]}
      onPress={() => codeInputRef.current?.focus()}
    >
      <Text style={styles.codeLabel}>Visitors code</Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[styles.codeDot, index < code.length && styles.codeDotFilled]}
          />
        ))}
      </View>
      <TextInput
        ref={codeInputRef}
        value={code}
        onChangeText={handleCodeChange}
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
      />
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: SecurityVisitHistoryItem }) => {
    const normalizedStatus = item.approval_status?.toLowerCase() || 'pending';
    const statusStyle = normalizedStatus === 'approved'
      ? styles.statusApproved
      : normalizedStatus === 'disapproved'
        ? styles.statusDisapproved
        : styles.statusPending;
    const statusText = normalizedStatus === 'approved'
      ? 'Approved'
      : normalizedStatus === 'disapproved'
        ? 'Disapproved'
        : 'Pending';

    const isOpening = detailsLoadingCode === item.access_code;

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyText}>
          <Text style={styles.historyName} numberOfLines={1}>{item.visitor_name}</Text>
          <Text style={styles.historyMeta} numberOfLines={1}>
            {formatClockTime(item.visit_time)}, {item.visit_date} - {item.house_address}
          </Text>
        </View>
        <View style={styles.historyAction}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.detailsButton, isOpening && styles.detailsButtonDisabled]}
            onPress={() => openVisitDetails(item.access_code)}
            disabled={isOpening}
          >
            {isOpening ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.detailsButtonText}>View Details</Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.statusText, statusStyle]}>{statusText}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Visitor</Text>
        <Text style={styles.subtitle}>Enter a visitor access code to review and approve entry.</Text>
      </View>

      {renderCodeDots()}

      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
        onPress={handleVerifyVisitor}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyButtonText}>{invalidCode ? 'Invalid Code!' : 'Verify Code'}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.historyTab}>
        <View style={styles.gridIcon}>
          <View style={styles.gridSquare} />
          <View style={styles.gridSquare} />
          <View style={styles.gridSquare} />
          <View style={styles.gridSquare} />
        </View>
        <Text style={styles.historyTabText}>Visit History</Text>
      </View>

      <View style={styles.searchBox}>
        <Icon name="search" size={19} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search visit"
          placeholderTextColor="#A6A6A6"
          style={styles.searchInput}
        />
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setShowDatePicker(true)}
          style={styles.calendarButton}
        >
          <CalendarGlyph />
        </TouchableOpacity>
      </View>

      {selectedVisitDate && (
        <View style={styles.dateFilterRow}>
          <Text style={styles.dateFilterText}>Date: {formatDateKey(selectedVisitDate)}</Text>
          <TouchableOpacity onPress={() => setSelectedVisitDate(null)} style={styles.clearDateButton}>
            <Text style={styles.clearDateText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedVisitDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleVisitDateChange}
        />
      )}

      {historyLoading ? (
        <ActivityIndicator color="#8506FF" style={styles.historyLoader} />
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item, index) => `${item.visitor_name}-${item.visit_date}-${index}`}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={<Text style={styles.emptyText}>No visitor history found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    color: '#1D1530',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6D6876',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  codeBox: {
    backgroundColor: '#fff',
    borderColor: '#E4E1EA',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 144,
    paddingHorizontal: 24,
    paddingTop: 17,
    position: 'relative',
  },
  codeBoxInvalid: {
    borderColor: '#B000F7',
  },
  codeLabel: {
    color: '#261A3C',
    fontSize: 17,
    fontWeight: '400',
  },
  dotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 31,
  },
  codeDot: {
    backgroundColor: '#959595',
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  codeDotFilled: {
    backgroundColor: '#8506FF',
  },
  hiddenInput: {
    bottom: 0,
    color: 'transparent',
    height: 1,
    left: 0,
    opacity: 0,
    position: 'absolute',
    width: 1,
  },
  verifyButton: {
    alignItems: 'center',
    backgroundColor: '#8F00FF',
    borderRadius: 7,
    justifyContent: 'center',
    minHeight: 78,
    marginTop: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.75,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 27,
    fontWeight: '700',
  },
  historyTab: {
    alignItems: 'center',
    backgroundColor: '#F8F2FB',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 39,
    minHeight: 32,
  },
  gridIcon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    height: 17,
    marginRight: 9,
    width: 17,
  },
  gridSquare: {
    borderColor: '#8F00FF',
    borderWidth: 2,
    height: 7,
    width: 7,
  },
  historyTabText: {
    color: '#8F00FF',
    fontSize: 16,
    fontWeight: '400',
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#E9E5F0',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 66,
    marginTop: 17,
    paddingHorizontal: 15,
  },
  searchIcon: {
    tintColor: '#A6A6A6',
  },
  searchInput: {
    color: '#27232E',
    flex: 1,
    fontSize: 17,
    marginHorizontal: 12,
    paddingVertical: 10,
  },
  calendarButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  calendarGlyph: {
    alignItems: 'center',
    borderColor: '#8F00FF',
    borderRadius: 4,
    borderWidth: 3,
    height: 32,
    justifyContent: 'flex-start',
    position: 'relative',
    width: 32,
  },
  calendarRingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 6,
    position: 'absolute',
    right: 6,
    top: -5,
  },
  calendarRing: {
    backgroundColor: '#8F00FF',
    borderRadius: 2,
    height: 8,
    width: 4,
  },
  calendarTopBar: {
    backgroundColor: '#8F00FF',
    height: 6,
    marginTop: 6,
    width: '100%',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 5,
    paddingTop: 4,
  },
  calendarGridDot: {
    backgroundColor: '#8F00FF',
    borderRadius: 1,
    height: 4,
    width: 4,
  },
  dateFilterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dateFilterText: {
    color: '#5E536C',
    fontSize: 13,
    fontWeight: '600',
  },
  clearDateButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearDateText: {
    color: '#8F00FF',
    fontSize: 13,
    fontWeight: '700',
  },
  historyLoader: {
    marginTop: 32,
  },
  historyList: {
    paddingBottom: 32,
    paddingTop: 14,
  },
  historyCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#E4E1EA',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 18,
    minHeight: 99,
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  historyText: {
    flex: 1,
    marginRight: 12,
  },
  historyName: {
    color: '#2C2A2F',
    fontSize: 16,
    fontWeight: '700',
  },
  historyMeta: {
    color: '#2C2A2F',
    fontSize: 14,
    marginTop: 9,
  },
  historyAction: {
    alignItems: 'flex-end',
    minWidth: 88,
  },
  detailsButton: {
    alignItems: 'center',
    backgroundColor: '#8F00FF',
    borderRadius: 14,
    minHeight: 25,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  detailsButtonDisabled: {
    opacity: 0.75,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  statusApproved: {
    color: '#08C77A',
  },
  statusDisapproved: {
    color: '#FF4F57',
  },
  statusPending: {
    color: '#A16600',
  },
  emptyText: {
    color: '#8A8591',
    fontSize: 15,
    marginTop: 28,
    textAlign: 'center',
  },
});
