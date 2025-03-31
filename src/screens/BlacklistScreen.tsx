import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  FlatList 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import usePreferences from '../hooks/usePreferences';
import { Shop } from '../utils/types';
import { getShopDetails } from '../utils/placesApi';

interface BlacklistedShop {
  id: string;
  name: string;
  address: string;
}

const BlacklistScreen: React.FC = () => {
  const { preferences, loading: prefsLoading, removeFromBlacklist } = usePreferences();
  
  const [blacklistedShops, setBlacklistedShops] = useState<BlacklistedShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 獲取所有黑名單店家的基本信息
  const fetchBlacklistedShops = useCallback(async () => {
    if (prefsLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { blacklist } = preferences;
      
      if (blacklist.length === 0) {
        setBlacklistedShops([]);
        setLoading(false);
        return;
      }
      
      const shopsPromises = blacklist.map(async (shopId) => {
        try {
          const shop = await getShopDetails(shopId);
          return shop ? {
            id: shop.id,
            name: shop.name,
            address: shop.address
          } : null;
        } catch (err) {
          console.error(`獲取店家 ${shopId} 的詳情失敗`, err);
          return null;
        }
      });
      
      const shops = (await Promise.all(shopsPromises)).filter(
        (shop): shop is BlacklistedShop => shop !== null
      );
      
      // 按名稱排序
      shops.sort((a, b) => a.name.localeCompare(b.name));
      
      setBlacklistedShops(shops);
    } catch (err) {
      console.error('獲取黑名單店家失敗', err);
      setError('獲取黑名單店家時發生錯誤');
    } finally {
      setLoading(false);
    }
  }, [preferences, prefsLoading]);
  
  // 每次頁面聚焦時重新加載
  useFocusEffect(
    useCallback(() => {
      fetchBlacklistedShops();
    }, [fetchBlacklistedShops])
  );
  
  // 初始加載
  useEffect(() => {
    fetchBlacklistedShops();
  }, [fetchBlacklistedShops]);
  
  // 處理從黑名單中刪除
  const handleRemoveFromBlacklist = (shop: BlacklistedShop) => {
    Alert.alert(
      '從黑名單移除',
      `確定要將「${shop.name}」從黑名單中移除嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確定', 
          onPress: async () => {
            const success = await removeFromBlacklist(shop.id);
            if (success) {
              // 更新列表
              setBlacklistedShops(prev => 
                prev.filter(item => item.id !== shop.id)
              );
            } else {
              Alert.alert('操作失敗', '無法從黑名單中移除店家');
            }
          }
        }
      ]
    );
  };
  
  // 渲染店家項
  const renderShopItem = ({ item }: { item: BlacklistedShop }) => (
    <View style={styles.shopItem}>
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text style={styles.shopAddress}>{item.address}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromBlacklist(item)}
      >
        <FontAwesome name="times" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
  
  if (loading || prefsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>加載黑名單中...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchBlacklistedShops}
        >
          <Text style={styles.retryButtonText}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (blacklistedShops.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>黑名單中沒有店家</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={blacklistedShops}
        keyExtractor={(item) => item.id}
        renderItem={renderShopItem}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchBlacklistedShops}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  shopItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#E53935',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default BlacklistScreen;