import { Button, Text, TextInput } from "react-native-paper";
import { useAppTheme } from "@styles";
import MainBody from "@components/main_body";
import { useEmailPasswordAuth } from "@realm/react";
import { useState } from "react";
import { Link } from "expo-router";

export default function LoginPage() {
  const theme = useAppTheme();

  const { logIn, result } = useEmailPasswordAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    try {
      logIn({ email, password });
    } catch (error) {
      console.log("Fail to login", error);
    }
  };

  return (
    <MainBody>
      <TextInput
        label={"Email"}
        value={email}
        keyboardType="email-address"
        onChangeText={(value) => {
          setEmail(value);
        }}
      />
      <TextInput
        label={"Password"}
        value={password}
        onChangeText={(value) => {
          setPassword(value);
        }}
      />
      <Button onPress={handleLogin} buttonColor={theme.colors.background}>
        Login
      </Button>

      <Link href={"/register"}>New User? Create an account</Link>
    </MainBody>
  );
}
