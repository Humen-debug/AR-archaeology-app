import { AppBar } from "@/components/app_bar";
import { AuthForm } from "@/components/auth_form";
import MainBody from "@/components/main_body";
import Realm from "realm";
import { useAppTheme } from "@/styles";
import { useApp } from "@realm/react";
import _ from "lodash";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function RegisterPage() {
  const theme = useAppTheme();
  const app = useApp();

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
      await app.emailPasswordAuth.registerUser({ email, password });
      // the app will re-open once the user login, and hence no need to run `router.replace`
      await app.logIn(Realm.Credentials.emailPassword({ email, password }));
    } catch (error) {
      console.log(error);
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
        <Button mode="contained" buttonColor={theme.colors.highlight} onPress={handleRegister} style={{ borderRadius: 4 }} loading={loading}>
          <Text variant="labelMedium" style={{ color: theme.colors.background, fontWeight: "bold" }}>
            Create an account
          </Text>
        </Button>
        <Text style={{ color: theme.colors.error }}>{errorMsg}</Text>
      </View>
    </MainBody>
  );
}
