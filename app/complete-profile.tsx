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
import { User, School, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function CompleteProfile() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [faculty, setFaculty] = useState(user?.faculty || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      await api.put("/auth/profile", { name: name.trim(), faculty: faculty.trim() });
      await refreshProfile();
      // Redirect logic is handled by _layout.tsx once profile is refreshed
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us a bit more about yourself to get started with your orders.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.inputSection}>
          <Text style={styles.label}>FULL NAME</Text>
          <View style={styles.inputWrap}>
            <User size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor="#444"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>FACULTY / DEPARTMENT (OPTIONAL)</Text>
          <View style={styles.inputWrap}>
            <School size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Computer Engineering"
              placeholderTextColor="#444"
              value={faculty}
              onChangeText={setFaculty}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <TouchableOpacity
            style={[styles.ctaBtn, loading && styles.ctaBtnLoading]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.ctaBtnText}>Saving Profile...</Text>
            ) : (
              <>
                <Text style={styles.ctaBtnText}>Continue to Canteen Selection</Text>
                <ArrowRight size={20} color="#000" strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  scroll: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  subtitle: { fontSize: 16, color: "#666", marginTop: 10, lineHeight: 24 },
  inputSection: { marginBottom: 40 },
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
  input: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "600" },
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
});
