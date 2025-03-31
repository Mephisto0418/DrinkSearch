import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from './types';

// 存儲鍵
const FAVORITES_KEY = '@drink_search:favorites';
const BLACKLIST_KEY = '@drink_search:blacklist';
const RATINGS_KEY = '@drink_search:ratings';

// 初始用戶偏好
const initialPreferences: UserPreferences = {
  favorites: [],
  blacklist: [],
  ratings: {}
};

// 獲取用戶偏好
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const favoritesStr = await AsyncStorage.getItem(FAVORITES_KEY);
    const blacklistStr = await AsyncStorage.getItem(BLACKLIST_KEY);
    const ratingsStr = await AsyncStorage.getItem(RATINGS_KEY);

    return {
      favorites: favoritesStr ? JSON.parse(favoritesStr) : [],
      blacklist: blacklistStr ? JSON.parse(blacklistStr) : [],
      ratings: ratingsStr ? JSON.parse(ratingsStr) : {}
    };
  } catch (error) {
    console.error('獲取用戶偏好失敗', error);
    return initialPreferences;
  }
};

// 更新收藏列表
export const updateFavorites = async (favorites: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('更新收藏列表失敗', error);
  }
};

// 更新黑名單
export const updateBlacklist = async (blacklist: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(BLACKLIST_KEY, JSON.stringify(blacklist));
  } catch (error) {
    console.error('更新黑名單失敗', error);
  }
};

// 更新評分
export const updateRatings = async (ratings: {[shopId: string]: number}): Promise<void> => {
  try {
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch (error) {
    console.error('更新評分失敗', error);
  }
};

// 添加到收藏
export const addToFavorites = async (shopId: string): Promise<boolean> => {
  try {
    const prefs = await getUserPreferences();
    
    // 檢查是否已在收藏中
    if (prefs.favorites.includes(shopId)) {
      return false;
    }
    
    // 添加到收藏
    const updatedFavorites = [...prefs.favorites, shopId];
    await updateFavorites(updatedFavorites);
    return true;
  } catch (error) {
    console.error('添加到收藏失敗', error);
    return false;
  }
};

// 從收藏中移除
export const removeFromFavorites = async (shopId: string): Promise<boolean> => {
  try {
    const prefs = await getUserPreferences();
    
    // 過濾掉指定ID
    const updatedFavorites = prefs.favorites.filter(id => id !== shopId);
    await updateFavorites(updatedFavorites);
    return true;
  } catch (error) {
    console.error('從收藏中移除失敗', error);
    return false;
  }
};

// 添加到黑名單
export const addToBlacklist = async (shopId: string): Promise<boolean> => {
  try {
    const prefs = await getUserPreferences();
    
    // 檢查是否已在黑名單中
    if (prefs.blacklist.includes(shopId)) {
      return false;
    }
    
    // 添加到黑名單
    const updatedBlacklist = [...prefs.blacklist, shopId];
    await updateBlacklist(updatedBlacklist);
    
    // 如果在收藏中，從收藏中移除
    if (prefs.favorites.includes(shopId)) {
      await removeFromFavorites(shopId);
    }
    
    return true;
  } catch (error) {
    console.error('添加到黑名單失敗', error);
    return false;
  }
};

// 從黑名單中移除
export const removeFromBlacklist = async (shopId: string): Promise<boolean> => {
  try {
    const prefs = await getUserPreferences();
    
    // 過濾掉指定ID
    const updatedBlacklist = prefs.blacklist.filter(id => id !== shopId);
    await updateBlacklist(updatedBlacklist);
    return true;
  } catch (error) {
    console.error('從黑名單中移除失敗', error);
    return false;
  }
};

// 更新店家評分
export const updateShopRating = async (shopId: string, rating: number): Promise<boolean> => {
  try {
    const prefs = await getUserPreferences();
    
    // 更新評分
    const updatedRatings = {
      ...prefs.ratings,
      [shopId]: rating
    };
    
    await updateRatings(updatedRatings);
    return true;
  } catch (error) {
    console.error('更新店家評分失敗', error);
    return false;
  }
};