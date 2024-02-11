import { useAppTheme, AppTheme } from "@/providers/style_provider";
import { AppBar, Form, MainBody, NAVBAR_HEIGHT } from "@components";
import { useAuth } from "@providers/auth_provider";
import moment from "moment";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import * as rules from "@/plugins/rules";
import { SuccessCircleIcon } from "@/components/icons";

export default function Page() {
  const { theme } = useAppTheme();
  const style = useStyle({ theme });
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [dob, setDob] = useState(user?.dob ? moment(user.dob).format("DD/MM/YYYY") : "");

  const [email, setEmail] = useState(user?.email || "");

  const [areaCode, setAreaCode] = useState<number | undefined>(user?.phone ? Number(user.phone.split(" ")[0]?.substring(1)) : undefined);
  const [phone, setPhone] = useState<string>(user?.phone ? user.phone.split(" ")[1] : "");

  const [formValid, setFormValid] = useState(false);
  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleEdit() {
    if (editing) {
      if (!formValid || loading) return;
      setLoading(true);
      try {
        const birthday = dob.length ? moment(dob, "DD/MM/YYYY").toDate() : undefined;
        const contactNum = !!areaCode && !!phone ? `+${areaCode} ${phone}` : undefined;
        await updateUser({ firstName, lastName, username, email, dob: birthday, phone: contactNum });

        setSuccess(true);
        setLoading(false);
        await Promise.resolve((resolve) => setTimeout(resolve, 3000));

        setEditing(false);
      } catch (error) {
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    } else {
      setEditing(true);
      setSuccess(false);
    }
  }

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar
        title="Profile"
        showBack
        goBack={
          !editing
            ? undefined
            : () => {
                setEditing(false);
              }
        }
      />
      <ScrollView contentContainerStyle={style.scrollView}>
        {!editing ? (
          <>
            <View style={{ rowGap: theme.spacing.lg }}>
              <Text variant="headlineSmall" style={{ color: theme.colors.text }}>
                Basic Information
              </Text>
              <View style={style.row}>
                <Text variant="labelMedium" style={{ color: theme.colors.text }}>
                  Name
                </Text>
                <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.text, textAlign: "right" }}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </View>
              <View style={style.row}>
                <Text variant="labelMedium" style={{ color: theme.colors.text }}>
                  Username
                </Text>
                <Text variant="bodyMedium" style={{ flex: 1, color: user?.username ? theme.colors.text : theme.colors.grey3, textAlign: "right" }}>
                  {user?.username ?? "Not provided"}
                </Text>
              </View>
              <View style={style.row}>
                <Text variant="labelMedium" style={{ color: theme.colors.text }}>
                  Birthday
                </Text>
                <Text variant="bodyMedium" style={{ flex: 1, color: user?.dob ? theme.colors.text : theme.colors.grey3, textAlign: "right" }}>
                  {user?.dob ? moment(user.dob).format("MM/YYYY") : "Not provided"}
                </Text>
              </View>
              <View style={[style.row, { justifyContent: "space-between" }]}>
                <Text variant="labelMedium" style={{ color: theme.colors.text }}>
                  Password
                </Text>
                <Button
                  mode="contained"
                  textColor={theme.colors.textOnPrimary}
                  style={style.button}
                  labelStyle={{ marginHorizontal: theme.spacing.sm, marginVertical: theme.spacing.xxs }}
                >
                  Change password
                </Button>
              </View>
            </View>
            <View style={{ rowGap: theme.spacing.lg, marginTop: theme.spacing.xl }}>
              <Text variant="headlineSmall" style={{ color: theme.colors.text }}>
                Contact
              </Text>
              <View style={style.row}>
                <Text variant="labelMedium" style={{ color: theme.colors.text }}>
                  Email
                </Text>
                <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.text, textAlign: "right" }}>
                  {user?.email}
                </Text>
              </View>
              <View style={style.row}>
                <Text variant="labelMedium" style={{ color: theme.colors.text }}>
                  Mobile number
                </Text>
                <Text variant="bodyMedium" style={{ flex: 1, color: user?.phone ? theme.colors.text : theme.colors.grey3, textAlign: "right" }}>
                  {user?.phone ?? "Not provided"}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
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
                  value: email,
                  onChange: setEmail,
                  validator: [rules.required, rules.email],
                  label: "Email*",
                  keyboardType: "email-address",
                },
                {
                  inner: [
                    {
                      value: areaCode?.toString(),
                      onChange: (value: string) => {
                        try {
                          const num = Number(value);
                          setAreaCode(num);
                        } catch (error) {}
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
              ]}
            />
          </>
        )}
      </ScrollView>
      <View style={style.footer}>
        <Button
          mode="contained"
          textColor={theme.colors.textOnPrimary}
          style={style.button}
          labelStyle={{ marginVertical: theme.spacing.sm }}
          onPress={handleEdit}
          loading={loading}
          disabled={loading}
          icon={() => (success && editing ? <SuccessCircleIcon fill={theme.colors.textOnPrimary} size={24} /> : undefined)}
        >
          {editing ? "Save" : "Edit"}
        </Button>
      </View>
    </MainBody>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    scrollView: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      flexGrow: 1,
    },
    footer: {
      bottom: NAVBAR_HEIGHT,
      left: 0,
      right: 0,
      position: "absolute",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background.concat("80"),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    button: {
      borderRadius: theme.borderRadius.xs,
    },
  });
