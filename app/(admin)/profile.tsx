import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, User, Shield, Mail, ChevronRight, Home } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

export default function AdminProfile() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to sign out?")) {
        signOut();
      }
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const roleLabel = role === 'superadmin' ? 'Super Administrator' : 'Administrator';
  const roleBadgeColor = role === 'superadmin' ? 'border-purple-500/30 bg-purple-500/10' : 'border-primary/20 bg-primary/10';
  const roleTextColor = role === 'superadmin' ? 'text-purple-400' : 'text-primary';
  const iconColor = role === 'superadmin' ? '#a855f7' : '#ff6b00';

  return (
    <ScrollView className="flex-1 bg-background px-6">
      {/* Avatar & Identity */}
      <View className="pt-20 pb-12 items-center">
        <View
          className="w-24 h-24 rounded-[32px] border items-center justify-center mb-6 shadow-2xl rotate-3"
          style={{ backgroundColor: role === 'superadmin' ? '#a855f710' : '#ff6b0010', borderColor: iconColor + '33' }}
        >
          <User size={48} color={iconColor} strokeWidth={2.5} />
        </View>
        <Text className="text-3xl font-black text-white italic tracking-tighter uppercase">
          {user?.name || user?.email?.split('@')[0]}
        </Text>
        <View className={`flex-row items-center gap-2 mt-4 px-6 py-2 rounded-full border ${roleBadgeColor}`}>
          <Shield size={12} color={iconColor} strokeWidth={2.5} />
          <Text className={`text-[11px] font-black uppercase tracking-[3px] ${roleTextColor}`}>
            {roleLabel}
          </Text>
        </View>
      </View>

      {/* Info Cards */}
      <View className="space-y-4">
        <View className="flex-row items-center gap-4 p-5 bg-card border border-white/5 rounded-3xl">
          <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10">
            <Mail size={18} color="#666" strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-gray-600 text-[9px] font-black uppercase tracking-[3px] mb-0.5">Email</Text>
            <Text className="text-white font-black text-base italic">{user?.email}</Text>
          </View>
        </View>

        {/* Go to Landing */}
        <TouchableOpacity
          onPress={() => router.replace("/")}
          className="flex-row items-center justify-between p-5 bg-card border border-white/5 rounded-3xl"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10">
              <Home size={18} color="#666" strokeWidth={2.5} />
            </View>
            <Text className="text-white font-black text-base italic tracking-tighter">Exit to Home</Text>
          </View>
          <ChevronRight size={18} color="#444" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center justify-between p-5 bg-red-500/5 border border-red-500/10 rounded-3xl mt-6"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center">
              <LogOut size={18} color="#ef4444" strokeWidth={2.5} />
            </View>
            <Text className="text-red-500 font-black text-base italic tracking-tighter uppercase">Sign Out</Text>
          </View>
          <ChevronRight size={18} color="#ef444466" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View className="h-24" />
    </ScrollView>
  );
}
