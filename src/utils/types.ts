// 店家信息模型
export interface Shop {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  thumbnail: string;
  rating: number;  // Google 評分
  reviews: Review[];  // Google 評論
  userRating?: number;  // 用戶自定義評分
  hasFoodPanda: boolean;
  foodPandaLink?: string;
  hasUberEats: boolean;
  uberEatsLink?: string;
  distance?: number;  // 與當前位置的距離
}

// 評論模型
export interface Review {
  author: string;
  rating: number;
  text: string;
  time: Date;
}

// 用戶偏好模型
export interface UserPreferences {
  favorites: string[];  // 收藏店家的ID列表
  blacklist: string[];  // 黑名單店家的ID列表
  ratings: {[shopId: string]: number};  // 用戶對店家的評分
}

// 位置模型
export interface Location {
  latitude: number;
  longitude: number;
}

// 搜尋參數
export interface SearchParams {
  radius: number;  // 搜尋半徑，單位：公里
  showFavoritesOnly: boolean;  // 是否只顯示收藏
}