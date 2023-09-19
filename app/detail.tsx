import { Text } from "react-native-paper";
import { useAppTheme } from "../styles";
import MainBody from "../components/main_body";
import { View, StyleSheet } from "react-native";
import { useState } from "react";
import BookmarkOutlineIcon from "../assets/icons/bookmark-outline.svg";
import BookmarkIcon from "../assets/icons/bookmark.svg";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import { Artifact } from "models/artifact";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import IconBtn from "../components/icon_btn";
import ModelView from "../components/model_view";

export default function DetailPage() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <MainBody backgroundColor={theme.colors.gradientBackground}>
      <>
        <View style={[_style.rowLayout, { justifyContent: "space-between" }]}>
          <IconBtn icon={<ChevronLeftIcon fill={theme.colors.grey1} />} onPress={() => router.back()} />
          <View style={[_style.rowLayout, { gap: theme.spacing.sm }]}>
            <IconBtn
              icon={bookmarked ? <BookmarkIcon fill={theme.colors.grey1} /> : <BookmarkOutlineIcon fill={theme.colors.grey1} />}
              onPress={() => setBookmarked(!bookmarked)}
            />
            <IconBtn icon={<ChevronLeftIcon fill={theme.colors.grey1} />} onPress={() => router.back()} />
            <IconBtn icon={<ChevronLeftIcon fill={theme.colors.grey1} />} onPress={() => router.back()} />
          </View>
        </View>
        <ModelView />
        <View>
          <Text varient="headlineMedium">Urartu</Text>
        </View>
        <Text>End</Text>
      </>
    </MainBody>
  );
}

const _style = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
});
