import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { QrCode, ArrowRight, CheckCircle2, Search, X } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlassCard } from "../components/GlassCard";

export default function JoinCanteen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [canteenCode, setCanteenCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!canteenCode.trim()) {
      Alert.alert("Missing Code", "Please enter a canteen code.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/cafeterias/join", { canteenCode: canteenCode.trim().toUpperCase() });
      await refreshProfile();
      // Redirect logic is handled by _layout.tsx once cafeteriaId is set
    } catch (error: any) {
      Alert.alert("Invalid Code", error.response?.data?.message || "Canteen not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Mark profile as complete so navigation guard lets them into tabs
      await api.put("/auth/profile", { isProfileComplete: true });
      await refreshProfile();
      // Redirect handled by _layout.tsx
    } catch (error) {
      console.error("Skip error:", error);
      router.replace("/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <Text style={styles.title}>Join Your Canteen</Text>
          <Text style={styles.subtitle}>
            Enter the unique code provided by your canteen or scan their QR code to access the menu.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.inputSection}>
          <Text style={styles.label}>CANTEEN CODE</Text>
          <GlassCard borderRadius={20} intensity={40} containerStyle={{ backgroundColor: '#111' }} style={{ padding: 0, height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
            <Search size={20} color="#ff6b00" strokeWidth={2.5} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { height: '100%', marginBottom: 0 }]}
              placeholder="e.g. CAFE123"
              placeholderTextColor="#444"
              value={canteenCode}
              onChangeText={setCanteenCode}
              autoCapitalize="characters"
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.actions}>
          <TouchableOpacity
            style={[styles.ctaBtn, loading && styles.ctaBtnLoading, { shadowColor: '#ff6b00', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 }]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.ctaBtnText}>Joining...</Text>
            ) : (
              <>
                <Text style={styles.ctaBtnText}>Join with Code</Text>
                <ArrowRight size={20} color="#000" strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: '#ff6b0010' }]}
            onPress={() => router.push("/scanner")}
            disabled={loading}
          >
            <QrCode size={24} color="#ff6b00" strokeWidth={2.5} />
            <Text style={styles.scanBtnText}>Scan Canteen QR</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.help}>
          <Text style={styles.helpText}>
            Can't find the code? Ask your canteen operator for the "Canteen Joining Code".
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  scroll: { padding: 24, paddingTop: 60 },
  topActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  skipText: { color: '#666', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, textDecorationLine: 'underline' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  subtitle: { fontSize: 16, color: "#666", marginTop: 10, lineHeight: 24 },
  inputSection: { marginBottom: 24 },
  label: { fontSize: 10, fontWeight: "900", color: "#555", letterSpacing: 2, marginBottom: 12 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1.5,
    borderColor: "#222",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  actions: { gap: 16 },
  ctaBtn: {
    height: 60,
    backgroundColor: "#ff6b00",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaBtnLoading: { opacity: 0.7 },
  ctaBtnText: { color: "#000", fontSize: 16, fontWeight: "900" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: "#222" },
  dividerText: { marginHorizontal: 15, color: "#444", fontWeight: "900", fontSize: 12 },
  scanBtn: {
    height: 60,
    backgroundColor: "#ff6b0010",
    borderWidth: 1,
    borderColor: "#ff6b0030",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  scanBtnText: { color: "#ff6b00", fontSize: 16, fontWeight: "900" },
  help: { marginTop: 40, alignItems: "center" },
  helpText: { color: "#444", fontSize: 12, textAlign: "center", fontWeight: "600", lineHeight: 20 },
});
