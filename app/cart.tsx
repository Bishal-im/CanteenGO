import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ArrowLeft, Clock, CreditCard, Upload, Send, Loader2, Trash2, Plus, Minus, CheckCircle } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import * as ImagePicker from 'expo-image-picker';
import { GlassCard } from "../components/GlassCard";

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, removeFromCart, addToCart, totalPrice, clearCart, totalItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow gallery access to upload payment proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCheckout = async () => {
    if (totalItems === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }
    if (!timeSlot) {
      Alert.alert("Missing Info", "Please enter your pickup time slot.");
      return;
    }
    if (!selectedImage) {
      Alert.alert("Payment Proof Required", "Please upload a screenshot of your payment receipt.");
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('time_slot', timeSlot);
    formData.append('remarks', remarks);
    formData.append('total_amount', String(totalPrice));
    
    // Transform cart object to items array for backend
    const itemsArray = Object.values(cart).map(item => ({
      item_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));
    formData.append('items', JSON.stringify(itemsArray));

    // Append image
    const uri = selectedImage;
    const filename = uri.split('/').pop() || 'receipt.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : `image/jpeg`;
    
    formData.append('image', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    } as any);

    try {
      await api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      clearCart();
      Alert.alert("Order Placed!", "Your order has been sent to the canteen.");
      router.replace("/(tabs)/orders");
    } catch (error: any) {
      console.error("[Checkout] Error:", error.response?.data || error.message);
      Alert.alert("Checkout Failed", error.response?.data?.message || "There was an error placing your order.");
    } finally {
      setLoading(false);
    }
  };

  const cartArray = Object.values(cart);

  return (
    <ScrollView className="flex-1 bg-background px-6 pt-16" showsVerticalScrollIndicator={false}>
      <View className="flex-row justify-between items-center mb-10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shadow-2xl"
        >
          <ArrowLeft size={24} color="#ff6b00" strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Clear Cart", "Empty your cart?", [
          { text: "Cancel", style: "cancel" },
          { text: "Clear", style: "destructive", onPress: clearCart }
        ])}>
            <Trash2 size={20} color="#ef4444" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View className="mb-10">
        <Text className="text-[10px] font-black text-primary uppercase tracking-[4px]">Checking your feast 😋</Text>
        <Text className="text-4xl font-black text-white tracking-tighter italic">Plate Preview 🍱</Text>
        <View className="flex-row items-center mt-2">
            <View className="w-12 h-1 bg-primary rounded-full mr-3" />
            <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{totalItems} Goodies ready</Text>
        </View>
      </View>

      {/* Cart Items List */}
      <View className="mb-10">
        {cartArray.length === 0 ? (
          <GlassCard containerStyle={{ padding: 40, alignItems: 'center' }}>
            <Text className="text-white/40 font-bold italic">Your bag is empty...</Text>
          </GlassCard>
        ) : (
          cartArray.map((item) => (
            <View key={item.id} className="mb-4">
               <GlassCard containerStyle={{ borderRadius: 24, padding: 16 }}>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-white font-black text-lg italic">{item.name}</Text>
                      <Text className="text-primary font-black text-xs uppercase tracking-widest mt-1">Rs. {item.price * item.quantity}</Text>
                    </View>
                    <View className="flex-row items-center bg-white/5 rounded-xl border border-white/5 p-1">
                      <TouchableOpacity onPress={() => removeFromCart(item.id)} className="p-2">
                        <Minus size={16} color="#ff6b00" strokeWidth={3} />
                      </TouchableOpacity>
                      <Text className="text-white font-black px-4">{item.quantity}</Text>
                      <TouchableOpacity onPress={() => addToCart(item)} className="p-2">
                        <Plus size={16} color="#ff6b00" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                  </View>
               </GlassCard>
            </View>
          ))
        )}
      </View>

      <View className="space-y-8 mb-20">
        {/* Time Slot Input */}
        <View className="space-y-3">
          <View className="flex-row items-center gap-3 ml-1">
            <Clock size={12} color="#ff6b00" strokeWidth={2.5} />
            <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px]">When are you coming? 🚶‍♂️</Text>
          </View>
          <View className="bg-card border border-white/5 rounded-2xl px-6 h-16 justify-center shadow-inner">
            <TextInput
              placeholder="e.g. 12:30 PM - 1:00 PM"
              placeholderTextColor="#444"
              className="text-white font-black text-lg italic tracking-tight"
              value={timeSlot}
              onChangeText={setTimeSlot}
            />
          </View>
        </View>

        {/* Remarks Input */}
        <View className="space-y-3">
          <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] ml-1">Any special wishes? ✨</Text>
          <View className="bg-card border border-white/5 rounded-2xl px-6 h-16 justify-center shadow-inner">
            <TextInput
              placeholder="e.g. Extra spicy, less salt"
              placeholderTextColor="#444"
              className="text-white font-black text-lg italic tracking-tight"
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>
        </View>

        {/* Payment Section */}
        <View className="p-6 rounded-[32px] bg-card border border-white/5 shadow-2xl relative overflow-hidden">
          <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center gap-4">
                <CreditCard size={24} color="#ff6b00" strokeWidth={2.5} />
                <Text className="text-xl font-black text-white italic tracking-tighter">Settlement</Text>
            </View>
            <View>
                <Text className="text-primary font-black text-2xl italic">Rs. {totalPrice}</Text>
            </View>
          </View>
          
          <Text className="text-gray-500 font-black text-[10px] leading-5 mb-6 uppercase tracking-[3px]">
            Scan & Drop the Receipt here!
          </Text>
  
          <TouchableOpacity 
            onPress={pickImage}
            className={`h-40 border-2 border-dashed ${selectedImage ? "border-green-500/30" : "border-primary/30"} rounded-3xl items-center justify-center bg-white/5 shadow-inner overflow-hidden`}
            activeOpacity={0.7}
          >
            {selectedImage ? (
                <View className="w-full h-full relative">
                    <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <CheckCircle size={32} color="#22c55e" strokeWidth={2.5} />
                        <Text className="text-white font-black uppercase text-[10px] tracking-widest mt-2">Replace Receipt</Text>
                    </View>
                </View>
            ) : (
                <>
                    <Upload size={32} color="#ff6b00" strokeWidth={2.5} />
                    <Text className="text-primary font-black uppercase tracking-[3px] text-[10px] mt-4 italic">
                    Tap to Select Proof
                    </Text>
                </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className={`h-20 rounded-[32px] items-center justify-center flex-row gap-4 shadow-2xl shadow-primary/40 rotate-1 ${loading ? "bg-primary/50" : "bg-primary"}`}
          activeOpacity={0.8}
          onPress={handleCheckout}
          disabled={loading || totalItems === 0}
        >
          {loading ? (
            <Loader2 size={24} color="black" className="animate-spin" />
          ) : (
            <>
              <Text className="text-black font-black text-xl italic tracking-tighter uppercase font-black">Dispatch Order</Text>
              <Send size={20} color="black" strokeWidth={3} />
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View className="h-12" />
    </ScrollView>
  );
}
