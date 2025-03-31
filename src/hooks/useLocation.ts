import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Location as LocationType } from '../utils/types';

export default function useLocation() {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 請求位置權限並獲取當前位置
  const getLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('請允許應用程式獲取位置權限以顯示附近的飲料店');
        setLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      setErrorMsg('無法獲取您的位置');
      console.error('獲取位置錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加載時獲取位置
  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    errorMsg,
    loading,
    refreshLocation: getLocation
  };
}