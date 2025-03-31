import { useState, useCallback, useEffect } from 'react';
import { Shop, Location, SearchParams } from '../utils/types';
import { searchNearbyDrinkShops, getShopDetails } from '../utils/placesApi';
import usePreferences from './usePreferences';

export default function useShops(location: Location | null) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { preferences, isBlacklisted } = usePreferences();

  // 搜尋附近的飲料店
  const searchShops = useCallback(async (params: SearchParams) => {
    if (!location) {
      setError('沒有位置信息，無法搜尋飲料店');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allShops = await searchNearbyDrinkShops(location, params.radius);
      
      // 過濾黑名單中的店家
      let filteredShops = allShops.filter(shop => !isBlacklisted(shop.id));
      
      // 如果只顯示收藏，進一步過濾
      if (params.showFavoritesOnly) {
        filteredShops = filteredShops.filter(shop => 
          preferences.favorites.includes(shop.id)
        );
      }
      
      // 按距離排序
      filteredShops.sort((a, b) => {
        const distanceA = a.distance || Infinity;
        const distanceB = b.distance || Infinity;
        return distanceA - distanceB;
      });
      
      setShops(filteredShops);
    } catch (err) {
      console.error('搜尋店家錯誤:', err);
      setError('搜尋店家時發生錯誤');
    } finally {
      setLoading(false);
    }
  }, [location, preferences.favorites, isBlacklisted]);

  // 獲取單個店家詳情
  const getShop = useCallback(async (shopId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const shop = await getShopDetails(shopId);
      return shop;
    } catch (err) {
      console.error('獲取店家詳情錯誤:', err);
      setError('獲取店家詳情時發生錯誤');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 當位置或偏好變化時重新獲取數據
  useEffect(() => {
    if (location && shops.length > 0) {
      // 過濾已存在的商店，移除黑名單中的店家
      const filteredShops = shops.filter(shop => !isBlacklisted(shop.id));
      setShops(filteredShops);
    }
  }, [location, preferences.blacklist, isBlacklisted]);

  return {
    shops,
    loading,
    error,
    searchShops,
    getShop
  };
}