import { AppBar, ContentItem, MainBody, NAVBAR_HEIGHT } from "@/components";
import { useFeathers } from "@/providers/feathers_provider";
import { useAppTheme } from "@/providers/style_provider";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import type { Document, Content } from "@/models";
import { getThumb } from "@/plugins/utils";

export default function HistoryPage() {
  const { theme } = useAppTheme();
  const feathers = useFeathers();
  const { width: screenWidth } = useWindowDimensions();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const res = await feathers.service("documents").find({ query: { page: "history" } });
        if (res.data) {
          setDoc(res.data[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar showBack />
      {loading ? (
        <View style={style.center}>
          <ActivityIndicator animating size={"large"} />
        </View>
      ) : doc ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: NAVBAR_HEIGHT + theme.spacing.md }}>
          <View style={{ flexDirection: "column", rowGap: 1.5 * theme.spacing.xl }}>
            {doc.content.map((content, index) => (
              <ContentItem content={content} key={index} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={style.center}>
          <Text variant="headlineMedium" style={{ color: theme.colors.error }}>
            404 Not Found
          </Text>
        </View>
      )}
    </MainBody>
  );
}

const style = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignContent: "center" },
  image: { resizeMode: "cover" },
});
