import { Text } from "react-native-paper";
import { useAppTheme } from "@styles";
import { MainBody, IconBtn, AudioPlayer, ModelView } from "@components";
import { View, StyleSheet, ScrollView } from "react-native";
import { useMemo, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetScrollView, BottomSheetScrollViewMethods } from "@gorhom/bottom-sheet";
import { BookmarkIcon, BookmarkOutlineIcon, CreateARIcon, ChevronLeftIcon, ErrorOutlineIcon, ShareIcon } from "@/components/icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Artifact } from "@models";
import { useBookmarks } from "@providers/bookmark_provider";

export default function DetailPage() {
  const theme = useAppTheme();
  const { top } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  const { bookmarks, setBookmark } = useBookmarks();
  const [item, setItem] = useState<Artifact>();

  const isBookmarked = useMemo(() => {
    const artifacts = bookmarks?.artifacts;
    if (!artifacts || !item) return false;
    // return artifacts.indexOf(item._id.toString()) !== -1;
  }, [bookmarks]);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetScrollRef = useRef<BottomSheetScrollViewMethods | null>(null);
  // variables
  const snapPoints = useMemo(() => ["50%", "85%"], []);

  return (
    <MainBody backgroundColor={theme.colors.gradientBackground} padding={{ right: 0, left: 0 }}>
      <>
        <View style={{ flex: 0.5, position: "relative" }}>
          <ModelView style={{ flex: 1 }} setLoading={setLoading} setError={setModelError} />
          {loading && (
            <View style={_style.centerContainer}>
              <ActivityIndicator size="large" animating={loading} />
            </View>
          )}
          {modelError && (
            <View style={_style.centerContainer}>
              <ErrorOutlineIcon fill="white" />
            </View>
          )}
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          backgroundStyle={[{ backgroundColor: theme.colors.container, marginHorizontal: theme.spacing.md }, _style.bottomSheetShadow]}
        >
          {item && (
            <View style={[_style.columnLayout, { flex: 0, marginTop: theme.spacing.md }]}>
              <Text variant="headlineSmall" style={{ marginBottom: theme.spacing.sm }}>
                {item?.name}
              </Text>
              <View style={_style.rowLayout}>
                {
                  <Text variant="bodyMedium" style={{ color: theme.colors.tertiary, textAlign: "center" }}>
                    {item?.date}
                  </Text>
                }
              </View>

              <AudioPlayer soundUri={require("@assets/audio/arrowhead.mp3")} />
            </View>
          )}

          <BottomSheetScrollView ref={bottomSheetScrollRef} showsVerticalScrollIndicator={false}>
            <View
              style={{
                flex: 1,
                overflow: "hidden",
                flexDirection: "column",
                paddingHorizontal: theme.spacing.xl,
                paddingBottom: theme.spacing.xl,
                gap: theme.spacing.lg,
              }}
            >
              <>
                {item?.desc
                  ?.replace(/\\n/g, "\n")
                  .split(/\r?\n/g)
                  .map((desc, idx) => (
                    <Text variant="bodyMedium" key={idx}>
                      {desc}
                    </Text>
                  ))}
              </>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
        {/* Header */}
        <View
          style={[
            _style.rowLayout,
            {
              justifyContent: "space-between",
              position: "absolute",
              top: top + theme.spacing.xs,
              left: 0,
              right: 0,
              paddingHorizontal: theme.spacing.md,
            },
          ]}
        >
          <IconBtn icon={<ChevronLeftIcon fill={theme.colors.grey1} />} onPress={() => router.back()} disabled={loading} />
          <View style={[_style.rowLayout, { gap: theme.spacing.sm }]}>
            <IconBtn icon={<ShareIcon fill={theme.colors.grey1} />} onPress={() => {}} />
            <IconBtn
              icon={isBookmarked ? <BookmarkIcon fill={theme.colors.grey1} /> : <BookmarkOutlineIcon fill={theme.colors.grey1} />}
              onPress={() => {
                setBookmark(item?._id);
              }}
            />
            <IconBtn
              icon={<CreateARIcon fill={theme.colors.grey1} />}
              disabled={loading}
              onPress={() => {
                loading ? null : router.push("/ar_placement");
              }}
            />
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
    flex: 1,
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
  bottomSheetShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -32 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  centerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
