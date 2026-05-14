import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { caregiver, logout } = useAuth();

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  }

  const s = styles(colors);

  return (
    <ScrollView
      style={[s.container, { paddingTop: insets.top }]}
      contentContainerStyle={s.content}
    >
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {caregiver?.name
              ? caregiver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "?"}
          </Text>
        </View>
        <Text style={s.name}>{caregiver?.name ?? "Caregiver"}</Text>
        <Text style={s.email}>{caregiver?.email ?? ""}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{caregiver?.role ?? "Caregiver"}</Text>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>Account</Text>
        <Pressable style={s.row} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text style={[s.rowText, { color: "#ef4444" }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function styles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 24,
      gap: 24,
    },
    header: {
      alignItems: "center",
      paddingVertical: 24,
      gap: 8,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    avatarText: {
      color: "#fff",
      fontSize: 28,
      fontWeight: "700",
    },
    name: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
    },
    email: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    roleBadge: {
      marginTop: 4,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 99,
      backgroundColor: colors.muted,
    },
    roleText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.mutedForeground,
      textTransform: "capitalize",
    },
    section: {
      gap: 4,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowText: {
      fontSize: 15,
      fontWeight: "500",
    },
  });
}
