import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, ScrollView, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/api";

export default function SecurityDashboard({ navigation, setToken, setRole }) {
    // Handle hardware/gesture back navigation: always log out
    useEffect(() => {
      const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
        await AsyncStorage.multiRemove(["token", "token_expiry", "role"]);
        if (setToken) setToken(null);
        if (setRole) setRole(null);
        // Prevent default back action and go to Login
        e.preventDefault();
        navigation.replace("Login");
      });
      return unsubscribe;
    }, [navigation, setToken, setRole]);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleBarCodeScanned = async ({ data: qrValue }) => {
    if (scanned) return;
    setScanned(true);
    setShowCamera(false);
    setLoading(true);
    try {
      const res = await api.post("/watchman/scan-qr", { qrValue });
      const data = res?.data;
      if (data?.name) {
        setScanResult(data);
      } else {
        Toast.show({ type: "error", text1: data?.error || "Person not found" });
        setScanResult(null);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Scan failed", text2: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Toast.show({ type: "error", text1: "Camera permission required" });
        return;
      }
    }
    setScanned(false);
    setScanResult(null);
    setShowCamera(true);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "token_expiry", "role"]);
    if (setToken) setToken(null);
    if (setRole) setRole(null);
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>🔒 Security Portal</Text>
          <Text style={s.headerSub}>Watchman Panel</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Scan Button */}
        <TouchableOpacity style={s.scanBtn} onPress={startScan} disabled={loading}>
          <Text style={s.scanBtnIcon}>📷</Text>
          <Text style={s.scanBtnText}>Scan Delivery Person QR</Text>
          <Text style={s.scanBtnSub}>Point camera at QR code badge</Text>
        </TouchableOpacity>

        {/* Loading */}
        {loading && (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={s.loadingText}>Looking up delivery person…</Text>
          </View>
        )}

        {/* Scan Result */}
        {scanResult && (
          <View style={s.resultCard}>
            <View style={s.resultHeader}>
              <Text style={s.resultTitle}>✅ Delivery Person Found</Text>
            </View>
            {scanResult.image ? (
              <Image
                source={{ uri: scanResult.image }}
                style={s.personImage}
                defaultSource={{ uri: "https://via.placeholder.com/120x120/fee2e2/dc2626?text=ID" }}
              />
            ) : (
              <View style={s.personImagePlaceholder}>
                <Text style={s.personImageInitial}>{scanResult.name?.charAt(0)?.toUpperCase()}</Text>
              </View>
            )}
            <Text style={s.personName}>{scanResult.name}</Text>
            <View style={s.verifiedBadge}>
              <Text style={s.verifiedText}>✓ Verified Delivery Personnel</Text>
            </View>
            <TouchableOpacity style={s.rescanBtn} onPress={() => { setScanResult(null); setScanned(false); }}>
              <Text style={s.rescanText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No result, no loading */}
        {!scanResult && !loading && (
          <View style={s.instructionBox}>
            <Text style={s.instructionIcon}>🔍</Text>
            <Text style={s.instructionTitle}>How to verify a delivery person</Text>
            <Text style={s.instructionText}>1. Tap "Scan Delivery Person QR" above</Text>
            <Text style={s.instructionText}>2. Point the camera at their ID badge QR code</Text>
            <Text style={s.instructionText}>3. Their verified details will appear here</Text>
          </View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide" onRequestClose={() => { setShowCamera(false); setScanned(false); }}>
        <View style={s.cameraContainer}>
          <CameraView
            style={s.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
          <View style={s.cameraOverlay}>
            <View style={s.cameraFrame} />
            <Text style={s.cameraHint}>Align QR code within the frame</Text>
          </View>
          <TouchableOpacity style={s.closeCameraBtn} onPress={() => { setShowCamera(false); setScanned(false); }}>
            <Text style={s.closeCameraText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FEF2F2" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#DC2626", paddingHorizontal: 20, paddingVertical: 18,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "#FECACA", marginTop: 2 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  content: { padding: 20, paddingBottom: 40 },
  scanBtn: {
    backgroundColor: "#DC2626", borderRadius: 16, padding: 28, alignItems: "center",
    marginBottom: 24, shadowColor: "#DC2626", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  scanBtnIcon: { fontSize: 48, marginBottom: 8 },
  scanBtnText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  scanBtnSub: { fontSize: 13, color: "#FECACA", marginTop: 4 },
  loadingBox: { alignItems: "center", padding: 32 },
  loadingText: { marginTop: 12, color: "#64748B", fontSize: 15 },
  resultCard: {
    backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  resultHeader: { marginBottom: 16 },
  resultTitle: { fontSize: 16, fontWeight: "700", color: "#065F46" },
  personImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: "#DC2626", marginBottom: 16 },
  personImagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#DC2626", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  personImageInitial: { fontSize: 48, fontWeight: "800", color: "#fff" },
  personName: { fontSize: 22, fontWeight: "800", color: "#1E293B", marginBottom: 12 },
  verifiedBadge: { backgroundColor: "#D1FAE5", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 20 },
  verifiedText: { color: "#065F46", fontWeight: "700", fontSize: 14 },
  rescanBtn: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#DC2626", borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  rescanText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  instructionBox: { backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  instructionIcon: { fontSize: 40, marginBottom: 12 },
  instructionTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 12, textAlign: "center" },
  instructionText: { fontSize: 14, color: "#64748B", marginBottom: 6, textAlign: "center" },
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  cameraOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  cameraFrame: { width: 240, height: 240, borderWidth: 3, borderColor: "#fff", borderRadius: 12, backgroundColor: "transparent" },
  cameraHint: { color: "#fff", fontSize: 14, marginTop: 20, fontWeight: "600" },
  closeCameraBtn: { position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center" },
  closeCameraText: { color: "#fff", fontSize: 18, fontWeight: "700", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30 },
});
