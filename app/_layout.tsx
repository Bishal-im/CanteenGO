import { Stack, useRouter, useSegments, usePathname, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { NativeWindStyleSheet } from "nativewind";
import { View, ActivityIndicator } from "react-native";
import "../global.css";

NativeWindStyleSheet.setOutput({
  default: "native",
});

function RootLayoutNav() {
  const { user, role, loading, isLoggingOut } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (loading || isLoggingOut || !navigationState?.key) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "verify";
    const isRoot = pathname === "/" || pathname === "/index";

    console.log(`[Nav] Sync - User: ${!!user}, Path: ${pathname}`);

    if (!user) {
      if (!isRoot && !inAuthGroup) {
        router.replace("/");
      }
    } else if (role) {
      const inAuthGroup = segments[0] === "login" || segments[0] === "verify";
      const inOnboardingGroup = segments[0] === "complete-profile" || segments[0] === "join-canteen" || segments[0] === "scanner";

      if (role === 'customer') {
        if (!user.isProfileComplete) {
          if (pathname !== "/complete-profile") {
            console.log("[Nav] Redirecting to complete-profile");
            router.replace("/complete-profile");
          }
        } else if (isRoot || inAuthGroup || inOnboardingGroup) {
          console.log("[Nav] User setup complete. Redirecting to tabs.");
          router.replace("/(tabs)");
        }
      } else {
        // Admin / SuperAdmin logic
        if (isRoot || inAuthGroup) {
          const dest = role === 'admin' ? "/(admin)" : "/(superadmin)";
          router.replace(dest as any);
        }
      }
    }
  }, [user, role, loading, isLoggingOut, segments, pathname, navigationState?.key]);

  if (loading || isLoggingOut) {
    return (
      <View style={{ flex: 1, backgroundColor: '#080808', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(superadmin)" />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="verify" options={{ presentation: 'modal' }} />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="join-canteen" />
      <Stack.Screen name="scanner" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootLayoutNav />
        <StatusBar style="light" />
      </CartProvider>
    </AuthProvider>
  );
}
