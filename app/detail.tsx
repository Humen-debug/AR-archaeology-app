import { Searchbar } from "react-native-paper";
import { useAppTheme } from "../styles";
import MainBody from "../components/main_body";
import { View, StyleSheet } from "react-native";
import { useState } from "react";
import SearchIcon from "../assets/icons/search.svg";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import { Artifact } from "models/artifact";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import IconBtn from "../components/icon_btn";

export default function DetailPage() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ id?: string }>();

  return (
    <MainBody backgroundColor={theme.colors.gradientBackground}>
      <View>
        <IconBtn icon={<ChevronLeftIcon fill={theme.colors.grey1} />} onPress={() => router.back()} />
      </View>
    </MainBody>
  );
}

const _style = StyleSheet.create({
  gradient: {
    flex: 1,
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
