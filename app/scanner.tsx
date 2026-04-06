import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { X, Zap, ZapOff } from "lucide-react-native";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Scanner() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // Logic to handle internal codes if they are embedded in URLs
      // For now, support both raw codes and potential URL formats
      let code = data;
      if (data.includes("/customer/")) {
        const parts = data.split("/");
        code = parts[parts.length - 1];
      }

      await api.post("/cafeterias/join", { canteenCode: code.toUpperCase() });
      await refreshProfile();
      Alert.alert("Success", "You have successfully joined the canteen!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Scan Error", error.response?.data?.message || "Invalid QR code.");
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <X color="#fff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.iconBtn}>
              {torch ? <Zap color="#ff6b00" size={24} /> : <ZapOff color="#fff" size={24} />}
            </TouchableOpacity>
          </View>

          <View style={styles.scanAreaContainer}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.bottomBar}>
            <Text style={styles.hint}>Align the Canteen QR code within the frame</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const { width } = Dimensions.get("window");
const scanAreaSize = width * 0.7;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  text: { color: "#fff", marginBottom: 20, textAlign: "center", paddingHorizontal: 40 },
  btn: { backgroundColor: "#ff6b00", padding: 16, borderRadius: 12 },
  btnText: { color: "#000", fontWeight: "900" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanAreaContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    borderWidth: 0,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#ff6b00",
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },
  bottomBar: { paddingBottom: 60, alignItems: "center" },
  hint: { color: "#fff", fontSize: 14, fontWeight: "600", backgroundColor: "rgba(0,0,0,0.6)", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
});
