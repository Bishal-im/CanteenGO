import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, User as UserIcon, Settings, Shield, ChevronRight, Mail, Utensils, School, RefreshCw } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ProfileScreen() {
  const { user, role, signOut, refreshProfile } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes, Logout", onPress: () => signOut() },
    ]);
  };

  const handleChangeCanteen = () => {
    Alert.alert(
      "Change Canteen",
      "Are you sure you want to change your linked canteen? You will need to enter a new code to see a different menu.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Change",
          onPress: async () => {
            try {
              // We could have a backend endpoint to "leave" or just clear it here
              // For now, we'll just navigate them back to join-canteen if we clear local state or if backend supports it.
              // A simple way is to update user with cafeteriaId: null
              await api.put("/auth/profile", { cafeteriaId: null });
              await refreshProfile();
              // _layout.tsx will handle the redirect to /join-canteen
            } catch (err) {
              Alert.alert("Error", "Failed to change canteen.");
            }
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header / Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <UserIcon size={40} color="#ff6b00" strokeWidth={2.5} />
        </View>
        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <View style={styles.roleBadge}>
          <Shield size={12} color="#ff6b00" />
          <Text style={styles.roleText}>{role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
        
        {/* Email */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Mail size={20} color="#ff6b00" />
          </View>
          <View>
            <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        {/* Faculty */}
        {user?.faculty && (
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <School size={20} color="#ff6b00" />
            </View>
            <View>
              <Text style={styles.infoLabel}>FACULTY / DEPT</Text>
              <Text style={styles.infoValue}>{user.faculty}</Text>
            </View>
          </View>
        )}

        {/* Current Canteen */}
        {user?.role === 'customer' && (
          <View style={[styles.infoCard, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIcon}>
              <Utensils size={20} color="#ff6b00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>LINKED CANTEEN</Text>
              <Text style={styles.infoValue}>{user.cafeteriaId?.name || "None"}</Text>
              {user.cafeteriaId?.canteenCode && (
                <Text style={styles.subInfo}>Code: {user.cafeteriaId.canteenCode}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.changeBtn} onPress={handleChangeCanteen}>
              <RefreshCw size={16} color="#ff6b00" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Admin Specific */}
      {(role === 'admin' || role === 'superadmin') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANAGEMENT</Text>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push(role === 'admin' ? "/(admin)" : "/(superadmin)")}
          >
            <Shield size={20} color="#ff6b00" />
            <Text style={styles.menuItemText}>Dashboard Access</Text>
            <ChevronRight size={20} color="#444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Settings / Others */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OTHERS</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Settings size={20} color="#ff6b00" />
          <Text style={styles.menuItemText}>Notification Settings</Text>
          <ChevronRight size={20} color="#444" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, styles.logoutBtn]} onPress={handleSignOut}>
          <LogOut size={20} color="#ef4444" />
          <Text style={[styles.menuItemText, { color: "#ef4444" }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808", paddingHorizontal: 24 },
  header: { alignItems: "center", paddingTop: 60, marginBottom: 40 },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#ff6b0030",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  userName: { fontSize: 24, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ff6b0010",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ff6b0020",
  },
  roleText: { color: "#ff6b00", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 10, fontWeight: "900", color: "#444", letterSpacing: 2, marginBottom: 16 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d0d0d",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    marginBottom: 12,
  },
  infoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#ff6b0010", alignItems: "center", justify: "center", marginRight: 16 },
  infoLabel: { fontSize: 9, fontWeight: "900", color: "#555", letterSpacing: 2, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: "700", color: "#fff" },
  subInfo: { fontSize: 12, color: "#666", marginTop: 2, fontWeight: "600" },
  changeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#ff6b0015", alignItems: "center", justifyContent: "center" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d0d0d",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    marginBottom: 10,
  },
  menuItemText: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "700", marginLeft: 16 },
  logoutBtn: { borderColor: "#ef444420", backgroundColor: "#ef444405" },
});
