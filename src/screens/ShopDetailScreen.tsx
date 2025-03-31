import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { AirbnbRating } from 'react-native-ratings';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RootStackParamList } from '../../App';
import { getShopDetails } from '../utils/placesApi';
import { Shop } from '../utils/types';
import usePreferences from '../hooks/usePreferences';
import ReviewItem from '../components/ReviewItem';

type ShopDetailScreenRouteProp = RouteProp<RootStackParamList, 'ShopDetail'>;
type ShopDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ShopDetail'>;

const ShopDetailScreen: React.FC = () => {
  const route = useRoute<ShopDetailScreenRouteProp>();
  const navigation = useNavigation<ShopDetailScreenNavigationProp>();
  const { shopId } = route.params;
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isFavorite, 
    isBlacklisted, 
    getShopRating,
    toggleFavorite, 
    toggleBlacklist, 
    updateShopRating 
  } = usePreferences();
  
  // 加載店家詳情
  useEffect(() => {
    const fetchShopDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const shopDetails = await getShopDetails(shopId);
        if (shopDetails) {
          setShop(shopDetails);
          
          // 設置導航標題
          navigation.setOptions({ title: shopDetails.name });
        } else {
          setError('無法獲取店家詳情');
        }
      } catch (err) {
        console.error('獲取店家詳情失敗', err);
        setError('獲取店家詳情時發生錯誤');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopDetails();
  }, [shopId, navigation]);
  
  // 獲取用戶評分
  const userRating = shop ? getShopRating(shop.id) : 0;
  
  // 處理收藏切換
  const handleFavoriteToggle = async () => {
    if (!shop) return;
    
    const success = await toggleFavorite(shop.id);
    if (!success) {
      Alert.alert('操作失敗', '更新收藏狀態時發生錯誤');
    }
  };
  
  // 處理黑名單切換
  const handleBlacklistToggle = async () => {
    if (!shop) return;
    
    // 如果要加入黑名單，顯示確認對話框
    if (!isBlacklisted(shop.id)) {
      Alert.alert(
        '加入黑名單',
        `確定要將 "${shop.name}" 加入黑名單嗎？加入後將不會在搜尋結果中顯示此店家。`,
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '確定', 
            style: 'destructive',
            onPress: async () => {
              const success = await toggleBlacklist(shop.id);
              if (!success) {
                Alert.alert('操作失敗', '更新黑名單時發生錯誤');
              }
            }
          }
        ]
      );
    } else {
      // 從黑名單移除
      const success = await toggleBlacklist(shop.id);
      if (!success) {
        Alert.alert('操作失敗', '更新黑名單時發生錯誤');
      }
    }
  };
  
  // 處理評分變化
  const handleRatingChange = async (rating: number) => {
    if (!shop) return;
    
    const success = await updateShopRating(shop.id, rating);
    if (!success) {
      Alert.alert('操作失敗', '更新評分時發生錯誤');
    }
  };
  
  // 打開外送平台
  const openDeliveryApp = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('無法打開URL', err);
      Alert.alert('錯誤', '無法打開外送平台連結');
    });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>加載中...</Text>
      </View>
    );
  }
  
  if (error || !shop) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-circle" size={48} color="#E53935" />
        <Text style={styles.errorText}>{error || '無法加載店家資訊'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: shop.thumbnail }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{shop.name}</Text>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={18} color="#FFD700" />
            <Text style={styles.rating}>{shop.rating.toFixed(1)}</Text>
          </View>
        </View>
        
        <Text style={styles.address}>{shop.address}</Text>
        
        {/* 用戶評分區塊 */}
        <View style={styles.userRatingContainer}>
          <Text style={styles.sectionTitle}>我的評分</Text>
          <AirbnbRating
            count={5}
            defaultRating={userRating}
            size={30}
            showRating={false}
            onFinishRating={handleRatingChange}
          />
        </View>
        
        {/* 地圖區塊 */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: shop.location.latitude,
              longitude: shop.location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: shop.location.latitude,
                longitude: shop.location.longitude
              }}
              title={shop.name}
            />
          </MapView>
        </View>
        
        {/* 外送平台區塊 */}
        {(shop.hasFoodPanda || shop.hasUberEats) && (
          <View style={styles.deliveryContainer}>
            <Text style={styles.sectionTitle}>外送平台</Text>
            <View style={styles.deliveryButtons}>
              {shop.hasFoodPanda && (
                <TouchableOpacity 
                  style={[styles.deliveryButton, styles.foodpandaButton]}
                  onPress={() => openDeliveryApp(shop.foodPandaLink || 'https://www.foodpanda.com.tw/')}
                >
                  <Text style={styles.deliveryButtonText}>foodpanda</Text>
                </TouchableOpacity>
              )}
              {shop.hasUberEats && (
                <TouchableOpacity 
                  style={[styles.deliveryButton, styles.uberEatsButton]}
                  onPress={() => openDeliveryApp(shop.uberEatsLink || 'https://www.ubereats.com/tw')}
                >
                  <Text style={styles.deliveryButtonText}>UberEats</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {/* 功能按鈕 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              isFavorite(shop.id) ? styles.activeActionButton : {}
            ]}
            onPress={handleFavoriteToggle}
          >
            <FontAwesome 
              name={isFavorite(shop.id) ? "heart" : "heart-o"} 
              size={20} 
              color={isFavorite(shop.id) ? "#FFF" : "#444"}
            />
            <Text 
              style={[
                styles.actionButtonText,
                isFavorite(shop.id) ? styles.activeActionButtonText : {}
              ]}
            >
              {isFavorite(shop.id) ? '已收藏' : '收藏'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              isBlacklisted(shop.id) ? styles.blacklistActiveButton : {}
            ]}
            onPress={handleBlacklistToggle}
          >
            <FontAwesome 
              name="ban" 
              size={20} 
              color={isBlacklisted(shop.id) ? "#FFF" : "#444"}
            />
            <Text 
              style={[
                styles.actionButtonText,
                isBlacklisted(shop.id) ? styles.activeActionButtonText : {}
              ]}
            >
              {isBlacklisted(shop.id) ? '已加入黑名單' : '加入黑名單'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 評論區塊 */}
        {shop.reviews.length > 0 ? (
          <View style={styles.reviewsContainer}>
            <Text style={styles.sectionTitle}>最近評論</Text>
            {shop.reviews.map((review, index) => (
              <ReviewItem key={index} review={review} />
            ))}
          </View>
        ) : (
          <View style={styles.noReviewsContainer}>
            <Text style={styles.noReviewsText}>暫無評論</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  userRatingContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  map: {
    height: 200,
  },
  deliveryContainer: {
    marginBottom: 20,
  },
  deliveryButtons: {
    flexDirection: 'row',
  },
  deliveryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodpandaButton: {
    backgroundColor: '#D70F64',
  },
  uberEatsButton: {
    backgroundColor: '#06C167',
  },
  deliveryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  activeActionButton: {
    backgroundColor: '#4285F4',
  },
  blacklistActiveButton: {
    backgroundColor: '#E53935',
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#444',
  },
  activeActionButtonText: {
    color: 'white',
  },
  reviewsContainer: {
    marginBottom: 20,
  },
  noReviewsContainer: {
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  noReviewsText: {
    color: '#666',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShopDetailScreen;