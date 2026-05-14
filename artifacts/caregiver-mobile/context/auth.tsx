import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { getMe, setAuthTokenGetter } from "@workspace/api-client-react";
import type { Caregiver } from "@workspace/api-client-react";
import type { QueryClient } from "@tanstack/react-query";

const TOKEN_KEY = "agentryx_auth_token";
const CAREGIVER_KEY = "agentryx_auth_caregiver";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  caregiver: Caregiver | null;
  signIn: (token: string, caregiver: Caregiver) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
  }, []);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!storedToken) return;
        tokenRef.current = storedToken;
        const freshCaregiver = await getMe();
        await SecureStore.setItemAsync(CAREGIVER_KEY, JSON.stringify(freshCaregiver));
        setToken(storedToken);
        setCaregiver(freshCaregiver);
      } catch {
        await Promise.all([
          SecureStore.deleteItemAsync(TOKEN_KEY),
          SecureStore.deleteItemAsync(CAREGIVER_KEY),
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  const signIn = useCallback(async (newToken: string, newCaregiver: Caregiver) => {
    tokenRef.current = newToken;
    queryClient.clear();
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, newToken),
      SecureStore.setItemAsync(CAREGIVER_KEY, JSON.stringify(newCaregiver)),
    ]);
    setToken(newToken);
    setCaregiver(newCaregiver);
  }, [queryClient]);

  const logout = useCallback(async () => {
    tokenRef.current = null;
    queryClient.clear();
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(CAREGIVER_KEY),
    ]);
    setToken(null);
    setCaregiver(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!token,
      isLoading,
      caregiver,
      signIn,
      logout,
    }),
    [token, isLoading, caregiver, signIn, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
