import { useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '../utils/types';
import * as Storage from '../utils/storage';

export default function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    favorites: [],
    blacklist: [],
    ratings: {}
  });
  const [loading, setLoading] = useState(true);

  // 加載用戶偏好
  const loadPreferences = useCallback(async () => {
    setLoading(true);
    const prefs = await Storage.getUserPreferences();
    setPreferences(prefs);
    setLoading(false);
  }, []);

  // 初始加載
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // 檢查店家是否在收藏列表中
  const isFavorite = useCallback((shopId: string) => {
    return preferences.favorites.includes(shopId);
  }, [preferences.favorites]);

  // 檢查店家是否在黑名單中
  const isBlacklisted = useCallback((shopId: string) => {
    return preferences.blacklist.includes(shopId);
  }, [preferences.blacklist]);

  // 獲取店家評分
  const getShopRating = useCallback((shopId: string) => {
    return preferences.ratings[shopId] || 0;
  }, [preferences.ratings]);

  // 添加到收藏
  const addToFavorites = useCallback(async (shopId: string) => {
    const success = await Storage.addToFavorites(shopId);
    if (success) {
      setPreferences(prev => ({
        ...prev,
        favorites: [...prev.favorites, shopId]
      }));
    }
    return success;
  }, []);

  // 從收藏中移除
  const removeFromFavorites = useCallback(async (shopId: string) => {
    const success = await Storage.removeFromFavorites(shopId);
    if (success) {
      setPreferences(prev => ({
        ...prev,
        favorites: prev.favorites.filter(id => id !== shopId)
      }));
    }
    return success;
  }, []);

  // 添加到黑名單
  const addToBlacklist = useCallback(async (shopId: string) => {
    const success = await Storage.addToBlacklist(shopId);
    if (success) {
      setPreferences(prev => ({
        ...prev,
        blacklist: [...prev.blacklist, shopId],
        // 如果在收藏中，也移除
        favorites: prev.favorites.filter(id => id !== shopId)
      }));
    }
    return success;
  }, []);

  // 從黑名單中移除
  const removeFromBlacklist = useCallback(async (shopId: string) => {
    const success = await Storage.removeFromBlacklist(shopId);
    if (success) {
      setPreferences(prev => ({
        ...prev,
        blacklist: prev.blacklist.filter(id => id !== shopId)
      }));
    }
    return success;
  }, []);

  // 更新店家評分
  const updateShopRating = useCallback(async (shopId: string, rating: number) => {
    const success = await Storage.updateShopRating(shopId, rating);
    if (success) {
      setPreferences(prev => ({
        ...prev,
        ratings: {
          ...prev.ratings,
          [shopId]: rating
        }
      }));
    }
    return success;
  }, []);

  // 切換收藏狀態
  const toggleFavorite = useCallback(async (shopId: string) => {
    if (isFavorite(shopId)) {
      return removeFromFavorites(shopId);
    } else {
      return addToFavorites(shopId);
    }
  }, [isFavorite, removeFromFavorites, addToFavorites]);

  // 切換黑名單狀態
  const toggleBlacklist = useCallback(async (shopId: string) => {
    if (isBlacklisted(shopId)) {
      return removeFromBlacklist(shopId);
    } else {
      return addToBlacklist(shopId);
    }
  }, [isBlacklisted, removeFromBlacklist, addToBlacklist]);

  return {
    preferences,
    loading,
    isFavorite,
    isBlacklisted,
    getShopRating,
    toggleFavorite,
    toggleBlacklist,
    updateShopRating,
    refreshPreferences: loadPreferences
  };
}