import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ShieldAlert, TrendingUp, Users, Store, Coffee, Activity, ArrowLeft } from "lucide-react-native";

export default function SuperadminStats() {
  const router = useRouter();
  const [stats, setStats] = useState({ orders: 0, canteens: 0, users: 0, revenue: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    const [orders, canteens, users] = await Promise.all([
      supabase.from("orders").select("id, total_amount", { count: 'exact' }),
      supabase.from("cafeterias").select("id", { count: 'exact' }),
      supabase.from("profiles").select("id", { count: 'exact' })
    ]);

    const totalRev = orders.data?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

    setStats({ 
      orders: orders.count || 0, 
      canteens: canteens.count || 0, 
      users: users.count || 0,
      revenue: totalRev
    });
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatBox = ({ title, value, icon: Icon, color }: any) => (
    <View className="w-[48%] p-6 bg-card border border-primary/10 rounded-[32px] mb-4 relative overflow-hidden shadow-2xl">
      <View className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-xl" />
      <View className={`w-12 h-12 rounded-xl mb-5 items-center justify-center border border-primary/10 shadow-inner`} style={{ backgroundColor: `${color}10` }}>
        <Icon size={24} color={color} strokeWidth={2.5} />
      </View>
      <Text className="text-gray-500 font-black uppercase tracking-[2px] text-[8px] mb-1.5">{title}</Text>
      <Text className="text-2xl font-black text-white tracking-tighter italic">{value}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8 bg-background/80 backdrop-blur-xl border-b border-primary/10 flex-row items-center gap-6">
        <TouchableOpacity 
          onPress={() => router.replace("/")}
          className="w-12 h-12 rounded-2xl bg-card items-center justify-center border border-primary/20 shadow-2xl shadow-primary/5"
        >
          <ArrowLeft size={24} color="#ff6b00" />
        </TouchableOpacity>
        <View>
          <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Executive Terminal</Text>
          <Text className="text-3xl font-black text-white tracking-tighter italic">Platform Center</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b00" />}
      >
        <View className="flex-row justify-between flex-wrap px-1">
          <StatBox title="Active Canteens" value={stats.canteens} icon={Store} color="#3b82f6" />
          <StatBox title="Total Students" value={stats.users} icon={Users} color="#8b5cf6" />
          <StatBox title="Total Orders" value={stats.orders} icon={Coffee} color="#ff6b00" />
          <StatBox title="Total Revenue" value={`Rs. ${stats.revenue}`} icon={TrendingUp} color="#22c55e" />
        </View>

        <View className="p-8 bg-primary border border-primary/20 rounded-[32px] mt-6 flex-row items-center gap-6 shadow-2xl shadow-primary/20 relative overflow-hidden">
             <View className="absolute top-0 right-0 w-40 h-40 bg-black/5 rounded-full -mr-20 -mt-20" />
            <Activity size={40} color="black" strokeWidth={3} />
            <View className="flex-1">
                <Text className="text-black font-black text-xl leading-6 italic">Core Identity Check</Text>
                <Text className="text-black/40 font-black text-[9px] uppercase tracking-[2px] mt-1.5">Platform Heartbeat: Stable</Text>
            </View>
        </View>
        
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
