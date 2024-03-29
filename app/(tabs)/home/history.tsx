import { AppBar, ContentItem, ErrorPage, LoadingPage, MainBody, NAVBAR_HEIGHT } from "@/components";
import { useFeathers } from "@/providers/feathers_provider";
import { useAppTheme } from "@/providers/style_provider";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import type { Document } from "@/models";

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
        <LoadingPage />
      ) : doc ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: NAVBAR_HEIGHT + theme.spacing.md, paddingTop: theme.spacing.lg }}>
          <View style={{ flexDirection: "column", rowGap: 1.5 * theme.spacing.xl }}>
            {doc.content.map((content, index) => (
              <ContentItem content={content} key={index} />
            ))}
          </View>
          <Text variant="titleMedium" style={{ paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl }}>
            Timeline
          </Text>
          <Image
            source={require("@assets/images/timeline.jpeg")}
            style={{ width: screenWidth, height: screenWidth * Math.round(screenWidth / 235) }}
            resizeMode="contain"
          />
        </ScrollView>
      ) : (
        <ErrorPage />
      )}
    </MainBody>
  );
}

const style = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignContent: "center" },
  image: { resizeMode: "cover" },
});
