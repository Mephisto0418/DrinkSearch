import React, { useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  initialValue: number;
  onValueChange: (value: number) => void;
  label?: string;
  width?: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  initialValue,
  onValueChange,
  label = '搜尋範圍',
  width = Dimensions.get('window').width - 40,
}) => {
  const [value, setValue] = useState(initialValue);
  const position = new Animated.Value((initialValue - min) / (max - min) * width);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      let newPosition = gestureState.moveX - 20; // 20是邊距
      
      // 限制在範圍內
      if (newPosition < 0) {
        newPosition = 0;
      }
      if (newPosition > width) {
        newPosition = width;
      }
      
      // 計算比例值
      const newValue = min + (newPosition / width) * (max - min);
      
      // 四捨五入到最接近的步長
      const steppedValue = Math.round(newValue / step) * step;
      const steppedPosition = ((steppedValue - min) / (max - min)) * width;
      
      position.setValue(steppedPosition);
      setValue(steppedValue);
      onValueChange(steppedValue);
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}: {value} 公里</Text>
      <View style={[styles.track, { width }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: position,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: position }],
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
      <View style={[styles.labelsContainer, { width }]}>
        <Text style={styles.minLabel}>{min}</Text>
        <Text style={styles.maxLabel}>{max}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0D0D0',
    position: 'relative',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4285F4',
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    position: 'absolute',
    top: -9,
    left: -12, // 補償thumb寬度的一半
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  minLabel: {
    fontSize: 14,
    color: '#666',
  },
  maxLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default RangeSlider;