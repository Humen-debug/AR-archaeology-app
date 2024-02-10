import { Button, Text } from "react-native-paper";
import { MainBody, Form, AppBar } from "@components";
import { useState } from "react";
import { Link, router } from "expo-router";
import { StyleSheet, View } from "react-native";
import _ from "lodash";
import { useAuth } from "@providers/auth_provider";
import { useAppTheme, AppTheme } from "@providers/style_provider";
import * as rules from "@/plugins/rules";

export default function LoginPage() {
  const { theme } = useAppTheme();
  const style = useStyle({ theme });

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formValid) return;
    setErrorMsg("");
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/");
    } catch (error) {
      console.log(error);
      setErrorMsg(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar title="Login" />
      <View
        style={{
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Form
          setValid={setFormValid}
          fields={[
            {
              value: email,
              onChange: setEmail,
              validator: [rules.required, rules.email],
              label: "Email",
              keyboardType: "email-address",
            },
            {
              value: password,
              onChange: setPassword,
              validator: [rules.required, rules.password],
              label: "Password",
              keyboardType: "visible-password",
            },
          ]}
        />
        <View style={[style.row, { gap: theme.spacing.xxs }]}>
          <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
            Forget the password?
          </Text>
          <Link href={"/register"} style={{ color: theme.colors.grey1, paddingVertical: theme.spacing.xs }}>
            <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
              Reset the password
            </Text>
          </Link>
        </View>

        <View style={{ height: theme.spacing.xl }} />
        <Button
          mode="contained"
          buttonColor={theme.colors.primary}
          onPress={handleLogin}
          style={style.largeButton}
          labelStyle={{ marginHorizontal: theme.spacing.lg, marginVertical: theme.spacing.sm }}
          loading={loading}
          disabled={loading}
        >
          <Text variant="labelLarge" style={{ color: theme.colors.textOnPrimary, fontWeight: "bold" }}>
            Login
          </Text>
        </Button>
        <Text style={{ color: theme.colors.error }}>{errorMsg}</Text>
        <View style={{ height: theme.spacing.md }} />
        <View style={[style.row, { gap: theme.spacing.xxs, justifyContent: "center" }]}>
          <Text variant="bodyLarge" style={{ color: theme.colors.text }}>
            Don't have an account?
          </Text>
          <Button
            mode="text"
            onPress={() => router.push("/register")}
            style={{ borderRadius: 4, borderColor: theme.colors.primary }}
            loading={loading}
            disabled={loading}
          >
            <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
              Sign up
            </Text>
          </Button>
        </View>
      </View>
    </MainBody>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    largeButton: {
      borderRadius: 4,
      minHeight: 48,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
  });
