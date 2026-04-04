import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ArrowLeft, Clock, CreditCard, Upload, Send, Loader2 } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  
  // Note: For Phase 4, we will assume cart data is passed or managed in a state store
  // For now, I will build the UI for the Checkout form

  const handleCheckout = async () => {
    if (!timeSlot) {
      Alert.alert("Missing Info", "Please enter your pickup time slot.");
      return;
    }
    setLoading(true);
    // Logic for Order Creation & Image Upload goes here
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success!", "Your order has been placed.");
      router.replace("/(tabs)/orders");
    }, 1500);
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 pt-16">
      <TouchableOpacity 
        onPress={() => router.back()}
        className="w-12 h-12 rounded-2xl bg-white/5 border border-primary/20 items-center justify-center mb-10 shadow-2xl shadow-primary/5"
      >
        <ArrowLeft size={24} color="#ff6b00" strokeWidth={2.5} />
      </TouchableOpacity>

      <View className="mb-10">
        <Text className="text-[10px] font-black text-primary uppercase tracking-[4px]">Final Step</Text>
        <Text className="text-4xl font-black text-white tracking-tighter italic">Checkout</Text>
        <View className="w-16 h-1 bg-primary mt-2 rounded-full" />
      </View>

      <View className="space-y-8">
        {/* Time Slot Input */}
        <View className="space-y-3">
          <View className="flex-row items-center gap-3 ml-1">
            <Clock size={12} color="#ff6b00" strokeWidth={2.5} />
            <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px]">Select Pickup Window</Text>
          </View>
          <View className="bg-card border border-white/5 rounded-2xl px-6 h-16 justify-center shadow-2xl">
            <TextInput
              placeholder="e.g. 12:30 PM - 1:00 PM"
              placeholderTextColor="#222"
              className="text-white font-black text-lg italic tracking-tight"
              value={timeSlot}
              onChangeText={setTimeSlot}
            />
          </View>
        </View>

        {/* Payment Section */}
        <View className="p-6 rounded-[32px] bg-card border border-white/5 shadow-2xl relative overflow-hidden">
          <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <View className="flex-row items-center gap-4 mb-5">
            <CreditCard size={24} color="#ff6b00" strokeWidth={2.5} />
            <Text className="text-xl font-black text-white italic tracking-tighter">Confirmation</Text>
          </View>
          
          <Text className="text-gray-500 font-black text-[11px] leading-5 mb-6 uppercase tracking-widest">
            Scan QR in Canteen & Upload Receipt
          </Text>
 
          <TouchableOpacity 
            className="h-32 border-2 border-dashed border-primary/30 rounded-2xl items-center justify-center bg-primary/5 shadow-inner"
            activeOpacity={0.7}
          >
            <Upload size={32} color="#ff6b00" strokeWidth={2.5} />
            <Text className="text-primary font-black uppercase tracking-[3px] text-[10px] mt-3">
              Upload Proof
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className={`h-16 rounded-2xl items-center justify-center flex-row gap-4 shadow-2xl shadow-primary/40 rotate-1 ${loading ? "bg-primary/50" : "bg-primary"}`}
          activeOpacity={0.8}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={24} color="black" className="animate-spin" />
          ) : (
            <>
              <Text className="text-black font-black text-xl italic tracking-tighter uppercase">Send Order</Text>
              <Send size={20} color="black" strokeWidth={2.5} />
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View className="h-12" />
    </ScrollView>
  );
}
