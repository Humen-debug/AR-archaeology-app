import { MainBody } from "@/components";
import { Artifact } from "@/models";
import { useAuth } from "@/providers/auth_provider";
import { useFeathers } from "@/providers/feathers_provider";
import { AppTheme, useAppTheme } from "@/styles";
import { router } from "expo-router";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

function CollectionPage() {
  const { user } = useAuth();
  const feathers = useFeathers();
  const theme = useAppTheme();
  const style = useStyle(theme);
  const [collection, setCollection] = useState<Artifact[]>([]);

  useEffect(() => {
    async function syncData() {
      if (!user?.collections) return;
      const chunks = _.chunk(user.collections, 20);
      const resps = await Promise.all(_.map(chunks, (chunk) => feathers.service("artifact").find({ query: { _id: { $in: chunk }, $limit: 100 } })));
      const result = _.flatten(_.map(resps, (resp) => resp.data));
      setCollection(result);
    }
    syncData();
  }, []);
  return (
    <MainBody>
      <View style={style.wrapper}>
        {collection.map((item) => (
          <View key={item._id} style={style.item}>
            <Text>{item.name}</Text>
          </View>
        ))}
      </View>
      <View style={style.footer}>
        <Button textColor={theme.colors.grey1} mode="outlined" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    </MainBody>
  );
}

export default CollectionPage;

const useStyle = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      flexDirection: "column",
      flexWrap: "wrap",
    },
    item: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 8,
      backgroundColor: theme.colors.grey1.concat("20"),
    },
    footer: {
      display: "flex",
      flexDirection: "row",
      flex: 0,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
    },
  });
