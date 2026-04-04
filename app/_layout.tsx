import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { NativeWindStyleSheet } from "nativewind";
import { supabase } from "../lib/supabase";
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
    const inLandingPage = segments[0] === undefined || segments[0] === "index";

    if (!user) {
      // Not logged in - only allow index, login, verify
      if (!inLandingPage && !inAuthGroup) {
        router.replace("/");
      }
    } else if (role) {
      // Logged in with role - redirect to correct dashboard if trying to access wrong area or landing
      if (inLandingPage || inAuthGroup) {
        if (role === 'admin') router.replace("/(admin)");
        else if (role === 'superadmin') router.replace("/(superadmin)");
        else router.replace("/(tabs)");
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
