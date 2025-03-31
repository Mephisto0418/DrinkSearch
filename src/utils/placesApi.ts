import { Shop, Review, Location } from './types';
import { GOOGLE_MAPS_API_KEY } from '@env';

// Google Maps API密鑰
// 注意：實際應用中應該從環境變量或安全的配置文件獲取API密鑰
// 使用前請替換為您的有效Google Maps API密鑰
const API_KEY = GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
// 可以使用以下方式從環境變量獲取：
// const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

// 從Place API響應中提取評論
const extractReviews = (place: any): Review[] => {
  if (!place.reviews) return [];
  
  return place.reviews.slice(0, 3).map((review: any) => ({
    author: review.author_name,
    rating: review.rating,
    text: review.text,
    time: new Date(review.time * 1000)
  }));
};

// 檢查是否有外送平台鏈接
const checkDeliveryLinks = (place: any) => {
  const website = place.website || '';
  const hasFoodPanda = website.includes('foodpanda') || 
                       (place.url || '').includes('foodpanda');
  const hasUberEats = website.includes('ubereats') || 
                      (place.url || '').includes('ubereats');
  
  return {
    hasFoodPanda,
    foodPandaLink: hasFoodPanda ? 
      (website.includes('foodpanda') ? website : 'https://www.foodpanda.com.tw/') : 
      undefined,
    hasUberEats,
    uberEatsLink: hasUberEats ? 
      (website.includes('ubereats') ? website : 'https://www.ubereats.com/tw') : 
      undefined
  };
};

// 搜尋附近飲料店
export const searchNearbyDrinkShops = async (
  location: Location, 
  radius: number // 公里
): Promise<Shop[]> => {
  try {
    // 轉換為米
    const radiusInMeters = radius * 1000;
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radiusInMeters}&type=cafe&keyword=飲料&language=zh-TW&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('API錯誤:', data.status);
      return [];
    }
    
    // 提取店家信息
    const shops: Shop[] = await Promise.all(
      data.results.map(async (place: any) => {
        // 獲取詳細信息以獲取評論
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,reviews,photos,geometry,vicinity,website,url&language=zh-TW&key=${API_KEY}`
        );
        const detailsData = await detailsResponse.json();
        const details = detailsData.result;
        
        // 提取照片URL
        const photoReference = 
          details.photos && details.photos.length > 0 
            ? details.photos[0].photo_reference 
            : null;
        
        const thumbnail = photoReference 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`
          : 'https://via.placeholder.com/400x200?text=No+Image';
        
        // 計算距離
        const shopLocation = {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        };
        
        const distance = calculateDistance(
          location.latitude, 
          location.longitude, 
          shopLocation.latitude, 
          shopLocation.longitude
        );
        
        // 檢查外送平台鏈接
        const deliveryLinks = checkDeliveryLinks(details);
        
        return {
          id: place.place_id,
          name: place.name,
          location: shopLocation,
          address: place.vicinity,
          thumbnail,
          rating: place.rating || 0,
          reviews: extractReviews(details),
          distance,
          ...deliveryLinks
        };
      })
    );
    
    return shops;
  } catch (error) {
    console.error('搜尋附近飲料店失敗', error);
    return [];
  }
};

// 獲取店家詳情
export const getShopDetails = async (shopId: string): Promise<Shop | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shopId}&fields=name,rating,reviews,photos,geometry,vicinity,website,url&language=zh-TW&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('API錯誤:', data.status);
      return null;
    }
    
    const place = data.result;
    
    // 提取照片URL
    const photoReference = 
      place.photos && place.photos.length > 0 
        ? place.photos[0].photo_reference 
        : null;
    
    const thumbnail = photoReference 
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`
      : 'https://via.placeholder.com/400x200?text=No+Image';
    
    // 檢查外送平台鏈接
    const deliveryLinks = checkDeliveryLinks(place);
    
    return {
      id: shopId,
      name: place.name,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      address: place.vicinity,
      thumbnail,
      rating: place.rating || 0,
      reviews: extractReviews(place),
      ...deliveryLinks
    };
  } catch (error) {
    console.error('獲取店家詳情失敗', error);
    return null;
  }
};

// 計算兩點之間的距離（使用Haversine公式）
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
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