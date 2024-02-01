import { AppTheme, useAppTheme } from "@/styles";
import _ from "lodash";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput } from "react-native-paper";

interface FormField<T> {
  value: T;
  valid?: string | null;
}

interface AuthForm {
  email: FormField<string>;
  password: FormField<string>;
}

export interface Props {
  setValid?: (value: boolean) => void;
  setEmail?: (value: string) => void;
  setPassword?: (value: string) => void;
}

export default function AuthForm(props: Props) {
  const theme = useAppTheme();
  const style = useStyle(theme);
  const [form, setForm] = useState<AuthForm>({ email: { value: "" }, password: { value: "" } });

  function setField<K extends keyof AuthForm>(key: K, value: string, validator?: (v?: string) => string | undefined | null) {
    const valid = validator?.(value);
    setForm((form) => ({ ...form, [key]: { value, valid } }));
  }

  useEffect(() => {
    const isValid = _.map(form, (value, key) => value.valid).every((v) => !v || !v.length);
    props.setValid?.(isValid);
    props.setEmail?.(form.email.value);
    props.setPassword?.(form.password.value);
  }, [form]);

  return (
    <View style={[style.column, { rowGap: theme.spacing.xl }]}>
      <View style={[style.column, { rowGap: theme.spacing.xs }]}>
        <TextInput
          label={"Email"}
          mode="outlined"
          value={form.email.value}
          keyboardType="email-address"
          onChangeText={(value) => {
            setField("email", value, (v) => {
              if (!v) return "Email is required.";
              const emailReg = new RegExp(
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              );
              if (!emailReg.test(v)) return "Enter email is not in correct format.";
            });
          }}
        />
        {form.email.valid && <Text style={{ color: theme.colors.error }}>{form.email.valid}</Text>}
      </View>
      <View style={[style.column, { rowGap: theme.spacing.xs }]}>
        <TextInput
          label={"Password"}
          mode="outlined"
          value={form.password.value}
          onChangeText={(value) => {
            setField("password", value, (v) => {
              if (!v) return "Password is required.";
              if (v.length < 8) return "Password must be in at least length of 8 characters.";
            });
          }}
        />
        {form.password.valid && <Text style={{ color: theme.colors.error }}>{form.password.valid}</Text>}
      </View>
    </View>
  );
}

const useStyle = (theme: AppTheme) =>
  StyleSheet.create({
    column: { display: "flex", flexDirection: "column" },
  });
