import { Text, Card } from "react-native-paper";
import { View, GestureResponderEvent, StyleSheet, ViewStyle } from "react-native";
import { TimeIcon, LocationIcon } from "@components/icons";
import { Artifact } from "@models";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppTheme } from "@providers/style_provider";

export interface Props {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: () => void;
  loading?: boolean;
  item: Artifact;
  style?: ViewStyle;
}
export default (props: Props) => {
  const { theme } = useAppTheme();
  const { item, onPress, onLongPress, style } = props;
  const imageUri = item.image ?? require("@assets/images/demo_item.png");

  return (
    <Card
      mode="contained"
      onPress={
        onPress ??
        (() => {
          router.push(`/detail?id=${item._id}`);
        })
      }
      onLongPress={onLongPress}
      style={[_style.itemCard, style]}
    >
      <Card.Cover source={imageUri} resizeMode="cover" style={_style.cardImg} />
      <Card.Content style={{ paddingHorizontal: 0, paddingBottom: 0 }}>
        <LinearGradient
          colors={theme.colors.gradientBlack}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={[_style.cardContext, { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md }]}
        >
          <Text variant="titleSmall" numberOfLines={2}>
            {item.name}
          </Text>
          <View style={_style.wrapper}>
            {item.location && (
              <View style={_style.labelContainer}>
                <LocationIcon fill={theme.colors.tertiary} width={12} />
                <Text variant="titleSmall" style={{ fontSize: 10 }}>
                  {item.location || ""}
                </Text>
              </View>
            )}

            {item && item.date !== undefined && item.date !== null && (
              <View style={_style.labelContainer}>
                <TimeIcon fill={theme.colors.tertiary} width={12} />
                <Text variant="titleSmall" style={{ fontSize: 10 }}>
                  {item.date?.toString() ?? ""}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Card.Content>
    </Card>
  );
};

const _style = StyleSheet.create({
  itemCard: {
    flex: 1 / 2,
    flexBasis: "auto",
    flexDirection: "column",
    borderRadius: 32,
    overflow: "hidden",
    padding: 0,
    margin: 0,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
  },
  cardContext: {
    flex: 1,
    gap: 8,
    flexDirection: "column",
  },
  cardImg: {
    flex: 1,
    height: 150,
    width: "100%",
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },

  wrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
  },
});
