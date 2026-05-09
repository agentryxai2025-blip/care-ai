import { Ionicons } from "@expo/vector-icons";
import { useGetParticipants } from "@workspace/api-client-react";
import type { Participant } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const STATUS_COLOR: Record<string, string> = {
  Active: "#10b981",
  Review: "#f59e0b",
  Inactive: "#64748b",
};

const AVATAR_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function BudgetBar({ spent, total, color }: { spent: number; total: number; color: string }) {
  const pct = Math.min(spent / total, 1);
  const colors = useColors();
  return (
    <View style={[styles.budgetBarBg, { backgroundColor: colors.muted }]}>
      <View style={[styles.budgetBarFill, { width: `${Math.round(pct * 100)}%` as `${number}%`, backgroundColor: color }]} />
    </View>
  );
}

function ParticipantCard({ item, index }: { item: Participant; index: number }) {
  const colors = useColors();
  const [pressed, setPressed] = useState(false);
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length] ?? "#6366f1";
  const pct = Math.round((item.spent / item.budget) * 100);
  const budgetColor = pct > 80 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#10b981";

  return (
    <Pressable
      onPressIn={() => {
        setPressed(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: avatarColor + "25" }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>
            {item.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardTopInfo}>
          <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Age {item.age} · #{item.ndisNumber}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[item.status] ?? "#64748b") + "20" }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] ?? "#64748b" }]}>{item.status}</Text>
        </View>
      </View>

      <Text style={[styles.planName, { color: colors.mutedForeground }]}>{item.plan}</Text>
      <Text style={[styles.goal, { color: colors.foreground }]}>{item.primaryGoal}</Text>

      <View style={styles.budgetSection}>
        <View style={styles.budgetLabelRow}>
          <Text style={[styles.budgetLabel, { color: colors.mutedForeground }]}>Budget utilised</Text>
          <Text style={[styles.budgetPct, { color: budgetColor }]}>{pct}%</Text>
        </View>
        <BudgetBar spent={item.spent} total={item.budget} color={budgetColor} />
        <View style={styles.budgetAmounts}>
          <Text style={[styles.budgetAmount, { color: colors.mutedForeground }]}>
            ${item.spent.toLocaleString()} spent
          </Text>
          <Text style={[styles.budgetAmount, { color: colors.mutedForeground }]}>
            ${item.budget.toLocaleString()} total
          </Text>
        </View>
      </View>

      <View style={[styles.coordRow, { borderTopColor: colors.border }]}>
        <Ionicons name="person-outline" size={12} color={colors.mutedForeground} />
        <Text style={[styles.coordText, { color: colors.mutedForeground }]}>{item.coordinator}</Text>
      </View>
    </Pressable>
  );
}

export default function ParticipantsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : 0;

  const { data: participants = [], isLoading, isError, refetch } = useGetParticipants();

  const filtered = participants.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ndisNumber.includes(search);
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Participants</Text>
          <Text style={[styles.countBadge, { color: colors.primary, backgroundColor: colors.primary + "15" }]}>
            {filtered.length}
          </Text>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name or NDIS #"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <FlatList
          horizontal
          data={["All", "Active", "Review", "Inactive"]}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setStatusFilter(item); Haptics.selectionAsync(); }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: statusFilter === item ? colors.primary : colors.muted,
                  borderColor: statusFilter === item ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: statusFilter === item ? "#fff" : colors.mutedForeground }}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Failed to load participants</Text>
          <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          scrollEnabled={!!filtered.length}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => <ParticipantCard item={item} index={index} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 10 }}>
              <Ionicons name="people-outline" size={40} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 15, fontFamily: "Inter_400Regular" }}>
                No participants found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  countBadge: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cardTopInfo: { flex: 1 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  planName: { fontSize: 12, fontFamily: "Inter_400Regular" },
  goal: { fontSize: 14, fontFamily: "Inter_500Medium" },
  budgetSection: { gap: 5 },
  budgetLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  budgetLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  budgetPct: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  budgetBarBg: { height: 4, borderRadius: 2 },
  budgetBarFill: { height: 4, borderRadius: 2 },
  budgetAmounts: { flexDirection: "row", justifyContent: "space-between" },
  budgetAmount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  coordText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
