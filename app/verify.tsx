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
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, RefreshCw, Mail } from "lucide-react-native";
import { supabase } from "../lib/supabase";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

const OTP_LENGTH = 6;

export default function Verify() {
  const router = useRouter();
  const { email, intent } = useLocalSearchParams<{ email: string; intent: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef<(TextInput | null)[]>([]);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleOtpChange = (text: string, index: number) => {
    // Only accept digits
    const digit = text.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    // Auto-advance to next box when a digit is entered
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length < OTP_LENGTH) {
      Alert.alert("Incomplete Code", "Please enter all 6 digits of your OTP.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) throw error;

      // Create profile if first time
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            name: user.email?.split("@")[0],
            role: intent === "admin" ? "admin" : "customer",
          });
          if (profileError) console.warn("Profile creation error:", profileError.message);
        }
      }
      // AuthContext will detect the new session and handle redirect automatically
    } catch (error: any) {
      Alert.alert("Verification Failed", error.message || "Invalid or expired code. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setResendCooldown(60);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (error: any) {
      Alert.alert("Resend Failed", error.message);
    }
  };

  const isComplete = otp.every(d => d !== "");

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

        {/* Email Badge */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.emailBadge}
        >
          <Animated.View style={[styles.emailIconWrapOuter, styles.emailIconWrap, pulseStyle]}>
            <Mail size={22} color="#ff6b00" strokeWidth={2.5} />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emailBadgeLabel}>CODE SENT TO</Text>
            <Text style={styles.emailBadgeValue} numberOfLines={1}>{email}</Text>
          </View>
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(500)}
          style={styles.header}
        >
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to verify your identity
          </Text>
        </Animated.View>

        {/* OTP Inputs */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(500)}
          style={styles.otpSection}
        >
          <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : {},
                  index === otp.findIndex(d => d === "") && styles.otpInputActive,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>
        </Animated.View>

        {/* Verify Button */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              !isComplete && styles.ctaBtnDisabled,
              loading && styles.ctaBtnLoading,
            ]}
            onPress={handleVerify}
            disabled={loading || !isComplete}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.ctaBtnText}>Verifying…</Text>
            ) : (
              <>
                <CheckCircle2
                  size={20}
                  color={isComplete ? "#000" : "#555"}
                  strokeWidth={2.5}
                  style={styles.ctaBtnIcon}
                />
                <Text style={[styles.ctaBtnText, !isComplete && styles.ctaBtnTextDisabled]}>
                  Verify & Enter
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Resend Section */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.resendSection}
        >
          <Text style={[styles.resendHint, styles.resendSectionHint]}>Didn't receive the code?</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCooldown > 0}
            style={styles.resendBtn}
            activeOpacity={0.7}
          >
            <RefreshCw size={14} color={resendCooldown > 0 ? "#444" : "#ff6b00"} strokeWidth={2.5} style={styles.resendBtnIcon} />
            <Text style={[styles.resendText, resendCooldown > 0 && styles.resendTextDisabled]}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Security Note */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={styles.securityNote}
        >
          <Text style={styles.securityText}>
            🔒 This code expires in 10 minutes and can only be used once
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
    marginBottom: 28,
  },
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  emailIconWrapOuter: {
    marginRight: 14,
  },
  emailIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ff6b0015",
    borderWidth: 1,
    borderColor: "#ff6b0025",
    alignItems: "center",
    justifyContent: "center",
  },
  emailBadgeLabel: {
    fontSize: 9,
    color: "#555",
    fontWeight: "900",
    letterSpacing: 2.5,
    marginBottom: 3,
  },
  emailBadgeValue: {
    fontSize: 14,
    color: "#ff6b00",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "900",
    letterSpacing: -1.2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    lineHeight: 21,
  },
  otpSection: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 10,
    color: "#555",
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 14,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpInput: {
    // Fixed width: (screenWidth - 48px padding - 40px gaps) / 6 boxes
    width: Math.floor((Dimensions.get("window").width - 48 - 40) / 6),
    height: 60,
    borderRadius: 14,
    backgroundColor: "#111",
    borderWidth: 1.5,
    borderColor: "#222",
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: "#ff6b00",
    backgroundColor: "#ff6b0010",
    color: "#ff6b00",
  },
  otpInputActive: {
    borderColor: "#ff6b0060",
  },
  ctaBtnIcon: {
    marginRight: 8,
  },
  ctaBtn: {
    height: 64,
    borderRadius: 18,
    backgroundColor: "#ff6b00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff6b00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  ctaBtnDisabled: {
    backgroundColor: "#1a1a1a",
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnLoading: {
    opacity: 0.7,
  },
  ctaBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  ctaBtnTextDisabled: {
    color: "#555",
  },
  resendSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  resendSectionHint: {
    marginBottom: 10,
  },
  resendHint: {
    color: "#444",
    fontSize: 13,
    fontWeight: "500",
  },
  resendBtnIcon: {
    marginRight: 6,
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#ff6b0010",
    borderWidth: 1,
    borderColor: "#ff6b0020",
  },
  resendText: {
    color: "#ff6b00",
    fontSize: 13,
    fontWeight: "700",
  },
  resendTextDisabled: {
    color: "#444",
  },
  securityNote: {
    backgroundColor: "#0f0f0f",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 14,
    alignItems: "center",
  },
  securityText: {
    color: "#444",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
});
