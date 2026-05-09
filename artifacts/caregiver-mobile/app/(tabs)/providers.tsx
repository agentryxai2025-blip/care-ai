import { Ionicons } from "@expo/vector-icons";
import { useGetProviders } from "@workspace/api-client-react";
import type { Provider } from "@workspace/api-client-react";
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

const CATEGORY_COLORS: Record<string, string> = {
  "Home Support": "#6366f1",
  "Allied Health": "#3b82f6",
  Transport: "#10b981",
  "Plan Management": "#f59e0b",
  Community: "#8b5cf6",
};

const STATUS_COLOR: Record<string, string> = {
  Active: "#10b981",
  Screening: "#f59e0b",
  Suspended: "#ef4444",
};

function StarRating({ rating }: { rating: number }) {
  const colors = useColors();
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < full ? "star" : hasHalf && i === full ? "star-half" : "star-outline"}
          size={12}
          color="#f59e0b"
        />
      ))}
      <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground, marginLeft: 2 }}>
        {rating}
      </Text>
    </View>
  );
}

function ProviderCard({ item }: { item: Provider }) {
  const colors = useColors();
  const [pressed, setPressed] = useState(false);
  const catColor = CATEGORY_COLORS[item.category] ?? "#64748b";
  const statusColor = STATUS_COLOR[item.status] ?? "#64748b";

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
        <View style={[styles.logoBox, { backgroundColor: catColor + "20" }]}>
          <Ionicons name="business" size={20} color={catColor} />
        </View>
        <View style={styles.cardTopInfo}>
          <Text style={[styles.providerName, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.abn, { color: colors.mutedForeground }]}>ABN {item.abn}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.categoryBadge, { backgroundColor: catColor + "15" }]}>
          <Text style={[styles.categoryText, { color: catColor }]}>{item.category}</Text>
        </View>
        <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
        <Text style={[styles.location, { color: colors.mutedForeground }]}>{item.location}</Text>
      </View>

      <StarRating rating={item.rating} />
      <Text style={[styles.reviews, { color: colors.mutedForeground }]}>{item.reviews} reviews</Text>

      <View style={styles.specialtiesRow}>
        {item.specialties.map((s) => (
          <View key={s} style={[styles.specialtyChip, { backgroundColor: colors.muted }]}>
            <Text style={[styles.specialtyText, { color: colors.mutedForeground }]}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statVal, { color: colors.foreground }]}>{item.participants}</Text>
          <Text style={[styles.statLab, { color: colors.mutedForeground }]}>Participants</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Ionicons name="timer-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statVal, { color: colors.foreground }]}>{item.responseTime}</Text>
          <Text style={[styles.statLab, { color: colors.mutedForeground }]}>Response</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ProvidersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : 0;

  const { data: providers = [], isLoading, isError, refetch } = useGetProviders();

  const categories = ["All", ...Array.from(new Set(providers.map((p) => p.category)))];

  const filtered = providers.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
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
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Providers</Text>
          <Text style={[styles.countBadge, { color: colors.primary, backgroundColor: colors.primary + "15" }]}>
            {filtered.length}
          </Text>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search providers..."
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
          data={categories}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setCatFilter(item); Haptics.selectionAsync(); }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: catFilter === item ? colors.primary : colors.muted,
                  borderColor: catFilter === item ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: catFilter === item ? "#fff" : colors.mutedForeground }}>
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
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Failed to load providers</Text>
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
          renderItem={({ item }) => <ProviderCard item={item} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 10 }}>
              <Ionicons name="business-outline" size={40} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 15, fontFamily: "Inter_400Regular" }}>
                No providers found
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
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTopInfo: { flex: 1 },
  providerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  abn: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  location: { fontSize: 12, fontFamily: "Inter_400Regular" },
  reviews: { fontSize: 12, fontFamily: "Inter_400Regular" },
  specialtiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  specialtyChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  specialtyText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statsRow: {
    flexDirection: "row",
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 16,
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statLab: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: "100%" },
});
