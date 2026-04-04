import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, User, Settings, Shield, ChevronRight, Mail, Home } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<string>("customer");

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("role").eq("id", user.id).single()
        .then(({ data }) => {
          if (data) setRole(data.role);
        });
    }
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Yes, Logout", 
        onPress: async () => {
          await signOut();
          router.replace("/login");
        } 
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background px-6">
      <View className="pt-20 pb-12 items-center">
        <View className="w-24 h-24 rounded-[32px] bg-white/5 border border-primary/20 overflow-hidden items-center justify-center mb-6 shadow-2xl shadow-primary/10 rotate-3">
           <View className="absolute top-0 left-0 w-12 h-12 bg-primary/10 rounded-full -ml-4 -mt-4 blur-xl" />
          <User size={48} color="#ff6b00" strokeWidth={2.5} />
        </View>
        <Text className="text-3xl font-black text-white italic tracking-tighter uppercase">{user?.email?.split('@')[0]}</Text>
        <View className="flex-row items-center gap-3 mt-4 px-6 py-2 rounded-full bg-card border border-primary/20 shadow-xl">
          <Shield size={14} color="#ff6b00" strokeWidth={2.5} />
          <Text className="text-[12px] text-primary font-black uppercase tracking-[4px]">{role}</Text>
        </View>
      </View>

      <View className="space-y-4">
        {role === "admin" && (
          <TouchableOpacity 
            onPress={() => router.push("/(admin)")}
            className="flex-row items-center justify-between p-6 bg-primary h-20 rounded-3xl shadow-2xl shadow-primary/30 border border-white/10"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-xl bg-black/10 items-center justify-center border border-black/5">
                <Shield size={20} color="black" strokeWidth={2.5} />
              </View>
              <Text className="text-black font-black text-lg italic tracking-tighter">Admin Control</Text>
            </View>
            <ChevronRight size={20} color="black" strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        <TouchableOpacity className="flex-row items-center justify-between p-6 bg-card border border-primary/5 rounded-3xl shadow-xl shadow-primary/5">
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-primary/20">
              <Mail size={20} color="#ff6b00" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-gray-600 text-[9px] font-black uppercase tracking-[3px] mb-0.5">Email Terminal</Text>
              <Text className="text-white font-black text-base italic">{user?.email}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between p-6 bg-card border border-primary/5 rounded-3xl shadow-xl shadow-primary/5">
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-primary/20">
              <Settings size={20} color="#ff6b00" strokeWidth={2.5} />
            </View>
            <Text className="text-white font-black text-lg italic tracking-tighter">Preferences</Text>
          </View>
          <ChevronRight size={20} color="#444" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace("/")}
          className="flex-row items-center justify-between p-6 bg-card border border-primary/5 rounded-3xl shadow-xl shadow-primary/5"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-primary/20">
              <Home size={20} color="#ff6b00" strokeWidth={2.5} />
            </View>
            <Text className="text-white font-black text-lg italic tracking-tighter">Exit to Bistro</Text>
          </View>
          <ChevronRight size={20} color="#444" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSignOut}
          className="flex-row items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-3xl mt-10"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center">
              <LogOut size={20} color="#ef4444" strokeWidth={2.5} />
            </View>
            <Text className="text-red-500 font-black text-lg italic tracking-tighter uppercase">Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View className="h-20" />
    </ScrollView>
  );
}
