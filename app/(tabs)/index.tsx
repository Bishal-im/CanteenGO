import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Search, ShoppingBag, Plus, Minus, Info, Utensils, ArrowRight } from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SkeletonPulse } from "../../components/SkeletonPulse";
import { GlassCard } from "../../components/GlassCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

export default function MenuScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, totalItems } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMenu = async () => {
    try {
      const { data } = await api.get("/menu");
      if (data) {
        const formatted = data.map((item: any) => ({
          ...item,
          id: item._id
        }));
        setMenuItems(formatted.filter((item: any) => item.is_available));
      }
    } catch (error) {
      console.error("Menu fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      <BlurView intensity={80} tint="dark" className="px-6 pt-16 pb-8 border-b border-white/5 z-10">
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-[10px] font-black text-primary uppercase tracking-[4px]">CanteenGo Premium</Text>
            <Text className="text-3xl font-black text-white tracking-tighter italic">Bistro <Text className="text-primary italic">Menu</Text></Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push("/cart")}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-primary/20 items-center justify-center relative shadow-2xl shadow-primary/10"
          >
            <ShoppingBag size={24} color="#ff6b00" strokeWidth={2.5} />
            {totalItems > 0 && (
              <View className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary rounded-full items-center justify-center border-2 border-background">
                <Text className="text-[10px] font-black text-black">{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white/5 border border-white/10 rounded-3xl px-6 h-16 shadow-2xl relative overflow-hidden">
           <View className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-xl" />
          <Search size={22} color="#ff6b00" strokeWidth={2.5} />
          <TextInput
            placeholder="Today's cravings?"
            placeholderTextColor="#444"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-4 text-white font-black italic text-lg tracking-tight"
          />
        </View>
      </BlurView>

      <ScrollView className="flex-1 px-4">
        {!user?.cafeteriaId ? (
          <View className="py-20 px-10 items-center justify-center">
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-8 border border-primary/20">
              <Utensils size={48} color="#ff6b00" strokeWidth={1.5} />
            </View>
            <Text className="text-3xl font-black text-white text-center italic tracking-tighter mb-4">You haven't joined a canteen yet!</Text>
            <Text className="text-gray-500 text-center font-medium leading-6 mb-10">
              Join a canteen to see their fresh menu, daily specials, and start pre-ordering your favorites.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push("/join-canteen")}
              className="w-full h-16 bg-primary rounded-2xl flex-row items-center justify-center gap-3 shadow-2xl shadow-primary/40"
            >
              <Text className="text-black font-black text-lg uppercase tracking-widest italic">Join Canteen Now</Text>
              <ArrowRight size={20} color="black" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View className="py-8">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="mb-4 p-5 bg-white/5 rounded-[32px] flex-row gap-5">
                <SkeletonPulse width={112} height={112} borderRadius={24} />
                <View className="flex-1 justify-center gap-3">
                  <SkeletonPulse width="80%" height={24} />
                  <SkeletonPulse width="50%" height={16} />
                  <View className="flex-row justify-between items-center mt-2">
                     <SkeletonPulse width={80} height={32} />
                     <SkeletonPulse width={48} height={48} borderRadius={16} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="py-8">
            {filteredItems.map((item, index) => (
              <Animated.View 
                entering={FadeInDown.delay(index * 100).springify()}
                key={item.id} 
                className="mb-4"
              >
                <GlassCard containerStyle={{ borderRadius: 32 }}>
                  <View className="flex-row gap-5 relative overflow-hidden">
                    <View className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mb-16 blur-2xl opacity-40" />
                    <View className="w-28 h-28 rounded-2xl bg-white/5 overflow-hidden border border-white/10 items-center justify-center">
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} className="w-full h-full" />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-primary/5">
                          <ShoppingBag size={32} color="#ff6b00" strokeWidth={2.5} />
                        </View>
                      )}
                    </View>

                    <View className="flex-1 justify-center">
                      <View className="mb-4">
                        <Text className="text-2xl font-black text-white italic tracking-tighter leading-tight mb-1">{item.name}</Text>
                        <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[2px] opacity-60" numberOfLines={2}>{item.description}</Text>
                      </View>

                      <View className="flex-row justify-between items-center">
                        <Text className="text-2xl font-black text-primary italic">Rs. {item.price}</Text>

                        {cart[item.id] ? (
                          <View className="flex-row items-center bg-white/5 rounded-2xl border border-primary/10 p-1">
                            <TouchableOpacity 
                              onPress={() => removeFromCart(item.id)} 
                              className="w-10 h-10 items-center justify-center bg-white/5 rounded-xl border border-primary/20"
                            >
                              <Minus size={20} color="#ff6b00" strokeWidth={2.5} />
                            </TouchableOpacity>
                            <Text className="text-white font-black px-6 text-lg italic">{cart[item.id].quantity}</Text>
                            <TouchableOpacity 
                              onPress={() => addToCart(item)} 
                              className="w-10 h-10 items-center justify-center bg-white/5 border border-primary/20 rounded-xl"
                            >
                              <Plus size={20} color="#ff6b00" strokeWidth={2.5} />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            onPress={() => addToCart(item)}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-primary/20 items-center justify-center shadow-2xl shadow-primary/10 rotate-3"
                          >
                            <Plus size={24} color="#ff6b00" strokeWidth={2.5} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}

            {filteredItems.length === 0 && !loading && (
               <View className="py-20 items-center justify-center">
                 <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                   <Info size={32} color="#ff6b00" strokeWidth={2.5} />
                 </View>
                 <Text className="text-white font-black text-xl mt-4 italic text-center">
                    {searchQuery ? "No matches found" : "Fresh Menu Coming Soon! 🍳"}
                 </Text>
                 <Text className="text-gray-500 font-medium text-xs mt-2 text-center">
                    {searchQuery ? `We couldn't find anything for "${searchQuery}"` : "This canteen hasn't uploaded their menu yet."}
                 </Text>
               </View>
            )}
          </View>
        )}
      </ScrollView>

      {totalItems > 0 && (
        <Animated.View 
          entering={FadeInRight.delay(200).springify()}
          className="absolute bottom-10 left-6 right-6"
        >
          <TouchableOpacity 
            onPress={() => router.push("/cart")}
            className="flex-row items-center justify-between shadow-2xl shadow-primary/60"
            activeOpacity={0.9}
          >
             <GlassCard 
               intensity={100} 
               borderRadius={24} 
               style={{ 
                 flexDirection: "row", 
                 alignItems: "center", 
                 justifyContent: "space-between", 
                 width: "100%",
                 paddingHorizontal: 32,
                 height: 64,
                 backgroundColor: "#ff6b00" 
               }}
             >
                <View className="flex-row items-center gap-3">
                  <View className="bg-black/20 px-3 py-1.5 rounded-lg border border-black/10">
                    <Text className="text-black font-black text-[10px] tracking-widest">{totalItems} ITEMS</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-black font-black text-lg uppercase tracking-widest italic">Checkout</Text>
                  <ArrowRight size={20} color="black" strokeWidth={3} />
                </View>
             </GlassCard>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
