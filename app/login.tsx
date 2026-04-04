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
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Utensils,
  Zap,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

export default function Login() {
  const router = useRouter();
  const { intent } = useLocalSearchParams<{ intent: string }>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = intent === "admin";

  const handleSignIn = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase()
      });

      if (error) throw error;

      router.push({
        pathname: "/verify",
        params: { email: email.trim().toLowerCase(), intent },
      });
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#ff6b00" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>

        {/* Header Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.headerSection}
        >
          {/* Role Badge */}
          <View style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.studentBadge]}>
            <View style={[styles.roleIconWrapOuter, styles.roleIconWrap]}>
              {isAdmin
                ? <ShieldCheck size={28} color="#ff6b00" strokeWidth={2.5} />
                : <Utensils size={28} color="#ff6b00" strokeWidth={2.5} />
              }
            </View>
            <View>
              <Text style={styles.roleLabel}>
                {isAdmin ? "Canteen Owner" : "Student"}
              </Text>
              <Text style={styles.roleSubLabel}>
                {isAdmin ? "Admin Portal Access" : "Student Portal Access"}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive a{"\n"}one-time verification code
          </Text>
        </Animated.View>

        {/* Email Input */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.inputSection}
        >
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <View style={[styles.inputWrap, email.length > 0 && styles.inputWrapActive]}>
            <Mail size={20} color={email.length > 0 ? "#ff6b00" : "#555"} strokeWidth={2} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={isAdmin ? "owner@canteen.com" : "student@college.edu"}
              placeholderTextColor="#444"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />
            {email.includes("@") && (
              <View style={styles.validDot} />
            )}
          </View>
          <Text style={styles.inputHint}>
            We'll send a 6-digit OTP to this address
          </Text>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <TouchableOpacity
            style={[styles.ctaBtn, loading && styles.ctaBtnLoading]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.ctaBtnText}>Sending OTP…</Text>
            ) : (
              <>
                <Zap size={20} color="#000" strokeWidth={3} fill="#000" style={styles.ctaBtnZap} />
                <Text style={styles.ctaBtnText}>Send Verification Code</Text>
                <View style={styles.ctaArrow}>
                  <ArrowRight size={16} color="#000" strokeWidth={3} />
                </View>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Info Card */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.infoCard}
        >
          <View style={styles.infoRow}>
            <View style={[styles.infoDotWrap, styles.infoDot]} />
            <Text style={styles.infoText}>No password required — ever</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoDotWrap, styles.infoDot]} />
            <Text style={styles.infoText}>OTP expires in 10 minutes</Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <View style={[styles.infoDotWrap, styles.infoDot]} />
            <Text style={styles.infoText}>Check your spam folder if needed</Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            By continuing, you agree to our{" "}
            <Text style={styles.footerLink}>Terms of Service</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#ff6b0022",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  headerSection: {
    marginBottom: 40,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  roleIconWrapOuter: {
    marginRight: 14,
  },
  adminBadge: {
    backgroundColor: "#ff6b0010",
    borderColor: "#ff6b0030",
  },
  studentBadge: {
    backgroundColor: "#ff6b0010",
    borderColor: "#ff6b0030",
  },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ff6b0015",
    borderWidth: 1,
    borderColor: "#ff6b0025",
    alignItems: "center",
    justifyContent: "center",
  },
  roleLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  roleSubLabel: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  title: {
    fontSize: 38,
    color: "#fff",
    fontWeight: "900",
    letterSpacing: -1.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    color: "#555",
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 10,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1.5,
    borderColor: "#222",
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 64,
  },
  inputIcon: {
    marginRight: 14,
  },
  inputWrapActive: {
    borderColor: "#ff6b0060",
    backgroundColor: "#ff6b0008",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  validDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  inputHint: {
    fontSize: 11,
    color: "#444",
    fontWeight: "500",
    marginTop: 8,
    marginLeft: 4,
  },
  ctaBtnZap: {
    marginRight: 10,
  },
  ctaBtnTextSpacer: {
    flex: 1,
  },
  ctaBtn: {
    height: 64,
    borderRadius: 18,
    backgroundColor: "#ff6b00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    shadowColor: "#ff6b00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 28,
  },
  ctaBtnLoading: {
    opacity: 0.6,
  },
  ctaBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#00000020",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    backgroundColor: "#0f0f0f",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 18,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoDotWrap: {
    marginRight: 10,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff6b00",
  },
  infoText: {
    color: "#555",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "#444",
    fontSize: 11,
    fontWeight: "500",
  },
  footerLink: {
    color: "#ff6b00",
    fontWeight: "700",
  },
});
