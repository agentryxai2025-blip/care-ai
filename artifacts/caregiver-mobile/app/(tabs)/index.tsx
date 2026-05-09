import { Feather, Ionicons } from "@expo/vector-icons";
import { useGetDashboard, useGetRequests } from "@workspace/api-client-react";
import type { PipelineStage, ServiceRequest } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  Intake: "#64748b",
  Filtering: "#3b82f6",
  Matching: "#6366f1",
  Review: "#f59e0b",
  Active: "#10b981",
  Completed: "#94a3b8",
};

function StatCard({
  label,
  value,
  icon,
  change,
  positive,
}: {
  label: string;
  value: string;
  icon: string;
  change: string;
  positive: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: colors.primary + "18" }]}>
        <Ionicons name={icon as never} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.statChange}>
        <Ionicons
          name={positive ? "trending-up" : "trending-down"}
          size={12}
          color={positive ? colors.success : colors.destructive}
        />
        <Text style={[styles.statChangeText, { color: positive ? colors.success : colors.destructive }]}>
          {change}
        </Text>
      </View>
    </View>
  );
}

function PipelineBar({ stages }: { stages: PipelineStage[] }) {
  const colors = useColors();
  const total = stages.reduce((s, p) => s + p.count, 0);
  if (total === 0) return null;
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Request Pipeline</Text>
      <View style={styles.pipelineBarWrap}>
        {stages.map((stage, i) => (
          <View
            key={stage.label}
            style={[
              styles.pipelineSegment,
              {
                flex: stage.count,
                backgroundColor: stage.color,
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderBottomLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === stages.length - 1 ? 4 : 0,
                borderBottomRightRadius: i === stages.length - 1 ? 4 : 0,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.pipelineLegend}>
        {stages.map((stage) => (
          <View key={stage.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: stage.color }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>
              {stage.label} ({stage.count})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RecentRequestRow({ item }: { item: ServiceRequest }) {
  const colors = useColors();
  const [pressed, setPressed] = useState(false);
  const statusColor = STATUS_COLORS[item.status] ?? "#64748b";
  return (
    <Pressable
      onPressIn={() => { setPressed(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      onPressOut={() => setPressed(false)}
      style={[
        styles.requestRow,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.requestRowLeft}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.participant.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={[styles.requestParticipant, { color: colors.foreground }]}>
            {item.participant}
          </Text>
          <Text style={[styles.requestService, { color: colors.mutedForeground }]}>
            {item.service}
          </Text>
        </View>
      </View>
      <View style={styles.requestRowRight}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        </View>
        <Text style={[styles.requestTime, { color: colors.mutedForeground }]}>{item.date}</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { data: dashboard, isLoading, isError, refetch } = useGetDashboard();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const topPad = Platform.OS === "web" ? 67 : 0;

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !dashboard) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Failed to load dashboard</Text>
        <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const stats = [
    { label: "Active Participants", value: String(dashboard.activeParticipants), icon: "people", change: "+8", positive: true },
    { label: "Open Requests", value: String(dashboard.openRequests), icon: "document-text", change: "+5", positive: false },
    { label: "Automation Rate", value: `${dashboard.automationRate}%`, icon: "flash", change: "+3%", positive: true },
    { label: "Matched Today", value: String(dashboard.matchedToday), icon: "checkmark-circle", change: "+4", positive: true },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Dashboard</Text>
        </View>
        <View style={[styles.aiBadge, { backgroundColor: colors.primary }]}>
          <Feather name="zap" size={12} color="#fff" />
          <Text style={styles.aiBadgeText}>AI Active</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </View>

      <PipelineBar stages={dashboard.pipeline} />

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Requests</Text>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
        </View>
        {dashboard.recentRequests.map((item) => (
          <RecentRequestRow key={item.id} item={item} />
        ))}
      </View>
    </ScrollView>
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
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  aiBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "47.5%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  statChangeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 12,
  },
  pipelineBarWrap: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    gap: 2,
    marginBottom: 12,
  },
  pipelineSegment: {
    height: "100%",
  },
  pipelineLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  requestRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
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
  requestParticipant: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  requestService: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  requestRowRight: {
    alignItems: "flex-end",
    gap: 4,
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
  requestTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
