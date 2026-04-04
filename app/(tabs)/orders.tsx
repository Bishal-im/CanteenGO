import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from "react-native";
import { useState, useEffect } from "react";
import { ClipboardList, Clock, CheckCircle, XCircle, Info } from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface Order {
  id: string;
  items: any[];
  total_amount: number;
  time_slot: string;
  status: "pending" | "accepted" | "preparing" | "ready" | "cancelled";
  created_at: string;
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/orders/myorders");
      if (data) {
        const formatted = data.map((item: any) => ({
          ...item,
          id: item._id
        }));
        setOrders(formatted);
      }
    } catch (error) {
      console.error("Orders fetch error:", error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const statusColors = {
    pending: "#ff6b00", // Brand Orange
    accepted: "#ff6b00", 
    preparing: "#ea580c", // Deep Orange
    ready: "#22c55e", // Green
    cancelled: "#ef4444", // Red
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8 bg-background/90 backdrop-blur-3xl border-b border-white/5">
        <Text className="text-[10px] font-black text-primary uppercase tracking-[4px]">CanteenGo Premium</Text>
        <Text className="text-3xl font-black text-white tracking-tighter italic">History</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b00" />
        }
      >
        <View className="py-8">
          {orders.map((order) => (
            <View key={order.id} className="mb-4 p-6 bg-card border border-white/5 rounded-[32px] shadow-2xl relative overflow-hidden">
               <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <View className="flex-row justify-between items-start mb-6">
                <View>
                  <Text className="text-gray-600 font-black uppercase tracking-[3px] text-[9px] mb-1">Slot Identity</Text>
                  <Text className="text-2xl font-black text-white italic tracking-tighter leading-none">{order.time_slot}</Text>
                </View>
                <View 
                   className="px-4 py-2 rounded-full border"
                   style={{ borderColor: `${statusColors[order.status]}40`, backgroundColor: `${statusColors[order.status]}10` }}
                >
                  <Text 
                    className="text-[9px] font-black uppercase tracking-[2px]"
                    style={{ color: statusColors[order.status] }}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <View className="space-y-3 mb-6 border-y border-white/5 py-6">
                {order.items.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3">
                        <View className="bg-primary/20 px-2 py-0.5 rounded-md">
                             <Text className="text-primary font-black text-[10px]">{item.quantity}X</Text>
                        </View>
                        <Text className="text-gray-300 font-black text-base italic tracking-tight" numberOfLines={1}>{item.name}</Text>
                    </View>
                    <Text className="text-gray-500 font-black italic text-sm">Rs. {item.price * item.quantity}</Text>
                  </View>
                ))}
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-lg bg-white/5 border border-primary/20 items-center justify-center">
                    <Clock size={14} color="#ff6b00" strokeWidth={2.5} />
                  </View>
                  <Text className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-gray-600 font-black text-xs uppercase tracking-widest">Total</Text>
                    <Text className="text-2xl font-black text-white italic tracking-tighter">Rs. {order.total_amount}</Text>
                </View>
              </View>
            </View>
          ))}

          {orders.length === 0 && !loading && (
            <View className="py-20 items-center justify-center opacity-40">
              <ClipboardList size={64} color="#ff6b00" strokeWidth={2.5} />
              <Text className="text-white font-black text-xl mt-4 italic">No orders yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
