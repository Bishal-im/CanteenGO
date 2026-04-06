import React, { useEffect } from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  useSharedValue 
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonPulse: React.FC<SkeletonProps> = ({ 
  width = "100%", 
  height = 20, 
  borderRadius = 8, 
  style 
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        { 
          width: width as any, 
          height: height as any, 
          borderRadius, 
          backgroundColor: "#1a1a1a"
        } as any, 
        animatedStyle, 
        style
      ]} 
    />
  );
};
