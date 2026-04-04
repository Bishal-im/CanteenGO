import { Tabs, Redirect } from "expo-router";
import { ShieldAlert, Users, Store, Loader2 } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { View } from "react-native";

export default function SuperAdminLayout() {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loader2 size={40} color="#ff6b00" className="animate-spin" />
      </View>
    );
  }

  if (!session || role !== 'superadmin') {
    return <Redirect href="/" />;
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
          title: "System Stats",
          tabBarIcon: ({ color }) => <ShieldAlert size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cafeterias"
        options={{
          title: "Cafeterias",
          tabBarIcon: ({ color }) => <Store size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "User Control",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
