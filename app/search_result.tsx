import { Searchbar } from "react-native-paper";
import { useAppTheme } from "../styles";
import MainBody from "../components/main_body";
import { View, StyleSheet } from "react-native";
import { useState } from "react";
import SearchIcon from "../assets/icons/search.svg";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import SortIcon from "../assets/icons/sort.svg";
import { Artifact } from "models/artifact";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ItemCard } from "../components/item_card";

export default function SearchResultPage() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [searchText, setSearchText] = useState(params.q || "");

  const search = (query: string) => {
    setSearchText(query);
    router.setParams({ q: searchText });
  };
  // for dev use
  const items: Artifact[] = Array.from({ length: 5 }, (_, i) => ({
    _id: `${i}`,
    name: "The 8th century reliquary hand of Saint Abulmuse",
    location: "Vedi Fortress",
    date: new Date("1960-8-1"),
  }));
  return (
    <MainBody backgroundColor={theme.colors.gradientBackground} padding={{ top: 0 }}>
      <>
        <View
          style={[
            _style.header,
            {
              backgroundColor: theme.colors.background,
              paddingTop: useSafeAreaInsets().top,
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeftIcon fill="white" />
          </TouchableOpacity>
          <Searchbar
            placeholder="Search"
            value={searchText}
            onChangeText={search}
            mode="bar"
            icon={() => null}
            iconColor={theme.colors.grey4}
            elevation={0}
            style={{ flexGrow: 1, backgroundColor: "#6D6D6D33", borderRadius: 4, paddingRight: 0 }}
            traileringIcon={({ color }) => <SearchIcon fill={color} />}
          />
          <TouchableOpacity>
            <SortIcon fill="white" />
          </TouchableOpacity>
        </View>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={items}
          renderItem={({ item }) => <ItemCard item={item} />}
          columnWrapperStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.md, justifyContent: "flex-start" }}
          numColumns={2}
          keyExtractor={(item, index) => item._id}
          style={{ padding: theme.spacing.md }}
        />
      </>
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
