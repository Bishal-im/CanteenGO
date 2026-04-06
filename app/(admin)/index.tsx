import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Clock, Check, X, Eye, Bell, CheckCircle2, Loader2, ArrowLeft, QrCode } from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface Order {
  id: string;
  customer_id: string;
  items: any[];
  total_amount: number;
  time_slot: string;
  status: string;
  payment_screenshot_url: string;
  created_at: string;
  profiles?: { name: string };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      // Map server data formatting if necessary
      // Assuming server populates customer_id: { name, email }
      const formatted = data.map((o: any) => ({
        ...o,
        id: o._id,
        profiles: { name: o.customer_id?.name }
      }));
      setOrders(formatted);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Polling every 10 seconds for pseudo real-time sync (Vercel Compatible)
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8 bg-background/80 backdrop-blur-xl flex-row justify-between items-center border-b border-white/5">
        <View className="flex-row items-center gap-5">
          <TouchableOpacity 
            onPress={() => router.replace("/")}
            className="w-12 h-12 rounded-2xl bg-card items-center justify-center border border-primary/20 shadow-2xl shadow-primary/5"
          >
            <ArrowLeft size={24} color="#ff6b00" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Ops Center</Text>
            <Text className="text-3xl font-black text-white tracking-tighter italic">Live Orders</Text>
          </View>
        </View>
        <View className="w-14 h-14 rounded-3xl bg-primary/10 items-center justify-center border border-primary/20">
          <Bell size={28} color="#ff6b00" strokeWidth={2.5} />
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="py-8">
          {/* Quick Actions / QR Shortcut */}
          <TouchableOpacity 
            onPress={() => router.push("/(admin)/qr")}
            className="mb-8 p-8 bg-primary rounded-[40px] flex-row items-center justify-between shadow-2xl shadow-primary/40"
          >
            <View className="flex-row items-center gap-5">
              <View className="w-14 h-14 rounded-2xl bg-black/10 items-center justify-center border border-black/5">
                <QrCode size={28} color="black" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-black font-black text-xl italic tracking-tighter">Joining Setup</Text>
                <Text className="text-black/50 text-[10px] font-black uppercase tracking-widest mt-1">QR & Code Terminal</Text>
              </View>
            </View>
            <View className="w-10 h-10 rounded-full bg-black/10 items-center justify-center">
              <Check size={20} color="black" strokeWidth={3} />
            </View>
          </TouchableOpacity>

          {orders.map((order) => (
            <View key={order.id} className="mb-4 p-6 bg-card border border-primary/10 rounded-[32px] shadow-2xl relative overflow-hidden">
               <View className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-xl" />
               {order.status === 'pending' && <View className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-lg shadow-primary" />}
              <View className="flex-row justify-between items-start mb-5">
                <View className="flex-1 mr-4">
                  <Text className="text-gray-600 font-black uppercase tracking-[2px] text-[9px] mb-1 opacity-80" numberOfLines={1}>
                    {order.profiles?.name || "Anonymous"} • {order.time_slot}
                  </Text>
                  <Text className="text-2xl font-black text-white tracking-tight italic">Rs. {order.total_amount}</Text>
                </View>
                <View className={`px-3 py-1.5 rounded-xl ${order.status === 'pending' ? 'bg-primary/20' : order.status === 'accepted' ? 'bg-orange-500/20' : 'bg-green-500/20'} border border-primary/10`}>
                  <Text className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'pending' ? 'text-primary' : order.status === 'accepted' ? 'text-orange-500' : 'text-green-500'}`}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2 mb-6">
                <TouchableOpacity 
                  onPress={() => setSelectedOrder(order)}
                  className="flex-1 h-12 bg-white/5 rounded-xl items-center justify-center flex-row gap-2 border border-white/5 shadow-inner"
                >
                  <Eye size={16} color="#ff6b00" />
                  <Text className="text-white font-black text-[9px] uppercase tracking-widest">Inspect</Text>
                </TouchableOpacity>

                {order.status === "pending" && (
                  <TouchableOpacity 
                    onPress={() => updateStatus(order.id, "accepted")}
                    className="flex-1 h-12 bg-primary rounded-xl items-center justify-center flex-row gap-2 shadow-lg shadow-primary/20"
                  >
                    <Check size={16} color="black" strokeWidth={4} />
                    <Text className="text-black font-black text-[9px] uppercase tracking-widest">Accept</Text>
                  </TouchableOpacity>
                )}

                {order.status === "accepted" && (
                  <TouchableOpacity 
                    onPress={() => updateStatus(order.id, "preparing")}
                    className="flex-1 h-12 bg-orange-600 rounded-xl items-center justify-center flex-row gap-2 shadow-lg shadow-orange-600/20"
                  >
                    <Loader2 size={16} color="white" strokeWidth={4} />
                    <Text className="text-white font-black text-[9px] uppercase tracking-widest">Prepare</Text>
                  </TouchableOpacity>
                )}

                {order.status === "preparing" && (
                  <TouchableOpacity 
                    onPress={() => updateStatus(order.id, "ready")}
                    className="flex-1 h-12 bg-green-500 rounded-xl items-center justify-center flex-row gap-2 shadow-lg shadow-green-500/20"
                  >
                    <CheckCircle2 size={16} color="black" strokeWidth={4} />
                    <Text className="text-black font-black text-[9px] uppercase tracking-widest">Ready</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row flex-wrap items-center gap-2">
                {order.items.map((item, idx) => (
                  <View key={idx} className="bg-white/5 px-2.5 py-1 rounded-lg border border-primary/5">
                    <Text className="text-[9px] text-gray-500 font-black uppercase tracking-tight italic">{item.quantity}x {item.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={!!selectedOrder} transparent animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center p-6">
          <TouchableOpacity 
             onPress={() => setSelectedOrder(null)}
             className="absolute top-16 right-6 w-12 h-12 rounded-full bg-white/10 items-center justify-center"
          >
            <X size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-white font-black text-2xl mb-8 tracking-tighter">Payment Receipt</Text>
          <View className="w-full aspect-[3/4] bg-white/5 rounded-[32px] overflow-hidden border border-white/10">
            {selectedOrder?.payment_screenshot_url ? (
               <Image source={{ uri: selectedOrder.payment_screenshot_url }} className="w-full h-full" resizeMode="contain" />
            ) : (
               <View className="w-full h-full items-center justify-center">
                 <Text className="text-gray-600 font-black italic">No screenshot provided.</Text>
               </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
