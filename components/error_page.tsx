import { useAppTheme } from "@/providers/style_provider";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function ErrorPage() {
  const { theme } = useAppTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
      <Text variant="headlineMedium" style={{ color: theme.colors.error, fontWeight: "bold" }}>
        404 Not Found :(
      </Text>
    </View>
  );
}
