import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Search, ShoppingBag, Plus, Minus, Info } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true);
    
    if (!error && data) setMenuItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id]--;
      else delete newCart[id];
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8 bg-background/90 backdrop-blur-3xl border-b border-white/5">
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-[10px] font-black text-primary uppercase tracking-[4px]">CanteenGo Premium</Text>
            <Text className="text-3xl font-black text-white tracking-tighter italic">Bistro <Text className="text-primary italic">Menu</Text></Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push("/cart")}
            className="w-12 h-12 rounded-2xl bg-card border border-primary/20 items-center justify-center relative shadow-2xl shadow-primary/10"
          >
            <ShoppingBag size={24} color="#ff6b00" strokeWidth={2.5} />
            {totalItems > 0 && (
              <View className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary rounded-full items-center justify-center border-2 border-background">
                <Text className="text-[10px] font-black text-black">{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-card border border-primary/10 rounded-3xl px-6 h-16 shadow-2xl relative overflow-hidden">
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
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="py-8">
          {menuItems.map((item) => (
            <View key={item.id} className="mb-4 p-5 bg-card border border-primary/5 rounded-[32px] flex-row gap-5 shadow-2xl relative overflow-hidden">
               <View className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mb-16 blur-2xl opacity-40" />
              <View className="w-28 h-28 rounded-2xl bg-white/5 overflow-hidden border border-primary/10 items-center justify-center">
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
                      <Text className="text-white font-black px-6 text-lg italic">{cart[item.id]}</Text>
                       <TouchableOpacity 
                        onPress={() => addToCart(item.id)} 
                        className="w-10 h-10 items-center justify-center bg-white/5 border border-primary/20 rounded-xl"
                      >
                        <Plus size={20} color="#ff6b00" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                     <TouchableOpacity 
                      onPress={() => addToCart(item.id)}
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-primary/20 items-center justify-center shadow-2xl shadow-primary/10 rotate-3"
                    >
                      <Plus size={24} color="#ff6b00" strokeWidth={2.5} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {menuItems.length === 0 && !loading && (
             <View className="py-20 items-center justify-center opacity-40">
               <Info size={64} color="#ff6b00" strokeWidth={2.5} />
               <Text className="text-white font-black text-xl mt-4 italic">No items found.</Text>
             </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Checkout Button */}
        <View className="absolute bottom-10 left-6 right-6">
          <TouchableOpacity 
            className="bg-primary h-16 rounded-2xl flex-row items-center justify-between px-8 shadow-2xl shadow-primary/60"
            activeOpacity={0.9}
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-black/10 px-2 py-1 rounded-md">
                <Text className="text-black font-black text-[10px]">{totalItems} ITEMS</Text>
              </View>
            </View>
            <Text className="text-black font-black text-lg uppercase tracking-widest italic">Proceed to Cart</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}
