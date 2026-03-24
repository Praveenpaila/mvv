import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "../../api/api";

const template = `id,price,quantity
64f1c2a3b4c5d6e7f8a9b0c1,50,25`;

export default function MerchantBulkManage() {
  const [csvText, setCsvText] = useState(template);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const upload = async () => {
    const trimmed = (csvText || "").trim();
    if (!trimmed) {
      Toast.show({ type: "error", text1: "Paste CSV content first" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/bulkManageText", { csv: trimmed });
      if (res.data?.success) {
        setResult(res.data);
        Toast.show({
          type: "success",
          text1: res.data.message || "Bulk update completed",
        });
      } else {
        throw new Error(res.data?.message || "Bulk update failed");
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || err?.message || "Bulk update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Bulk Manage</Text>
        <Text style={s.subtitle}>
          Paste a CSV to update your product price and stock in one go.
        </Text>

        <View style={s.card}>
          <Text style={s.label}>CSV format</Text>
          <Text style={s.hint}>Columns: id, price, quantity</Text>

          <Text style={s.label}>CSV content</Text>
          <TextInput
            style={s.textarea}
            value={csvText}
            onChangeText={setCsvText}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={upload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Upload CSV</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={s.resultCard}>
            <Text style={s.resultTitle}>Result</Text>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>Updated</Text>
              <Text style={s.resultValue}>{result.updatedCount ?? 0}</Text>
            </View>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>Not found</Text>
              <Text style={s.resultValue}>
                {Array.isArray(result.notFound) ? result.notFound.length : 0}
              </Text>
            </View>
            <View style={[s.resultRow, { borderBottomWidth: 0 }]}>
              <Text style={s.resultLabel}>Errors</Text>
              <Text style={s.resultValue}>
                {Array.isArray(result.errors) ? result.errors.length : 0}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5FF" },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: "900", color: "#1E293B" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 6, marginBottom: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 12, fontWeight: "800", color: "#334155", marginBottom: 6, marginTop: 10 },
  hint: { fontSize: 12, color: "#64748B" },
  textarea: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 200,
    fontSize: 13,
    color: "#0f172a",
    marginTop: 6,
    backgroundColor: "#fff",
  },
  btn: { backgroundColor: "#8B5CF6", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  btnDisabled: { backgroundColor: "#C4B5FD" },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  resultCard: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  resultTitle: { fontSize: 16, fontWeight: "900", color: "#1E293B", marginBottom: 10 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  resultLabel: { fontSize: 13, color: "#64748B", fontWeight: "700" },
  resultValue: { fontSize: 13, color: "#1E293B", fontWeight: "900" },
});

