import React from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Shop } from '../utils/types';
import ShopCard from './ShopCard';

interface ShopListProps {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  compact?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const ShopList: React.FC<ShopListProps> = ({
  shops,
  loading,
  error,
  compact = false,
  onRefresh,
  refreshing = false
}) => {

  if (loading && !refreshing && shops.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>搜尋中...</Text>
      </View>
    );
  }

  if (error && shops.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (shops.length === 0 && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>沒有找到飲料店</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={shops}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ShopCard shop={item} compact={compact} />}
      contentContainerStyle={styles.listContainer}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ShopList;