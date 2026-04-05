import { Tabs, Redirect } from "expo-router";
import { Coffee, ClipboardList, User, Loader2 } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { View } from "react-native";

export default function TabsLayout() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loader2 size={40} color="#ff6b00" className="animate-spin" />
      </View>
    );
  }

  if (!user || role !== 'customer') {
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
          title: "Menu",
          tabBarIcon: ({ color }) => <Coffee size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "My Orders",
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
