import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, RefreshControl, Modal, Platform, ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Search, UserPlus, Shield, ShieldCheck, User as UserIcon,
  MoreVertical, ArrowLeft, X, Check, Trash2, AlertCircle
} from "lucide-react-native";
import { api } from "../../lib/api";

interface Profile {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "superadmin";
}

interface WhitelistEntry {
  _id: string;
  email: string;
  name: string | null;
  hasAccount: boolean;
  role: string | null;
  createdAt: string;
}

export default function UserControl() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "whitelist">("whitelist");
  const [users, setUsers] = useState<Profile[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/auth/users");
      if (data) setUsers(data.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      console.error("Users fetch error:", error);
    }
  };

  const fetchWhitelist = async () => {
    try {
      const { data } = await api.get("/auth/admins");
      if (data) setWhitelist(data);
    } catch (error) {
      console.error("Whitelist fetch error:", error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchWhitelist()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const handleAddAdmin = async () => {
    if (!newEmail.trim()) {
      Alert.alert("Error", "Email is required.");
      return;
    }
    setAdding(true);
    try {
      await api.post("/auth/admins", { email: newEmail.trim(), name: newName.trim() || undefined });
      setShowModal(false);
      setNewEmail("");
      setNewName("");
      await fetchAll();
      Alert.alert("✓ Admin Added", `${newEmail.trim()} has been whitelisted as an admin.`);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to add admin.");
    }
    setAdding(false);
  };

  const handleRemoveAdmin = (email: string) => {
    Alert.alert(
      "Revoke Access",
      `Remove ${email} from the admin whitelist? If they have an account, they will be demoted to customer.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/auth/admins/${encodeURIComponent(email)}`);
              await fetchAll();
              Alert.alert("Access Revoked", `${email} has been removed.`);
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.message || "Failed to remove admin.");
            }
          },
        },
      ]
    );
  };

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
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-background/80 border-b border-white/5">
        <View className="flex-row items-center gap-4 mb-6">
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
          {activeTab === "whitelist" && (
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="flex-row items-center gap-2 px-5 py-3 bg-purple-600 rounded-2xl border border-purple-400/20 shadow-2xl shadow-purple-900/30"
            >
              <UserPlus size={16} color="white" strokeWidth={2.5} />
              <Text className="text-white font-black text-sm">Add Admin</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row bg-card rounded-2xl p-1 border border-white/5">
          <TouchableOpacity
            onPress={() => setActiveTab("whitelist")}
            className={`flex-1 py-3 rounded-xl items-center ${activeTab === "whitelist" ? "bg-purple-600" : ""}`}
          >
            <Text className={`font-black text-xs uppercase tracking-[2px] ${activeTab === "whitelist" ? "text-white" : "text-gray-600"}`}>
              Admin Whitelist
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("users")}
            className={`flex-1 py-3 rounded-xl items-center ${activeTab === "users" ? "bg-primary" : ""}`}
          >
            <Text className={`font-black text-xs uppercase tracking-[2px] ${activeTab === "users" ? "text-black" : "text-gray-600"}`}>
              All Users
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search (Users tab only) */}
      {activeTab === "users" && (
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
      )}

      <ScrollView
        className="flex-1 px-4 pt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b00" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#ff6b00" style={{ marginTop: 40 }} />
        ) : activeTab === "whitelist" ? (
          /* ── WHITELIST TAB ── */
          <View className="pb-8">
            {whitelist.length === 0 ? (
              <View className="items-center py-20 opacity-40">
                <Shield size={48} color="#ff6b00" strokeWidth={1.5} />
                <Text className="text-white font-black italic text-lg mt-4">No Admins Whitelisted</Text>
                <Text className="text-gray-600 text-xs font-black uppercase tracking-[2px] mt-2">Tap "Add Admin" to begin</Text>
              </View>
            ) : (
              whitelist.map((entry) => (
                <View
                  key={entry._id}
                  className="mb-4 p-5 bg-card border border-purple-500/10 rounded-[28px] relative overflow-hidden shadow-2xl"
                >
                  <View className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12" />
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4 flex-1">
                      <View className="w-12 h-12 rounded-2xl bg-purple-600/20 items-center justify-center border border-purple-500/20">
                        <Shield size={22} color="#a855f7" strokeWidth={2.5} />
                      </View>
                      <View className="flex-1 pr-4">
                        <Text className="text-white font-black text-base italic tracking-tight">
                          {entry.name || "—"}
                        </Text>
                        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[1px] mt-0.5" numberOfLines={1}>
                          {entry.email}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-2">
                          {entry.hasAccount ? (
                            <View className="flex-row items-center gap-1 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                              <Check size={10} color="#22c55e" strokeWidth={3} />
                              <Text className="text-green-500 text-[9px] font-black uppercase tracking-[1px]">Has Account</Text>
                            </View>
                          ) : (
                            <View className="flex-row items-center gap-1 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                              <AlertCircle size={10} color="#eab308" strokeWidth={3} />
                              <Text className="text-yellow-500 text-[9px] font-black uppercase tracking-[1px]">Pending Signup</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveAdmin(entry.email)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center border border-red-500/20"
                    >
                      <Trash2 size={16} color="#ef4444" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* ── ALL USERS TAB ── */
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

      {/* Add Admin Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#0f0f0f] rounded-t-[40px] px-6 pt-8 pb-12 border-t border-purple-500/20">
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-[10px] font-black text-purple-400 uppercase tracking-[3px]">SuperAdmin</Text>
                <Text className="text-2xl font-black text-white tracking-tighter italic">Register Admin</Text>
              </View>
              <TouchableOpacity
                onPress={() => { setShowModal(false); setNewEmail(""); setNewName(""); }}
                className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10"
              >
                <X size={18} color="#666" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <Text className="text-[9px] font-black text-purple-400 uppercase tracking-[3px] mb-2">Admin Email *</Text>
            <TextInput
              placeholder="e.g. newadmin@example.com"
              placeholderTextColor="#333"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-card border border-purple-500/20 rounded-2xl px-5 h-14 text-white font-black italic text-base mb-4"
              style={{ borderColor: '#7c3aed33' }}
            />

            <Text className="text-[9px] font-black text-gray-600 uppercase tracking-[3px] mb-2">Display Name (optional)</Text>
            <TextInput
              placeholder="e.g. Block A Canteen Admin"
              placeholderTextColor="#333"
              value={newName}
              onChangeText={setNewName}
              className="bg-card border border-white/5 rounded-2xl px-5 h-14 text-white font-black italic text-base mb-8"
            />

            <TouchableOpacity
              onPress={handleAddAdmin}
              disabled={adding}
              className="bg-purple-600 h-16 rounded-2xl items-center justify-center shadow-2xl shadow-purple-900/40 flex-row gap-3"
            >
              {adding ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <ShieldCheck size={20} color="white" strokeWidth={2.5} />
                  <Text className="text-white font-black text-base uppercase tracking-[2px]">Authorize Admin</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
