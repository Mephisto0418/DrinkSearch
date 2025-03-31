import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 導入畫面
import MapScreen from './src/screens/MapScreen';
import ShopDetailScreen from './src/screens/ShopDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import BlacklistScreen from './src/screens/BlacklistScreen';

// 定義導航類型
export type RootStackParamList = {
  Map: undefined;
  ShopDetail: { shopId: string };
  Favorites: undefined;
  Blacklist: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Map">
          <Stack.Screen 
            name="Map" 
            component={MapScreen} 
            options={{ title: '飲料店搜尋' }} 
          />
          <Stack.Screen 
            name="ShopDetail" 
            component={ShopDetailScreen} 
            options={{ title: '店家詳情' }}
          />
          <Stack.Screen 
            name="Favorites" 
            component={FavoritesScreen} 
            options={{ title: '我的收藏' }}
          />
          <Stack.Screen 
            name="Blacklist" 
            component={BlacklistScreen} 
            options={{ title: '黑名單' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}