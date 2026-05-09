import { Ionicons } from "@expo/vector-icons";
import { useGetRequests } from "@workspace/api-client-react";
import type { ServiceRequest } from "@workspace/api-client-react";
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

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  Intake: { color: "#64748b", bg: "#64748b20" },
  Filtering: { color: "#3b82f6", bg: "#3b82f620" },
  Matching: { color: "#6366f1", bg: "#6366f120" },
  Review: { color: "#f59e0b", bg: "#f59e0b20" },
  Active: { color: "#10b981", bg: "#10b98120" },
  Completed: { color: "#64748b", bg: "#64748b15" },
};

const URGENCY_COLOR: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#10b981",
};

const FILTERS = ["All", "Intake", "Matching", "Review", "Active"];

function RequestCard({ item }: { item: ServiceRequest }) {
  const colors = useColors();
  const [pressed, setPressed] = useState(false);
  const statusConf = STATUS_CONFIG[item.status] ?? STATUS_CONFIG["Intake"]!;

  return (
    <Pressable
      onPressIn={() => {
        setPressed(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.participant.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardTopInfo}>
          <Text style={[styles.participantName, { color: colors.foreground }]}>{item.participant}</Text>
          <Text style={[styles.ndisNum, { color: colors.mutedForeground }]}>#{item.ndisNumber}</Text>
        </View>
        <View style={[styles.urgencyDot, { backgroundColor: URGENCY_COLOR[item.urgency] ?? "#64748b" }]} />
      </View>

      <Text style={[styles.serviceName, { color: colors.foreground }]}>{item.service}</Text>

      <View style={styles.cardMeta}>
        <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
          <Text style={[styles.statusText, { color: statusConf.color }]}>{item.status}</Text>
        </View>
        <Text style={[styles.budget, { color: colors.mutedForeground }]}>{item.budget}</Text>
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{item.date}</Text>
      </View>

      {item.provider && (
        <View style={[styles.providerRow, { borderTopColor: colors.border }]}>
          <Ionicons name="person-circle-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.providerText, { color: colors.mutedForeground }]}>{item.provider}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function RequestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : 0;

  const { data: requests = [], isLoading, isError, refetch } = useGetRequests();

  const filtered = requests.filter((r) => {
    const matchFilter = filter === "All" || r.status === filter;
    const matchSearch =
      r.participant.toLowerCase().includes(search.toLowerCase()) ||
      r.service.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Requests</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search requests..."
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
          data={FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setFilter(item); Haptics.selectionAsync(); }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === item ? colors.primary : colors.muted,
                  borderColor: filter === item ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: filter === item ? "#fff" : colors.mutedForeground },
                ]}
              >
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
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Failed to load requests</Text>
          <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          scrollEnabled={!!filtered.length}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RequestCard item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No requests found</Text>
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
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 4,
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
  filterList: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    padding: 16,
    gap: 10,
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
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  cardTopInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  ndisNum: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  budget: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  providerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
