import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';
import {
  getOwnerCustomers,
  OwnerCustomer,
  updateOwnerCustomerStatus,
} from '../../api/ownerCustomers';

interface Props {
  navigation: any;
}

const FILTERS: Array<'all' | 'active' | 'inactive'> = ['all', 'active', 'inactive'];

function formatDate(value?: string | null) {
  if (!value) return 'No bookings yet';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OwnerCustomersScreen({navigation}: Props) {
  const [customers, setCustomers] = useState<OwnerCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [updatingCustomerId, setUpdatingCustomerId] = useState('');

  const fetchCustomers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const data = await getOwnerCustomers({
        search: search.trim() || undefined,
        status: statusFilter,
      });
      setCustomers(data);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const customerStats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(customer => customer.isActive).length,
    inactive: customers.filter(customer => !customer.isActive).length,
  }), [customers]);

  const toggleCustomerStatus = useCallback(async (customer: OwnerCustomer) => {
    setUpdatingCustomerId(customer._id);
    try {
      const updated = await updateOwnerCustomerStatus(customer._id, !customer.isActive);
      setCustomers(current =>
        current.map(item => (item._id === updated._id ? updated : item)),
      );
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Could not update customer status');
    } finally {
      setUpdatingCustomerId('');
    }
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Customers</Text>
          <Text style={styles.subtitle}>Only users registered under your salon.</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{customerStats.total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, {color: Colors.green}]}>{customerStats.active}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, {color: Colors.red}]}>{customerStats.inactive}</Text>
          <Text style={styles.summaryLabel}>Inactive</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor={Colors.grey}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={() => fetchCustomers()}
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(filter => {
          const selected = statusFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              onPress={() => setStatusFilter(filter)}>
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                {filter[0].toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCustomers(true)}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyTitle}>No customers found</Text>
              <Text style={styles.emptySubtitle}>Customers from other salons never appear here.</Text>
            </View>
          }
          renderItem={({item}) => {
            const initials = item.name
              .split(' ')
              .map(word => word[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            const isUpdating = updatingCustomerId === item._id;

            return (
              <View style={styles.customerCard}>
                <View style={styles.customerTopRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials || 'CU'}</Text>
                  </View>
                  <View style={styles.customerMainInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.customerName}>{item.name}</Text>
                      <View style={[styles.statusPill, item.isActive ? styles.statusPillActive : styles.statusPillInactive]}>
                        <Text style={[styles.statusText, item.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.customerMeta}>{item.email}</Text>
                    {item.phone ? <Text style={styles.customerMeta}>📞 {item.phone}</Text> : null}
                  </View>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>{item.totalBookings}</Text>
                    <Text style={styles.metricLabel}>Bookings</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>₹{item.totalSpent}</Text>
                    <Text style={styles.metricLabel}>Spent</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>{item.completedBookings}</Text>
                    <Text style={styles.metricLabel}>Completed</Text>
                  </View>
                </View>

                <View style={styles.footerRow}>
                  <View>
                    <Text style={styles.footerLabel}>Last booking</Text>
                    <Text style={styles.footerValue}>{formatDate(item.lastBookingAt)}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.actionBtn, item.isActive ? styles.deactivateBtn : styles.activateBtn]}
                    onPress={() => toggleCustomerStatus(item)}
                    disabled={isUpdating}>
                    <Text style={[styles.actionBtnText, item.isActive ? styles.deactivateBtnText : styles.activateBtnText]}>
                      {isUpdating ? 'Updating...' : item.isActive ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {fontSize: 18, color: Colors.text, fontWeight: '700'},
  headerCopy: {flex: 1},
  title: {fontSize: 22, fontWeight: '800', color: Colors.text},
  subtitle: {fontSize: 12, color: Colors.textSecondary, marginTop: 2},
  summaryRow: {flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 14},
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  summaryValue: {fontSize: 20, fontWeight: '800', color: Colors.text},
  summaryLabel: {fontSize: 12, color: Colors.textSecondary, marginTop: 4},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 30,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 46,
  },
  searchIcon: {fontSize: 14, marginRight: 8},
  searchInput: {flex: 1, fontSize: 14, color: Colors.text},
  filterRow: {flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 10},
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.white,
  },
  filterChipSelected: {backgroundColor: Colors.primary},
  filterText: {fontSize: 12, color: Colors.textSecondary, fontWeight: '700'},
  filterTextSelected: {color: Colors.white},
  loaderWrap: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  listContent: {paddingHorizontal: 16, paddingBottom: 28},
  emptyState: {alignItems: 'center', marginTop: 72},
  emptyIcon: {fontSize: 52},
  emptyTitle: {fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 12},
  emptySubtitle: {fontSize: 13, color: Colors.textSecondary, marginTop: 6, textAlign: 'center'},
  customerCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 16,
    marginTop: 12,
  },
  customerTopRow: {flexDirection: 'row', alignItems: 'center'},
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {color: Colors.white, fontSize: 16, fontWeight: '800'},
  customerMainInfo: {flex: 1},
  nameRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  customerName: {fontSize: 16, fontWeight: '800', color: Colors.text, flex: 1},
  customerMeta: {fontSize: 12, color: Colors.textSecondary, marginTop: 4},
  statusPill: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14},
  statusPillActive: {backgroundColor: '#DCFCE7'},
  statusPillInactive: {backgroundColor: '#FEE2E2'},
  statusText: {fontSize: 11, fontWeight: '700'},
  statusTextActive: {color: Colors.green},
  statusTextInactive: {color: Colors.red},
  metricsRow: {flexDirection: 'row', gap: 10, marginTop: 16},
  metricBox: {
    flex: 1,
    backgroundColor: '#F7F4FF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  metricValue: {fontSize: 15, fontWeight: '800', color: Colors.text},
  metricLabel: {fontSize: 11, color: Colors.textSecondary, marginTop: 4},
  footerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16},
  footerLabel: {fontSize: 11, color: Colors.textSecondary},
  footerValue: {fontSize: 12, color: Colors.text, fontWeight: '600', marginTop: 4},
  actionBtn: {borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10},
  activateBtn: {backgroundColor: '#DCFCE7'},
  deactivateBtn: {backgroundColor: '#FEE2E2'},
  actionBtnText: {fontSize: 12, fontWeight: '800'},
  activateBtnText: {color: Colors.green},
  deactivateBtnText: {color: Colors.red},
});