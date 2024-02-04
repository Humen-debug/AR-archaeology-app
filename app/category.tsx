import { Text } from "react-native-paper";
import { useAppTheme } from "@styles";
import { View, ScrollView, StyleSheet } from "react-native";
import { ChevronLeftIcon, SortIcon } from "@/components/icons";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { ItemCard, MainBody } from "@components";
import { Artifact } from "@models";

export default function CategoryPage() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ cat?: string }>();

  const items: Artifact[] = []; // todo
  return (
    <MainBody backgroundColor={theme.colors.gradientBackground}>
      <ScrollView>
        <View style={[_style.header, { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeftIcon fill="white" />
          </TouchableOpacity>
          <Text variant="headlineMedium" style={{ flex: 1 }}>
            {params.cat}
          </Text>
          <TouchableOpacity>
            <SortIcon fill="white" />
          </TouchableOpacity>
        </View>
        <FlatList
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          data={items}
          renderItem={({ item }) => <ItemCard item={item} />}
          columnWrapperStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.md, justifyContent: "flex-start" }}
          numColumns={2}
          keyExtractor={(item, index) => item._id.toString()}
          style={{ padding: theme.spacing.md }}
        />
      </ScrollView>
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
