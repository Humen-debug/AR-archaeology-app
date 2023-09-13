import { Searchbar, Text, Card, Surface, TouchableRipple } from "react-native-paper";
import { useAppTheme } from "../../styles";
import MainBody from "../../components/main_body";
import { View, ScrollView, GestureResponderEvent, Image, StyleSheet } from "react-native";
import { useState } from "react";
import SearchIcon from "../../assets/icons/search.svg";

import { Artifact } from "models/artifact";
import { LinearGradient } from "expo-linear-gradient";
import { FlatList } from "react-native-gesture-handler";

export default function Home() {
  const theme = useAppTheme();

  const [searchText, setSearchText] = useState("");

  const search = (query: string) => setSearchText(query);

  // for dev use
  const items: Artifact[] = Array.from({ length: 5 }, (_, i) => ({
    _id: `${i}`,
    name: "The 8th century reliquary hand of Saint Abulmuse",
  }));

  return (
    <MainBody>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", padding: theme.spacing.md }}>
          <Searchbar
            placeholder="Search"
            value={searchText}
            onChangeText={search}
            mode="bar"
            icon={() => null}
            iconColor="white"
            elevation={0}
            style={{ flexGrow: 1, backgroundColor: "#6D6D6D33", borderRadius: 4, paddingRight: 0 }}
            traileringIcon={({ color }) => <SearchIcon fill={color} />}
          />
        </View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          style={{ padding: theme.spacing.sm }}
          horizontal={true}
          data={items}
          renderItem={({ item }) => <ItemCard item={item} />}
          ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
        />
      </ScrollView>
    </MainBody>
  );
}

interface ItemCardProps {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: () => void;
  loading?: boolean;
  item: Artifact;
}

const ItemCard = (props: ItemCardProps) => {
  const { item, onPress } = props;
  return (
    <TouchableRipple onPress={onPress}>
      <View style={_style.itemCard}>
        <LinearGradient colors={["#00000040", ""]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
          <Image style={_style.itemImg} source={item.image || require("../../assets/images/demo_item.png")} />
          <Text style={_style.itemText} numberOfLines={2}>
            {item.name}
          </Text>
        </LinearGradient>
      </View>
    </TouchableRipple>
  );
};

const _style = StyleSheet.create({
  itemCard: {
    width: 150,
    height: 150,
    borderRadius: 32,
    overflow: "hidden",
  },
  itemImg: {
    width: 150,
    height: 150,
  },
  itemText: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 15,
    display: "flex",
    overflow: "hidden",
  },
});
