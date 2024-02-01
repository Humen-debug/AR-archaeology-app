import { Button, Text, TextInput } from "react-native-paper";
import { useAppTheme } from "@styles";
import MainBody from "@components/main_body";
import { useState } from "react";
import { Link, router } from "expo-router";
import { AuthForm } from "@/components/auth_form";
import { View } from "react-native";
import { AppBar } from "@/components/app_bar";
import { useApp } from "@realm/react";
import Realm from "realm";
import _ from "lodash";

export default function LoginPage() {
  const theme = useAppTheme();
  const app = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formValid) return;
    setErrorMsg("");
    const credentials = Realm.Credentials.emailPassword({ email, password });
    setLoading(true);
    try {
      await app.logIn(credentials);
    } catch (error) {
      console.log(error);
      setErrorMsg(error.message);
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
          buttonColor={theme.colors.highlight}
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
          style={{ borderRadius: 4, borderColor: theme.colors.highlight }}
          loading={loading}
          disabled={loading}
        >
          <Text variant="labelMedium" style={{ color: theme.colors.highlight, fontWeight: "bold" }}>
            Sign up
          </Text>
        </Button>
      </View>
    </MainBody>
  );
}
