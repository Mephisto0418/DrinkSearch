import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Shop } from '../utils/types';
import { RootStackParamList } from '../../App';
import usePreferences from '../hooks/usePreferences';

type ShopCardNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

interface ShopCardProps {
  shop: Shop;
  compact?: boolean;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, compact = false }) => {
  const navigation = useNavigation<ShopCardNavigationProp>();
  const { isFavorite, isBlacklisted, getShopRating } = usePreferences();
  
  const userRating = getShopRating(shop.id);
  
  const handlePress = () => {
    navigation.navigate('ShopDetail', { shopId: shop.id });
  };
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: shop.thumbnail }} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{shop.name}</Text>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color="#FFD700" />
            <Text style={styles.compactRating}>
              {shop.rating.toFixed(1)} · {shop.distance}公里
            </Text>
            {isFavorite(shop.id) && (
              <FontAwesome name="heart" size={14} color="#FF6B6B" style={styles.icon} />
            )}
            {userRating > 0 && (
              <View style={styles.userRatingBadge}>
                <Text style={styles.userRatingText}>{userRating}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: shop.thumbnail }} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
          <View style={styles.badgeContainer}>
            {isFavorite(shop.id) && (
              <FontAwesome name="heart" size={16} color="#FF6B6B" style={styles.icon} />
            )}
            {isBlacklisted(shop.id) && (
              <FontAwesome name="ban" size={16} color="#888" style={styles.icon} />
            )}
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{shop.rating.toFixed(1)}</Text>
            {userRating > 0 && (
              <View style={styles.userRatingContainer}>
                <Text style={styles.userRatingLabel}>我的評分:</Text>
                <View style={styles.userRatingBadge}>
                  <Text style={styles.userRatingText}>{userRating}</Text>
                </View>
              </View>
            )}
          </View>
          <Text style={styles.distance}>{shop.distance}公里</Text>
        </View>
        
        <Text style={styles.address} numberOfLines={1}>{shop.address}</Text>
        
        <View style={styles.deliveryContainer}>
          {shop.hasFoodPanda && (
            <TouchableOpacity 
              style={[styles.deliveryButton, styles.foodpandaButton]}
              onPress={() => Linking.openURL(shop.foodPandaLink || 'https://www.foodpanda.com.tw/')}
            >
              <Text style={styles.deliveryButtonText}>foodpanda</Text>
            </TouchableOpacity>
          )}
          {shop.hasUberEats && (
            <TouchableOpacity 
              style={[styles.deliveryButton, styles.uberEatsButton]}
              onPress={() => Linking.openURL(shop.uberEatsLink || 'https://www.ubereats.com/tw')}
            >
              <Text style={styles.deliveryButtonText}>UberEats</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
  },
  userRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  userRatingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  userRatingBadge: {
    backgroundColor: '#5C6BC0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  userRatingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  deliveryContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  deliveryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
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
    fontSize: 12,
  },
  // 精簡模式樣式
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  compactImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
  },
  compactInfo: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  compactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  compactRating: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default ShopCard;