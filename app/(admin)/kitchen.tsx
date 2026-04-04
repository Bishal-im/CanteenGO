import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { ClipboardList, ChefHat, CheckSquare, Clock } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

interface AggregatedItem {
  name: string;
  quantity: number;
}

export default function KitchenView() {
  const [itemsToCook, setItemsToCook] = useState<AggregatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchKitchenData = async () => {
    // Only fetch orders that are 'accepted' or 'preparing'
    const { data, error } = await supabase
      .from("orders")
      .select("items")
      .in("status", ["accepted", "preparing"]);
    
    if (!error && data) {
      const counts: { [key: string]: number } = {};
      data.forEach((order) => {
        order.items.forEach((item: any) => {
          counts[item.name] = (counts[item.name] || 0) + item.quantity;
        });
      });

      const aggregated = Object.entries(counts).map(([name, quantity]) => ({
        name,
        quantity,
      }));
      setItemsToCook(aggregated);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchKitchenData();

    const subscription = supabase
      .channel("kitchen")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchKitchenData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Bulk Engine</Text>
        <Text className="text-3xl font-black text-white tracking-tighter italic">Kitchen Flow</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchKitchenData();}} tintColor="#ff6b00" />
        }
      >
        <View className="py-8">
          {itemsToCook.map((item, index) => (
            <View key={index} className="mb-4 p-5 bg-card border border-white/5 rounded-[32px] flex-row justify-between items-center shadow-2xl relative overflow-hidden">
               <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <View className="flex-row items-center gap-6">
                <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center shadow-xl shadow-primary/20 rotate-3">
                  <Text className="text-black font-black text-2xl italic">{item.quantity}x</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-black text-white tracking-tighter italic" numberOfLines={1}>{item.name}</Text>
                  <Text className="text-[9px] text-gray-500 font-bold uppercase tracking-[2px] mt-1 opacity-60">Production Queue</Text>
                </View>
              </View>
              <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                <ChefHat size={22} color="#ff6b00" strokeWidth={2.5} />
              </View>
            </View>
          ))}

          {itemsToCook.length === 0 && !loading && (
            <View className="py-20 items-center justify-center opacity-20">
              <CheckSquare size={64} color="white" />
              <Text className="text-white font-black text-xl mt-4 italic">Kitchen is clear!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="p-6 bg-card/50 border-t border-white/5">
         <View className="flex-row items-center gap-2 justify-center">
            <Clock size={12} color="#444" />
            <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Everything is synced in Real-time</Text>
         </View>
      </View>
    </View>
  );
}
