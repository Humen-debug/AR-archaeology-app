import MainBody from "@/components/main_body";
import { AuthOperationName, useEmailPasswordAuth } from "@realm/react";
import { useEffect, useState } from "react";
import { Button, TextInput } from "react-native-paper";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { register, result, logIn } = useEmailPasswordAuth();
  // Log in the user after successful registration
  useEffect(() => {
    if (result.success && result.operation === AuthOperationName.Register) {
      logIn({ email, password });
    }
  }, [result, logIn, email, password]);

  // For this example, the App Services backend automatically
  // confirms users' emails.
  const handleRegister = () => {
    register({ email, password });
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
      <Button onPress={handleRegister} buttonColor="theme.colors.background">
        Create an Account
      </Button>
    </MainBody>
  );
}
