import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text,
  Switch,
  Animated,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import useLocation from '../hooks/useLocation';
import useShops from '../hooks/useShops';
import usePreferences from '../hooks/usePreferences';
import RangeSlider from '../components/RangeSlider';
import ShopList from '../components/ShopList';
import { SearchParams } from '../utils/types';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  
  const { location, errorMsg, loading: locationLoading, refreshLocation } = useLocation();
  const { preferences } = usePreferences();
  
  const [searchParams, setSearchParams] = useState<SearchParams>({
    radius: 10, // 默認10公里
    showFavoritesOnly: false
  });
  
  const { shops, loading: shopsLoading, error, searchShops } = useShops(location);
  
  const [listVisible, setListVisible] = useState(false);
  const listAnimation = useRef(new Animated.Value(0)).current;
  
  // 當位置變化時，更新地圖區域
  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      const region: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      };
      
      mapRef.current?.animateToRegion(region);
    }
  }, [location]);
  
  // 當位置獲取完成或搜尋參數變化時，搜尋店家
  useEffect(() => {
    if (location) {
      searchShops(searchParams);
    }
  }, [location, searchParams, searchShops]);
  
  // 切換列表視圖
  const toggleListView = () => {
    const toValue = listVisible ? 0 : 1;
    
    Animated.timing(listAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    setListVisible(!listVisible);
  };
  
  // 列表區域的高度
  const listHeight = height * 0.6;
  
  // 列表區域的動畫樣式
  const listTranslateY = listAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [listHeight, 0]
  });
  
  // 當店家標記被點擊時
  const handleMarkerPress = (shopId: string) => {
    navigation.navigate('ShopDetail', { shopId });
  };
  
  // 移動到當前位置
  const goToCurrentLocation = () => {
    if (location && mapRef.current) {
      const region: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      };
      
      mapRef.current.animateToRegion(region);
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 地圖 */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        rotateEnabled={true}
        initialRegion={
          location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          } : undefined
        }
      >
        {shops && shops.length > 0 ? (
          shops.map(shop => (
          <Marker
            key={shop.id}
            coordinate={{
              latitude: shop.location.latitude,
              longitude: shop.location.longitude
            }}
            title={shop.name}
            description={`${shop.rating}⭐ · ${shop.distance}公里`}
            onCalloutPress={() => handleMarkerPress(shop.id)}
          />
        ))}
      </MapView>
      
      {/* 頂部控制欄 */}
      <View style={[styles.topControls, { marginTop: insets.top }]}>
        <View style={styles.searchBar}>
          <Text style={styles.title}>飲料店搜尋</Text>
          <View style={styles.filtersRow}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>只顯示收藏</Text>
              <Switch
                value={searchParams.showFavoritesOnly}
                onValueChange={(value) => 
                  setSearchParams(prev => ({ ...prev, showFavoritesOnly: value }))
                }
                trackColor={{ false: '#D0D0D0', true: '#4285F4' }}
                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : ''}
              />
            </View>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Favorites')}
            >
              <FontAwesome name="heart" size={20} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Blacklist')}
            >
              <FontAwesome name="ban" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* 底部控制欄 */}
      <View style={[styles.bottomControls, { marginBottom: insets.bottom }]}>
        <RangeSlider
          min={5}
          max={25}
          step={1}
          initialValue={searchParams.radius}
          onValueChange={(value) => 
            setSearchParams(prev => ({ ...prev, radius: value }))
          }
          label="搜尋範圍"
        />
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.listButton}
            onPress={toggleListView}
          >
            <FontAwesome name="list" size={20} color="#FFF" />
            <Text style={styles.buttonText}>店家列表</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 當前位置按鈕 */}
      <TouchableOpacity 
        style={[styles.locationButton, { bottom: insets.bottom + 80 }]}
        onPress={goToCurrentLocation}
      >
        <FontAwesome name="location-arrow" size={22} color="#4285F4" />
      </TouchableOpacity>
      
      {/* 店家列表 */}
      <Animated.View 
        style={[
          styles.listContainer,
          { height: listHeight, transform: [{ translateY: listTranslateY }] }
        ]}
      >
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            附近飲料店 ({shops.length})
          </Text>
          <TouchableOpacity onPress={toggleListView}>
            <FontAwesome name="chevron-down" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        <ShopList 
          shops={shops}
          loading={shopsLoading}
          error={error}
          compact={true}
          onRefresh={() => {
            refreshLocation();
            if (location) {
              searchShops(searchParams);
            }
          }}
          refreshing={locationLoading || shopsLoading}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 16,
  },
  settingsButton: {
    padding: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  listButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MapScreen;