import { AccountListItem, MainBody } from "@/components";
import { useAuth } from "@/providers/auth_provider";
import { useAppTheme, AppTheme } from "@/providers/style_provider";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsPage() {
  const { theme } = useAppTheme();
  const { top: safeTop } = useSafeAreaInsets();
  const style = useStyle({ theme, statusBarHeight: safeTop });

  const { user, logout } = useAuth();
  const authenticated = !!(user && user._id);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (authenticated) {
      setLoading(true);
      try {
        await logout();
      } finally {
        setLoading(false);
      }
    } else {
      router.push("/login");
    }
  }

  return (
    <MainBody padding={{ top: 0 }}>
      <ScrollView>
        <View style={[style.topSection, { minHeight: authenticated ? 132 : 60 }]}>
          {authenticated && (
            <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm }}>
              <Text variant="headlineMedium" style={{ color: theme.colors.textOnPrimary }}>
                Hi, {user.username ? user.username : user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "User"}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.textOnPrimary }}>
                {user.email}
              </Text>
            </View>
          )}
        </View>
        <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
          {authenticated && <AccountListItem label="Profile" prefix="profile" onPress={() => router.push("/account/profile")} />}
          <AccountListItem label="Settings" prefix="setting" onPress={() => router.push("/account/settings")} />
          <AccountListItem label="Help and feedback" prefix="help" />
        </View>
        <View style={{ padding: theme.spacing.lg }}>
          <Button
            loading={loading}
            disabled={loading}
            onPress={handleAuth}
            mode={authenticated ? "outlined" : "contained"}
            textColor={authenticated ? theme.colors.primary : theme.colors.textOnPrimary}
            style={[style.button, authenticated ? style.outlinedButton : {}]}
          >
            {authenticated ? "Sign out" : "Login"}
          </Button>
        </View>
      </ScrollView>
    </MainBody>
  );
}

const useStyle = ({ theme, statusBarHeight }: { theme: AppTheme; statusBarHeight: number }) =>
  StyleSheet.create({
    topSection: {
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: theme.borderRadius.lg,
      borderBottomRightRadius: theme.borderRadius.lg,
      paddingTop: statusBarHeight,

      overflow: "hidden",
    },

    outlinedButton: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    button: {
      borderRadius: theme.borderRadius.xs,
    },
  });
