import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Review } from '../utils/types';

interface ReviewItemProps {
  review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  // 格式化日期
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) {
      return '今天';
    } else if (diffInDays < 2) {
      return '昨天';
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks}週前`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months}個月前`;
    }
  };
  
  // 顯示星級評分
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesome key={i} name="star" size={14} color="#FFD700" style={styles.star} />
        );
      } else if (i === fullStars && halfStar) {
        stars.push(
          <FontAwesome key={i} name="star-half-o" size={14} color="#FFD700" style={styles.star} />
        );
      } else {
        stars.push(
          <FontAwesome key={i} name="star-o" size={14} color="#FFD700" style={styles.star} />
        );
      }
    }
    
    return stars;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>{review.author}</Text>
        <Text style={styles.date}>{formatDate(review.time)}</Text>
      </View>
      
      <View style={styles.ratingContainer}>
        {renderStars(review.rating)}
      </View>
      
      <Text style={styles.text}>{review.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  author: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    marginRight: 2,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

export default ReviewItem;