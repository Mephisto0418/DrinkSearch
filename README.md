# 飲料店搜尋 App

這是一個基於 React Native 和 Google Maps API 開發的飲料店搜尋應用，讓用戶可以快速找到附近的飲料店，查看評分和評論，並管理自己的收藏和黑名單。

## 主要功能

1. 透過 Google Maps 查詢位置周遭指定範圍（5-25 公里）內的飲料店
2. 顯示每個店家的縮圖、評分和最近三則評論
3. 自定義收藏和黑名單功能
4. 為店家添加個人評分（僅在應用內顯示）
5. 支持過濾黑名單店家
6. 提供「只看收藏」模式
7. 整合 FoodPanda 和 UberEats 的跳轉連結（如果店家有這些服務）

## 技術架構

- **框架**: React Native + Expo
- **導航**: React Navigation
- **地圖服務**: Google Maps API + React Native Maps
- **狀態管理**: React Hooks
- **本地存儲**: AsyncStorage
- **UI 組件**: 自定義組件 + FontAwesome 圖標

## 開始使用

### 前提條件

- Node.js (>= 14.0.0)
- npm 或 yarn
- Expo CLI (`npm install -g expo-cli`)
- Google Maps API 密鑰 (帶有 Places API 和 Maps SDK 權限)

### 安裝

1. 克隆代碼庫：

```
git clone https://github.com/yourusername/drink-search.git
cd drink-search
```

2. 安裝依賴：

```
npm install
# 或
yarn install
```

3. 配置環境：

   a. 創建 `.env` 文件在項目根目錄下：
   
   ```
   GOOGLE_MAPS_API_KEY=你的Google_Maps_API密鑰
   ```
   
   b. 在 `app.json` 中配置你的 Google Maps API 密鑰：
   
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
       }
     }
   },
   "ios": {
     "config": {
       "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
     }
   }
   ```

4. 啟動應用：

```
expo start
# 或
npm start
# 或
yarn start
```

5. 使用 Expo Go 應用掃描二維碼在實機上測試，或使用模擬器。

### 必須資源

在啟動應用之前，請確保 `src/assets` 目錄中包含以下資源文件：

- icon.png - 應用圖標
- splash.png - 啟動畫面
- adaptive-icon.png - Android 自適應圖標
- favicon.png - Web 端圖標

## 螢幕截圖

_螢幕截圖將在應用完成後添加_

## 應用架構

### 目錄結構

```
src/
  ├── assets/         # 圖像和靜態資源
  ├── components/     # 可複用的 UI 組件
  ├── hooks/          # 自定義 React Hooks
  ├── screens/        # 應用程序的主要畫面
  └── utils/          # 輔助函數和 API 調用
```

### 主要畫面

- **MapScreen**: 主畫面，顯示地圖和附近的飲料店
- **ShopDetailScreen**: 店家詳情，包括評論、評分和操作選項
- **FavoritesScreen**: 收藏的店家列表
- **BlacklistScreen**: 黑名單店家列表

## 開發注意事項

1. 請確保 Google Maps API 密鑰已啟用以下服務：
   - Places API
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API

2. 在開發過程中，您可能需要按照以下命令安裝特定平台相關的依賴：
   ```
   expo install expo-location
   expo install react-native-maps
   ```

3. 對於真機測試，請確保設備已開啟位置服務並允許應用程序訪問。

## 注意事項

- 此應用需要地理位置權限才能正常工作
- 需要有效的 Google Maps API 密鑰
- 外送平台鏈接需要在手機上安裝相應的應用程序才能正常跳轉