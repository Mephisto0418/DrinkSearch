# 飲料店搜尋 App - 構建指南

## 已修正的錯誤

1. **TypeScript 配置錯誤**
   - 移除了 `extends: "expo/tsconfig.base"` 並添加了必要的編譯器選項
   - 添加了 `exclude` 部分以排除不需要檢查的文件

2. **資源文件缺失**
   - 在 `src/assets` 目錄中創建了基本的圖像資源：
     - icon.png
     - splash.png
     - adaptive-icon.png
     - favicon.png

3. **環境變量配置**
   - 添加了 `.env` 文件用於存儲 API 密鑰
   - 添加了 `react-native-dotenv` 包以支持環境變量
   - 修改了 `placesApi.ts` 以使用環境變量中的 API 密鑰
   - 添加了環境變量類型聲明文件 `env.d.ts`

4. **構建配置**
   - 添加了 `babel.config.js` 支持環境變量
   - 添加了 `metro.config.js` 支持 Metro 打包器
   - 添加了 `app.config.js` 動態配置 Expo 應用
   - 添加了 `eas.json` 用於 EAS 構建配置

5. **依賴版本衝突**
   - 修改了 `styled-components` 的版本從 ^6.1.0 降至 ^5.3.10
   - 添加了 `react-dom` 18.2.0 以避免版本衝突
   - 添加了 `@types/styled-components` 支持 TypeScript 類型

6. **測試配置**
   - 添加了 Jest 配置文件和模擬環境變量

## 構建 APK 步驟

以下是使用 Expo Application Services (EAS) 構建 APK 的完整步驟：

### 前提條件

1. 一個 Expo 帳戶 (可在 https://expo.dev 註冊)
2. 已安裝 Node.js 和 npm
3. 已安裝 EAS CLI：`npm install -g eas-cli`

### 步驟 1: 設置 Google Maps API 密鑰

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建一個項目並啟用以下 API：
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
3. 創建一個 API 密鑰
4. 在 `.env` 文件中添加您的 API 密鑰：
   ```
   GOOGLE_MAPS_API_KEY=你的API密鑰
   ```

### 步驟 2: 登錄到 Expo

```
eas login
```

### 步驟 3: 配置項目

1. 確保 `app.config.js` 和 `eas.json` 中的配置正確
2. 在 `eas.json` 中更新 `GOOGLE_MAPS_API_KEY` 為您的實際 API 密鑰
3. 在 `app.config.js` 中更新 `bundleIdentifier` 和 `package` 為您的應用包名

### 步驟 4: 初始化 EAS 項目

```
eas build:configure
```

### 步驟 5: 構建開發版 APK

```
eas build -p android --profile preview
```

這將啟動構建過程並在 Expo 雲端構建 APK。完成後，您可以從提供的鏈接下載 APK。

### 步驟 6: 安裝和測試 APK

1. 在 Android 設備上下載 APK
2. 安裝並測試應用功能

### 常見問題

1. **構建失敗**
   - 檢查構建日誌查看具體錯誤
   - 確保所有依賴都正確安裝
   - 確保 API 密鑰正確設置

2. **地圖不顯示**
   - 確保 Google Maps API 密鑰正確
   - 確保啟用了正確的 API 服務
   - 檢查 Android 設備是否允許位置權限

3. **環境變量問題**
   - 確保 `.env` 文件格式正確
   - 確保 `babel.config.js` 正確配置了環境變量插件

## 本地開發測試

要在本地測試應用：

```
npm install
npx expo start
```

使用 Expo Go 應用掃描二維碼在您的設備上運行應用。

## 使用 Expo Dev Client 測試

如果需要更多原生功能，可以使用 Expo Dev Client：

```
eas build --profile development --platform android
```

這將創建一個帶有開發客戶端的 APK，您可以在設備上安裝並連接到本地開發服務器。