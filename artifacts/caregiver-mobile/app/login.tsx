import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLogin } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid = email.trim().length > 0 && password.length > 0;

  async function handleLogin() {
    if (!isValid || loginMutation.isPending) return;
    setError(null);
    try {
      const result = await loginMutation.mutateAsync({ data: { email: email.trim(), password } });
      await signIn(result.token, result.caregiver);
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingBottom: insets.bottom + 24,
      paddingTop: insets.top + 24,
    },
    logo: {
      alignItems: "center",
      marginBottom: 48,
    },
    logoMark: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    logoText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.primaryForeground,
      letterSpacing: 2,
      fontWeight: "600" as const,
    },
    appName: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
      textAlign: "center",
    },
    form: {
      gap: 12,
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      marginBottom: 4,
    },
    inputWrapper: {
      gap: 4,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      backgroundColor: colors.card,
    },
    button: {
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.primaryForeground,
    },
    errorBox: {
      backgroundColor: colors.destructive + "18",
      borderRadius: colors.radius,
      padding: 12,
      marginTop: 4,
    },
    errorText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.destructive,
      textAlign: "center",
    },
    hint: {
      marginTop: 24,
      padding: 14,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
    },
    hintText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 18,
    },
    hintBold: {
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.logo}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>Ax</Text>
          </View>
          <Text style={styles.appName}>Agentryx</Text>
          <Text style={styles.tagline}>Care coordination, simplified</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@agentryx.care"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              testID="email-input"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              testID="password-input"
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={[styles.button, (!isValid || loginMutation.isPending) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!isValid || loginMutation.isPending}
            testID="login-button"
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Demo accounts:{" "}
            <Text style={styles.hintBold}>maria@agentryx.care</Text>,{" "}
            <Text style={styles.hintBold}>sarah@agentryx.care</Text>,{" "}
            <Text style={styles.hintBold}>tom@agentryx.care</Text>
            {"\n"}Password: <Text style={styles.hintBold}>password123</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
