import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { Coffee, ShieldCheck, User, ArrowRight, LayoutDashboard, Utensils } from "lucide-react-native";
import { useEffect, useState } from "react";
import Animated, { 
  FadeInDown, 
  BounceIn, 
  FadeInUp, 
  FadeInLeft, 
  FadeInRight,
  SlideInLeft,
  SlideInRight,
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { supabase } from "../lib/supabase";

const AnimatedCoffee = () => {
  const roamX = useSharedValue(0);
  const roamY = useSharedValue(0);
  const roamRotate = useSharedValue(0);
  const jumpScale = useSharedValue(1);
  const steamOpacity = useSharedValue(0);
  const steamY = useSharedValue(-10);

  useEffect(() => {
    // 1. Start Roaming (More prominent)
    roamX.value = withRepeat(
      withSequence(withTiming(-12, { duration: 400 }), withTiming(12, { duration: 800 }), withTiming(0, { duration: 400 })),
      -1, true
    );
    roamY.value = withRepeat(
      withSequence(withTiming(-8, { duration: 500 }), withTiming(8, { duration: 1000 }), withTiming(0, { duration: 500 })),
      -1, true
    );
    roamRotate.value = withRepeat(
      withSequence(withTiming(-20, { duration: 600 }), withTiming(20, { duration: 1200 }), withTiming(0, { duration: 600 })),
      -1, true
    );

    // 2. Trigger Jump after 1.8s
    setTimeout(() => {
      // Clear roaming and jump
      roamX.value = withSpring(0);
      roamY.value = withSpring(0);
      roamRotate.value = withSpring(0);
      jumpScale.value = withSequence(
        withSpring(1.4, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );

      // 3. Vaporation entry after landing
      steamOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
      steamY.value = withDelay(400, withSpring(0, { damping: 10 }));
    }, 1800);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: roamX.value },
      { translateY: roamY.value },
      { rotate: `${roamRotate.value}deg` },
      { scale: jumpScale.value }
    ]
  }));

  const steamStyle = useAnimatedStyle(() => ({
    opacity: steamOpacity.value,
    transform: [{ translateY: steamY.value }]
  }));

  return (
    <View className="items-center justify-center w-20 h-20">
      <Animated.View style={animatedStyle}>
        {/* Steam Layer */}
        <Animated.View style={[steamStyle, { flexDirection: 'row', gap: 4, position: 'absolute', top: -14, left: 4 }]}>
          {[1, 2, 3].map(i => (
            <View key={i} className="w-[2px] h-[7px] bg-primary rounded-full opacity-80" />
          ))}
        </Animated.View>
        
        {/* Cup Vessel */}
        <View className="flex-row items-center mt-2">
          <View className="w-[26px] h-[22px] border-[2.5px] border-primary rounded-b-xl" />
          <View className="w-[7px] h-[12px] border-[2.5px] border-primary rounded-r-md border-l-0 -ml-[1px]" />
        </View>
      </Animated.View>
    </View>
  );
};

