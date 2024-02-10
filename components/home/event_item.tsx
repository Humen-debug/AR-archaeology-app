import { Event } from "@models";
import { getThumb } from "@/plugins/utils";
import { AppTheme, useAppTheme } from "@/providers/style_provider";
import { Link } from "expo-router";
import moment from "moment";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

const IMAGE_WIDTH = 120;
const LABEL_WIDTH = 64;

export default function EventItem({ _id, name, briefDesc, images, startDate, endDate, ...props }: Event) {
  const { theme } = useAppTheme();
  const style = useStyle({ theme });
  const image: string | undefined = images?.[0];

  function getDateLabel(date: Date) {
    if (!date) return <></>;
    return (
      <>
        <Text variant="headlineSmall" style={{ color: theme.colors.textOnPrimary }}>
          {moment(date).date()}
        </Text>
        <Text variant="bodySmall" style={{ fontWeight: "700", color: theme.colors.textOnPrimary, marginTop: -8 }}>
          {moment(date).format("MMM")}
        </Text>
      </>
    );
  }

  return (
    <Link href={{ pathname: "/home/event", params: { id: _id } }} asChild>
      <Pressable>
        <View style={style.card}>
          {image ? (
            <View style={style.imagePlaceholder}>
              <Image source={{ uri: getThumb(image) }} style={style.image} />
            </View>
          ) : (
            <View style={style.imagePlaceholder} />
          )}
          <View style={[style.content, { marginLeft: image ? IMAGE_WIDTH : LABEL_WIDTH + theme.spacing.md }]}>
            <Text variant="labelLarge" style={{ color: theme.colors.text }}>
              {name}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
              {briefDesc}
            </Text>
          </View>
          <View style={style.dateStack}>
            <View style={style.dateContainer}>
              {getDateLabel(startDate)}
              {endDate && <View style={style.toSign} />}
              {endDate && getDateLabel(endDate)}
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      position: "relative",
      backgroundColor: theme.colors.container,
      elevation: 4,
      overflow: "visible",
      borderRadius: theme.borderRadius.xs,
      minHeight: 130,
    },
    imagePlaceholder: {
      width: IMAGE_WIDTH,
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      borderTopLeftRadius: theme.borderRadius.xs,
      borderBottomLeftRadius: theme.borderRadius.xs,
      overflow: "hidden",
    },
    image: {
      resizeMode: "cover",
      width: "100%",
      height: "100%",
    },
    content: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",

      rowGap: theme.spacing.xs,
      paddingLeft: theme.spacing.xs,
      paddingRight: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    dateStack: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      flexDirection: "column",
      justifyContent: "center",
    },
    dateContainer: {
      backgroundColor: theme.colors.primary,
      flexDirection: "column",
      justifyContent: "center",
      alignContent: "center",
      alignSelf: "center",
      alignItems: "center",
      borderRadius: theme.borderRadius.xs,
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.xs,
      width: LABEL_WIDTH,
      minHeight: LABEL_WIDTH,
      elevation: 2,
    },
    toSign: {
      width: 4,
      height: 14,
      backgroundColor: theme.colors.textOnPrimary,
    },
  });
