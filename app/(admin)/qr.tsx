import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Share } from "react-native";
import { useState, useEffect } from "react";
import { QrCode, RefreshCw, Copy, Share2, Save, Dice5 } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function CanteenQR() {
  const { user, refreshProfile } = useAuth();
  const [canteenCode, setCanteenCode] = useState(user?.cafeteriaId?.canteenCode || "");
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(!!user?.cafeteriaId?.canteenCode);

  useEffect(() => {
    if (user?.cafeteriaId?.canteenCode) {
      setCanteenCode(user.cafeteriaId.canteenCode);
      setIsSaved(true);
    }
  }, [user]);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars like O, 0, I, 1
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCanteenCode(result);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!canteenCode || canteenCode.length < 4) {
      Alert.alert("Invalid Code", "Please enter a code at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/cafeterias/setup", { canteenCode: canteenCode.toUpperCase() });
      await refreshProfile();
      setIsSaved(true);
      Alert.alert("Success", "Canteen Joining Code has been set!");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to set code.");
    } finally {
      setLoading(false);
    }
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Join our canteen on CanteenGO! Use code: ${canteenCode}`,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6">
      <View className="pt-20 pb-12">
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text className="text-[10px] font-black text-primary uppercase tracking-[4px] mb-2">Marketing Kit</Text>
          <Text className="text-4xl font-black text-white tracking-tighter italic mb-4">Joining <Text className="text-primary italic">QR & Code</Text></Text>
          <Text className="text-gray-500 font-medium leading-6">
            Share this code or QR with your students. They can scan it to immediately see your menu and start ordering.
          </Text>
        </Animated.View>

        {/* Code Setup Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mt-10 p-8 bg-card border border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden">
          <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <Text className="text-[10px] font-black text-gray-500 uppercase tracking-[3px] mb-6">Joining Code Configuration</Text>
          
          <View className="flex-row items-center gap-4 mb-8">
            <View className="flex-1 h-20 bg-background border border-white/10 rounded-2xl px-6 flex-row items-center">
              <TextInput
                value={canteenCode}
                onChangeText={(t) => { setCanteenCode(t.toUpperCase()); setIsSaved(false); }}
                placeholder="E.G. CAFE12"
                placeholderTextColor="#333"
                className="flex-1 text-white font-black text-2xl italic tracking-widest"
                autoCapitalize="characters"
                maxLength={10}
                editable={!isSaved}
              />
              {!isSaved && (
                <TouchableOpacity onPress={generateRandomCode} className="w-10 h-10 items-center justify-center bg-primary/10 rounded-xl">
                  <Dice5 size={20} color="#ff6b00" strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!isSaved ? (
            <TouchableOpacity 
              onPress={handleSave}
              disabled={loading}
              className="h-16 bg-primary rounded-2xl items-center justify-center flex-row gap-3 shadow-xl shadow-primary/30"
            >
              <Save size={20} color="black" strokeWidth={2.5} />
              <Text className="text-black font-black text-lg uppercase tracking-widest italic">Secure Code</Text>
            </TouchableOpacity>
          ) : (
            <View className="h-16 bg-green-500/10 border border-green-500/20 rounded-2xl items-center justify-center flex-row gap-3">
              <CheckCircle2 color="#22c55e" size={20} />
              <Text className="text-green-500 font-black text-lg uppercase tracking-widest italic tracking-tight">Active & Locked</Text>
            </View>
          )}
        </Animated.View>

        {/* QR Display Card */}
        {isSaved && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mt-8 p-10 bg-white items-center rounded-[48px] shadow-2xl relative">
            <View className="p-4 bg-white rounded-3xl border-4 border-gray-100">
              <QRCode
                value={canteenCode}
                size={200}
                color="black"
                backgroundColor="white"
              />
            </View>
            
            <Text className="text-black font-black text-3xl mt-8 tracking-widest uppercase italic">{canteenCode}</Text>
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Unique Canteen Serial</Text>

            <View className="flex-row gap-4 mt-10 w-full">
              <TouchableOpacity 
                onPress={onShare}
                className="flex-1 h-14 bg-black rounded-2xl items-center justify-center flex-row gap-3"
              >
                <Share2 size={18} color="white" />
                <Text className="text-white font-black text-xs uppercase tracking-widest">Share</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}

// Simple internal icon for locked state
const CheckCircle2 = ({ color, size }: { color: string, size: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>✓</Text>
  </View>
);
