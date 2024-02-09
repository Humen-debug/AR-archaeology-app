import { getThumb } from "@/plugins/utils";
import { AppTheme, useAppTheme } from "@/providers/style_provider";
import { router } from "expo-router";
import { Href } from "expo-router/build/link/href";
import moment from "moment";
import { useCallback, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";

export interface Props {
  name: string;
  briefDesc?: string;
  images?: string[];
  href?: Href;
  onPress?: () => void;
  startDate: Date;
  endDate?: Date;
}

export default function EventItem({ name, briefDesc, images, href, startDate, endDate, ...props }: Props) {
  const { theme } = useAppTheme();
  const style = useStyle({ theme });
  const image: string | undefined = images?.[0];
  const onPress = useCallback(() => {
    if (href) {
      router.push(href);
    } else {
      props.onPress?.();
    }
  }, []);

  function getDateLabel(date: Date) {
    return (
      <>
        <Text variant="headlineSmall" style={{ color: theme.colors.textOnPrimary }}>
          {date.getDate()}
        </Text>
        <Text variant="bodySmall" style={{ fontWeight: "700", color: theme.colors.textOnPrimary, marginTop: -8 }}>
          {moment(date).format("MMM")}
        </Text>
      </>
    );
  }
  return (
    <TouchableRipple onPress={onPress}>
      <View style={style.card}>
        {image ? (
          <View style={style.imagePlaceholder}>
            <Image source={{ uri: getThumb(image) }} style={style.image} />
          </View>
        ) : (
          <View style={style.imagePlaceholder} />
        )}
        <View style={style.content}>
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
    </TouchableRipple>
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
      maxWidth: 120,
      minWidth: 80,
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
      width: 64,
      minHeight: 64,
      elevation: 2,
    },
    toSign: {
      width: 4,
      height: 14,
      backgroundColor: theme.colors.textOnPrimary,
    },
  });
