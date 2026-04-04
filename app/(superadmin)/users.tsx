import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Search, UserPlus, Shield, ShieldCheck, User as UserIcon, MoreVertical, ArrowLeft } from "lucide-react-native";
import { api } from "../../lib/api";

interface Profile {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "superadmin";
}

export default function UserControl() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/auth/users");
      if (data) {
        const formatted = data.map((u: any) => ({
          ...u,
          id: u._id
        }));
        setUsers(formatted);
      }
    } catch (error) {
      console.error("Users fetch error:", error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    Alert.alert("Change Role", `Convert user to ${newRole}?`, [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Yes, Change", 
        onPress: async () => {
          try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            Alert.alert("Success", "Role updated."); 
            fetchUsers();
          } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || error.message);
          }
        } 
      },
    ]);
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-primary/20 shadow-lg shadow-primary/5"
          >
            <ArrowLeft size={20} color="#ff6b00" strokeWidth={2.5} />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Global Access</Text>
            <Text className="text-3xl font-black text-white tracking-tighter italic">Personnel</Text>
          </View>
        </View>
        
        <View className="mt-6 flex-row items-center bg-card border border-white/5 rounded-3xl px-6 h-16 shadow-2xl relative overflow-hidden">
          <View className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
          <Search size={20} color="#ff6b00" strokeWidth={2.5} />
          <TextInput 
            placeholder="Search identity or email..."
            placeholderTextColor="#444"
            className="flex-1 ml-4 text-white font-black italic text-lg tracking-tight"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchUsers();}} tintColor="#ff6b00" />}
      >
        <View className="py-8">
          {filteredUsers.map((user) => (
            <View key={user.id} className="mb-4 p-6 bg-card border border-white/5 rounded-[32px] flex-row items-center justify-between shadow-2xl relative overflow-hidden">
               <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-14 h-14 rounded-2xl bg-white/5 items-center justify-center border border-primary/20 shadow-2xl shadow-primary/5 rotate-3">
                    <UserIcon size={24} color="#ff6b00" strokeWidth={2.5} />
                </View>
                <View className="flex-1 pr-4">
                  <Text className="text-xl font-black text-white italic tracking-tighter leading-7 mb-1">{user.name || "Anon Persona"}</Text>
                  <Text className="text-[9px] text-gray-500 font-black uppercase tracking-[1px] opacity-60" numberOfLines={1}>{user.email}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <View className={`px-4 py-2 rounded-full border ${user.role === 'customer' ? 'border-white/10 bg-white/5' : user.role === 'admin' ? 'border-primary/20 bg-primary/10' : 'border-primary/40 bg-primary/20'}`}>
                    <Text className={`text-[9px] font-black uppercase tracking-[2px] ${user.role === 'customer' ? 'text-gray-500' : 'text-primary'}`}>
                        {user.role}
                    </Text>
                </View>
                
                <TouchableOpacity 
                   onPress={() => updateRole(user.id, user.role === 'customer' ? 'admin' : 'customer')}
                   className="w-12 h-12 rounded-xl bg-white/5 items-center justify-center border border-primary/10 shadow-lg shadow-primary/5"
                >
                    <MoreVertical size={20} color="#ff6b00" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="h-20" />
    </View>
  );
}
