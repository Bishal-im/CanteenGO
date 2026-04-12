import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, RefreshControl, ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Search, User as UserIcon, MoreVertical, ArrowLeft } from "lucide-react-native";
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
      if (data) setUsers(data.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      console.error("Users fetch error:", error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const updateRole = async (userId: string, newRole: string) => {
    Alert.alert("Change Role", `Convert user to ${newRole}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Change",
        onPress: async () => {
          try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            await fetchAll();
          } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || error.message);
          }
        },
      },
    ]);
  };

  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-background/80 border-b border-white/5">
        <View className="flex-row items-center gap-4 mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-primary/20"
          >
            <ArrowLeft size={20} color="#ff6b00" strokeWidth={2.5} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Global Access</Text>
            <Text className="text-3xl font-black text-white tracking-tighter italic">Personnel</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-card border border-white/5 rounded-3xl px-6 h-14 shadow-xl">
          <Search size={18} color="#ff6b00" strokeWidth={2.5} />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#444"
            className="flex-1 ml-4 text-white font-black italic text-base"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b00" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#ff6b00" style={{ marginTop: 40 }} />
        ) : (
          <View className="pb-8">
            {filteredUsers.map((user) => (
              <View key={user.id} className="mb-4 p-5 bg-card border border-white/5 rounded-[28px] flex-row items-center justify-between shadow-2xl relative overflow-hidden">
                <View className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
                <View className="flex-row items-center gap-4 flex-1">
                  <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-primary/20">
                    <UserIcon size={22} color="#ff6b00" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1 pr-4">
                    <Text className="text-lg font-black text-white italic tracking-tighter">{user.name || "Anon"}</Text>
                    <Text className="text-[9px] text-gray-500 font-black uppercase tracking-[1px]" numberOfLines={1}>{user.email}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className={`px-3 py-1.5 rounded-full border ${user.role === 'customer' ? 'border-white/10 bg-white/5' : user.role === 'admin' ? 'border-primary/20 bg-primary/10' : 'border-purple-500/30 bg-purple-500/10'}`}>
                    <Text className={`text-[9px] font-black uppercase tracking-[2px] ${user.role === 'customer' ? 'text-gray-500' : user.role === 'admin' ? 'text-primary' : 'text-purple-400'}`}>
                      {user.role}
                    </Text>
                  </View>
                  {user.role !== 'superadmin' && (
                    <TouchableOpacity
                      onPress={() => updateRole(user.id, user.role === 'customer' ? 'admin' : 'customer')}
                      className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-primary/10"
                    >
                      <MoreVertical size={18} color="#ff6b00" strokeWidth={2.5} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
