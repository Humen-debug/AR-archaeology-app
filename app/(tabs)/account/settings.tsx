import { useAppTheme } from "@/providers/style_provider";
import { AccountListItem, AppBar, MainBody } from "@components";
import { useAuth } from "@providers/auth_provider";
import { View } from "react-native";
import { Switch, Text } from "react-native-paper";

export default function Page() {
  const { style, theme, switchStyle } = useAppTheme();
  const isDarkMode = style === "dark";

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar title="Settings" showBack={true} />
      <View style={{ padding: theme.spacing.lg }}>
        <AccountListItem
          label="Dark mode"
          prefix={isDarkMode ? "moonFill" : "moon"}
          suffix={<Switch value={isDarkMode} onValueChange={switchStyle} />}
        />
      </View>
    </MainBody>
  );
}
