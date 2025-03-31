import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import usePreferences from '../hooks/usePreferences';
import useLocation from '../hooks/useLocation';
import { Shop } from '../utils/types';
import { getShopDetails } from '../utils/placesApi';
import ShopList from '../components/ShopList';

const FavoritesScreen: React.FC = () => {
  const { preferences, loading: prefsLoading } = usePreferences();
  const { location } = useLocation();
  
  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 獲取所有收藏店家的詳情
  const fetchFavoriteShops = useCallback(async () => {
    if (prefsLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { favorites } = preferences;
      
      if (favorites.length === 0) {
        setFavoriteShops([]);
        setLoading(false);
        return;
      }
      
      const shopsPromises = favorites.map(async (shopId) => {
        try {
          const shop = await getShopDetails(shopId);
          return shop;
        } catch (err) {
          console.error(`獲取店家 ${shopId} 的詳情失敗`, err);
          return null;
        }
      });
      
      const shops = (await Promise.all(shopsPromises)).filter(
        (shop): shop is Shop => shop !== null
      );
      
      // 計算與當前位置的距離
      if (location) {
        shops.sort((a, b) => {
          const distanceA = calculateDistance(
            location.latitude,
            location.longitude,
            a.location.latitude,
            a.location.longitude
          );
          const distanceB = calculateDistance(
            location.latitude,
            location.longitude,
            b.location.latitude,
            b.location.longitude
          );
          
          return distanceA - distanceB;
        });
      }
      
      setFavoriteShops(shops);
    } catch (err) {
      console.error('獲取收藏店家失敗', err);
      setError('獲取收藏店家時發生錯誤');
    } finally {
      setLoading(false);
    }
  }, [preferences, prefsLoading, location]);
  
  // 每次頁面聚焦時重新加載
  useFocusEffect(
    useCallback(() => {
      fetchFavoriteShops();
    }, [fetchFavoriteShops])
  );
  
  // 初始加載
  useEffect(() => {
    fetchFavoriteShops();
  }, [fetchFavoriteShops]);
  
  if (loading || prefsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>加載收藏中...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ShopList
        shops={favoriteShops}
        loading={loading}
        error={error}
        onRefresh={fetchFavoriteShops}
        refreshing={loading}
      />
    </View>
  );
};

// 計算兩點之間的距離（使用Haversine公式）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球半徑，單位：公里
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 四捨五入到小數點後一位
}

// 轉換為弧度
function toRad(value: number): number {
  return value * Math.PI / 180;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default FavoritesScreen;