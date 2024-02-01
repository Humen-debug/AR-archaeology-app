import { AppBar, AuthForm, MainBody } from "@components";
import { useAppTheme } from "@/styles";
import { useApp, Realm } from "@realm/react";
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
      const credentials = Realm.Credentials.emailPassword({ email, password });
      if (app.currentUser?.customData) {
        const providers = app.currentUser.customData.providers || [];
        const isAnonymous = (providers as Array<string>).indexOf("anon-user") !== -1;
        if (isAnonymous) {
          try {
            await app.currentUser.linkCredentials(credentials);
          } catch (error) {
            console.log(`Fail to link credentials`);
          }
        }
      }
      // the app will re-open once the user login, and hence no need to run `router.replace`
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
