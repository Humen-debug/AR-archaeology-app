import { AppBar, Form, MainBody, NAVBAR_HEIGHT } from "@components";
import _ from "lodash";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "@providers/auth_provider";
import { useAppTheme, AppTheme } from "@providers/style_provider";
import * as rules from "@/plugins/rules";
import moment from "moment";
import { router } from "expo-router";

export default function RegisterPage() {
  const { theme } = useAppTheme();
  const style = useStyle({ theme });
  const { register, login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [areaCode, setAreaCode] = useState<number | undefined>();
  const [phone, setPhone] = useState<string>("");

  const [formValid, setFormValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formValid) return;
    setErrorMsg("");
    setLoading(true);
    try {
      const birthday = !!dob && moment(dob, "DD/MM/YYYY").toDate();
      const contactNum = !!areaCode && !!phone ? `+${areaCode} ${phone}` : undefined;
      const newUser = {
        email,
        password,
        firstName,
        lastName,
        username,
        dob: birthday ? birthday : undefined,
        phone: contactNum,
      };

      await register(newUser);
      await login({ email, password });
      router.replace("/");
    } catch (error) {
      console.warn(error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar title="Sign up" showBack={true} />
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, flexGrow: 1 }}>
        <Form
          setValid={setFormValid}
          fields={[
            {
              value: firstName,
              onChange: setFirstName,
              validator: rules.required,
              label: "First name*",
            },
            {
              value: lastName,
              onChange: setLastName,
              validator: rules.required,
              label: "Last name*",
            },
            {
              value: username,
              onChange: setUsername,
              label: "Username",
            },
            {
              value: dob,
              onChange: (value: string) => {
                if (value.length === 2 || value.length === 5) value += "/";
                setDob(value);
              },
              validator: rules.birthday,
              label: "Birthday (DD/MM/YYYY)",
              keyboardType: "number-pad",
              maxLength: 10,
            },
            {
              inner: [
                {
                  value: areaCode?.toString(),
                  onChange: (value: string) => {
                    try {
                      const num = Number(value);
                      setAreaCode(num);
                    } catch (error) {
                      console.log("fail to update areaCode", error);
                    }
                  },
                  keyboardType: "number-pad",
                  label: "Area code",
                  flex: 2,
                },
                {
                  value: phone,
                  onChange: setPhone,
                  keyboardType: "phone-pad",
                  label: "Mobile Number",
                  flex: 4,
                },
              ],
            },
            {
              value: email,
              onChange: setEmail,
              validator: [rules.required, rules.email],
              label: "Email*",
              keyboardType: "email-address",
            },
            {
              value: password,
              onChange: setPassword,
              validator: [rules.required, rules.password],
              label: "Password*",
              keyboardType: "visible-password",
            },
          ]}
        />
        <View style={{ height: theme.spacing.xl }} />

        <Text style={{ color: theme.colors.error }}>{errorMsg}</Text>
      </ScrollView>
      <View style={style.footer}>
        <Button
          mode="contained"
          buttonColor={theme.colors.primary}
          onPress={handleRegister}
          style={style.largeButton}
          disabled={loading}
          loading={loading}
        >
          <Text variant="labelLarge" style={{ color: theme.colors.background, fontWeight: "bold" }}>
            Create an account
          </Text>
        </Button>
      </View>
    </MainBody>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background.concat("80"),
      padding: theme.spacing.lg,
    },
    largeButton: {
      borderRadius: 4,
      minHeight: 48,
    },
  });