import { useAuth } from "../context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, session } = useAuth();

  const navigateToRole = (role: 'customer' | 'admin') => {
    if (user) {
      if (role === 'admin') router.push("/(admin)");
      else router.push("/(tabs)");
    } else {
      router.push({ pathname: "/login", params: { intent: role } });
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 pt-24">
      <View className="mb-12 items-center">
        <View className="w-20 h-20 rounded-[28px] bg-white/5 items-center justify-center mb-6 shadow-2xl shadow-primary/20 border border-primary/20 rotate-3">
          <AnimatedCoffee />
        </View>
        <Text className="text-5xl font-black text-white tracking-tighter italic">CanteenGo</Text>
        <View className="h-2 w-20 bg-primary rounded-full mt-1 rotate-1" />
        <Text className="text-gray-500 font-bold uppercase tracking-[4px] text-[10px] mt-4">
          Premium Campus Dining
        </Text>
      </View>

      <View className="space-y-8 pb-12">
        {/* Student Portal Card */}
        <TouchableOpacity 
          onPress={() => navigateToRole('customer')}
          className="p-8 rounded-5xl bg-card border border-primary/20 shadow-2xl relative overflow-hidden"
          activeOpacity={0.9}
        >
          <View className="absolute -right-8 -top-8 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <View className="absolute -left-12 -bottom-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          
          <View className="flex-row justify-between items-start mb-8">
            <View className="w-16 h-16 rounded-3xl bg-white/5 items-center justify-center border border-primary/20 shadow-2xl shadow-primary/10">
              <Utensils size={32} color="#ff6b00" strokeWidth={2.5} />
            </View>
            <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-primary/10">
              <ArrowRight size={20} color="#ff6b00" />
            </View>
          </View>
          
          <Text className="text-3xl font-black text-white mb-3 tracking-tight">I'm a Student</Text>
          <Text className="text-gray-400 font-medium leading-6 text-sm">
            Skip the long queues. Browse delicious menus and pre-order your meals instantly.
          </Text>
          
          <View className="mt-12 flex-row items-center gap-4">
            <View className="px-8 py-4 rounded-full bg-primary shadow-2xl shadow-primary/60 rotate-2">
              <Text className="text-[14px] font-black text-black uppercase tracking-[2px]">Order Now</Text>
            </View>
            <TouchableOpacity className="px-6 py-4 rounded-full bg-white/5 border border-white/10">
              <Text className="text-[12px] font-black text-gray-400 uppercase tracking-[2px]">Hungry?</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Admin Portal Card */}
        <TouchableOpacity 
          onPress={() => navigateToRole('admin')}
          className="p-8 rounded-5xl bg-card border border-primary/20 shadow-xl relative overflow-hidden"
          activeOpacity={0.9}
        >
          <View className="absolute -left-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <View className="flex-row justify-between items-start mb-8">
            <View className="w-16 h-16 rounded-3xl bg-white/5 items-center justify-center border border-primary/20 shadow-2xl shadow-primary/5">
              <ShieldCheck size={32} color="#ff6b00" strokeWidth={2.5} />
            </View>
            <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-primary/5">
              <ArrowRight size={20} color="#ff6b00" />
            </View>
          </View>
          
          <Text className="text-3xl font-black text-white mb-3 tracking-tight">Canteen Owner</Text>
          <Text className="text-gray-400 font-medium leading-6 text-sm">
            Complete kitchen management. Live tracking, menu control, and sales insights.
          </Text>
          
          <View className="mt-12 flex-row items-center gap-4">
            <View className="px-8 py-4 rounded-full bg-primary shadow-2xl shadow-primary/60 -rotate-1">
              <Text className="text-[14px] font-black text-black uppercase tracking-[2px]">Dashboard</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* System Control Center - Flying from Left */}
        <Animated.View entering={SlideInLeft.delay(1800).duration(800).springify()}>
          <TouchableOpacity 
            className="flex-row items-center gap-3 px-6 py-3 bg-zinc-950 rounded-2xl border border-primary/5 shadow-inner"
            onPress={() => router.push('/(superadmin)')}
          >
            <LayoutDashboard size={18} color="#ff6b00" strokeWidth={2.5} />
            <Text className="text-zinc-600 font-black uppercase tracking-[3px] text-[10px]">
              System Control Center
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Status Indicator - Flying from Right */}
        <Animated.View entering={SlideInRight.delay(2000).duration(800).springify()} className="items-center">
          <View className="flex-row items-center gap-3 px-6 py-3 rounded-full bg-zinc-950 border border-primary/5 shadow-inner">
            <View className={`w-2 h-2 rounded-full ${session ? "bg-green-500/50" : "bg-red-500/50"}`} />
            <Text className="text-[10px] uppercase font-black text-zinc-600 tracking-[2.5px]">
              {session ? "Authenticated Session" : "Gateway Offline"}
            </Text>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
