import { Button, Text, TextInput } from "react-native-paper";
import { MainBody, AuthForm, AppBar } from "@components";
import { useState } from "react";
import { Link, router } from "expo-router";
import { View } from "react-native";
import _ from "lodash";
import { useAuth } from "@providers/auth_provider";
import { useAppTheme } from "@providers/style_provider";

export default function LoginPage() {
  const { theme } = useAppTheme();
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
      <View style={{ padding: theme.spacing.md, display: "flex", alignSelf: "center", width: "100%", flexDirection: "column", flexGrow: 1 }}>
        <AuthForm setEmail={setEmail} setPassword={setPassword} setValid={setFormValid} />
        <Link href={"/register"} style={{ color: theme.colors.grey1, marginTop: theme.spacing.sm }}>
          Having trouble with login? Reset Password
        </Link>
        <View style={{ height: 2 * theme.spacing.xl }} />
        <Button
          mode="contained"
          buttonColor={theme.colors.primary}
          onPress={handleLogin}
          style={{ borderRadius: 4 }}
          loading={loading}
          disabled={loading}
        >
          <Text variant="labelMedium" style={{ color: theme.colors.background, fontWeight: "bold" }}>
            Login
          </Text>
        </Button>
        <Text style={{ color: theme.colors.error }}>{errorMsg}</Text>
        <View style={{ height: theme.spacing.xl }} />
        <Button
          mode="outlined"
          onPress={() => router.push("/register")}
          style={{ borderRadius: 4, borderColor: theme.colors.primary }}
          loading={loading}
          disabled={loading}
        >
          <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
            Sign up
          </Text>
        </Button>
      </View>
    </MainBody>
  );
}
