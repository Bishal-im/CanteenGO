import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { BlurView } from "expo-blur";

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  intensity = 80, 
  borderRadius = 32, 
  style,
  containerStyle
}) => {
  return (
    <View style={[{ borderRadius, overflow: "hidden" }, containerStyle]}>
      <BlurView 
        intensity={intensity} 
        tint="dark" 
        style={[{ padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.03)' }, style]}
      >
        {children}
      </BlurView>
    </View>
  );
};
