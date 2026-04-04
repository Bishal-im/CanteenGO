import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { NativeWindStyleSheet } from "nativewind";
import "../global.css";

NativeWindStyleSheet.setOutput({
  default: "native",
});

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "verify";
    const inLandingPage = segments[0] === undefined || segments[0] === "";

    console.log("[Navigation] State - User:", !!user, "Role:", role, "Segments:", segments);

    if (!user) {
      if (!inLandingPage && !inAuthGroup) {
        console.log("[Navigation] Redirecting to / (Not Logged In)");
        router.replace("/");
      }
    } else if (role) {
      if (inLandingPage || inAuthGroup) {
        const dest = role === 'admin' ? "/(admin)" : role === 'superadmin' ? "/(superadmin)" : "/(tabs)";
        console.log("[Navigation] Redirecting to:", dest);
        router.replace(dest as any);
      }
    }
  }, [user, role, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="verify" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
      <StatusBar style="light" />
    </AuthProvider>
  );
}
