import { Tabs, Redirect } from "expo-router";
import { LayoutDashboard, ClipboardList, Package, UserCircle, Loader2 } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { View } from "react-native";

export default function AdminLayout() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loader2 size={40} color="#ff6b00" className="animate-spin" />
      </View>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#080808",
          borderTopColor: "#171717",
          height: 90,
          paddingBottom: 22,
          paddingTop: 10,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#ff6b00",
        tabBarInactiveTintColor: "#333",
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="kitchen"
        options={{
          title: "Kitchen",
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: "Manage Menu",
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
