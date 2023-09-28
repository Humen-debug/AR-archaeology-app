import { Text } from "react-native-paper";
import { useAppTheme } from "../styles";
import MainBody from "../components/main_body";
import { View, StyleSheet } from "react-native";
import { useState } from "react";
import BookmarkOutlineIcon from "../assets/icons/bookmark-outline.svg";
import BookmarkIcon from "../assets/icons/bookmark.svg";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import ShareIcon from "../assets/icons/share.svg";
import CreateARIcon from "../assets/icons/create-ar.svg";
import { Artifact } from "models/artifact";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import IconBtn from "../components/icon_btn";
import ModelView from "../components/model_view";

export default function DetailPage() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const [bookmarked, setBookmarked] = useState(false);
  // TODO: load item by id
  return (
    <MainBody backgroundColor={theme.colors.gradientBackground}>
      <>
        <View style={[_style.rowLayout, { justifyContent: "space-between" }]}>
          <IconBtn icon={<ChevronLeftIcon fill={theme.colors.grey1} />} onPress={() => router.back()} />
          <View style={[_style.rowLayout, { gap: theme.spacing.sm }]}>
            <IconBtn icon={<ShareIcon fill={theme.colors.grey1} />} onPress={() => {}} />
            <IconBtn
              icon={bookmarked ? <BookmarkIcon fill={theme.colors.grey1} /> : <BookmarkOutlineIcon fill={theme.colors.grey1} />}
              onPress={() => setBookmarked(!bookmarked)}
            />
            <IconBtn icon={<CreateARIcon fill={theme.colors.grey1} />} onPress={() => {}} />
          </View>
        </View>
        <ModelView />
        <View style={_style.columnLayout}>
          <Text variant="headlineSmall">Urartu</Text>
          <View style={_style.rowLayout}>
            <Text variant="bodyMedium" style={{ color: theme.colors.tertiary }}>
              Vedi Fortress ・ 16th century
            </Text>
          </View>
        </View>
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
  columnLayout: {
    flexDirection: "column",
    alignContent: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
});
