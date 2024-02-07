import { AppBar, AuthForm, MainBody } from "@components";
import _ from "lodash";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "@providers/auth_provider";
import { useAppTheme } from "@providers/style_provider";

export default function RegisterPage() {
  const { theme } = useAppTheme();
  const { register, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formValid) return;
    setErrorMsg("");
    setLoading(true);
    try {
      await register({ email, password });
      await login({ email, password });
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar title="Sign up" showDrawer={false} showBack={true} />
      <View style={{ padding: theme.spacing.md, display: "flex", alignSelf: "center", width: "100%", flexDirection: "column", flexGrow: 1 }}>
        <AuthForm setEmail={setEmail} setPassword={setPassword} setValid={setFormValid} />
        <View style={{ height: theme.spacing.xl }} />
        <Button mode="contained" buttonColor={theme.colors.primary} onPress={handleRegister} style={{ borderRadius: 4 }} loading={loading}>
          <Text variant="labelMedium" style={{ color: theme.colors.background, fontWeight: "bold" }}>
            Create an account
          </Text>
        </Button>
        <Text style={{ color: theme.colors.error }}>{errorMsg}</Text>
      </View>
    </MainBody>
  );
}
