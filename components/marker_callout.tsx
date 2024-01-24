import { Image, StyleSheet, View, Dimensions } from "react-native";
import { Callout } from "react-native-maps";
import { Text } from "react-native-paper";
import { AppTheme, useAppTheme } from "@styles";

interface MarkerCalloutProps {
  title: string;
  desc?: string;
  image?: string;
  onPress?: VoidFunction;
}

export default function MarkerCallout({ title, desc, image, onPress }: MarkerCalloutProps) {
  const theme = useAppTheme();
  const screenWidth = Dimensions.get("window").width;
  const style = useStyle(theme, screenWidth);
  return (
    <Callout tooltip onPress={onPress}>
      <View>
        <View style={style.container}>
          {image && <Image source={{ uri: image }} resizeMethod="resize" style={{ width: 100, height: "100%" }} />}
          <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>{title}</Text>
            {desc && (
              <Text>
                {desc.slice(0, 160)}
                {desc.length > 160 ? "..." : ""}
              </Text>
            )}
          </View>
        </View>
        <View style={style.triangle} />
      </View>
    </Callout>
  );
}

const useStyle = (theme: AppTheme, screenWidth?: number) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.grey4 + "e9",
      width: (screenWidth || 200) * 0.8,
      flexDirection: "row",
      overflow: "hidden",
      borderRadius: 12,
    },
    triangle: {
      left: ((screenWidth || 200) * 0.8) / 2 - 10,
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderTopWidth: 20,
      borderRightWidth: 10,
      borderBottomWidth: 0,
      borderLeftWidth: 10,
      borderTopColor: theme.colors.grey4 + "e9",
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      borderLeftColor: "transparent",
    },
  });
