import { Route } from "@/models";
import { Paginated, useFeathers } from "@/providers/feathers_provider";
import { useAppTheme } from "@/providers/style_provider";
import { AppBar, ListItem, ListItemProps, MainBody, NAVBAR_HEIGHT } from "@components";
import { useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function Page() {
  const feathers = useFeathers();
  const { theme } = useAppTheme();
  const [routes, setRoutes] = useState<Route[]>([]);
  /** initial loading */
  const [loaded, setLoaded] = useState(false);
  /** scroll to load more */
  const [loading, setLoading] = useState(false);
  const [hasScrolled, setScrolled] = useState(false);
  const cursor = useRef(0);
  const total = useRef(0);

  useEffect(() => {
    async function init() {
      setLoaded(false);
      try {
        await syncData();
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, []);

  async function syncData() {
    const query = { $skip: cursor.current, $sort: "order" };
    const res: Paginated<Route> = await feathers.service("routes").find({
      query: query,
    });
    if (res.total != total.current) total.current = res.total;
    let count: number = res.data.length;

    setRoutes((items) => [...items, ...res.data]);
    cursor.current += count;
  }

  async function onScroll({ nativeEvent }) {
    setScrolled(true);
  }

  async function loadMore() {
    if (!hasScrolled) return null;
    if (routes.length >= total.current) return;
    setLoading(true);
    try {
      await syncData();
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar title="Great Outdoors" showBack />
      <FlatList
        onScroll={onScroll}
        onEndReached={loadMore}
        scrollEventThrottle={400}
        data={routes}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.xs }} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: NAVBAR_HEIGHT + theme.spacing.lg }}
        contentInset={{ bottom: theme.spacing.lg }}
        renderItem={({ item }) => {
          const props: ListItemProps = {
            name: item.name,
            briefDesc: item.briefDesc,
            images: item.thumbnails,
            href: {
              pathname: "/home/route",
              params: { id: item._id },
            },
          };
          return <ListItem {...props} />;
        }}
        ListHeaderComponent={() => {
          return (
            <View
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingBottom: theme.spacing.lg,
                paddingTop: theme.spacing.md,
              }}
            >
              <Text variant="bodyMedium" style={{ color: theme.colors.grey2 }}>
                Armenia is a moutainous country, you can enjoy a heritage and scenic hike.
              </Text>
            </View>
          );
        }}
        ListFooterComponent={() => {
          if (loading) {
            return (
              <View style={{ height: 32, display: "flex", alignContent: "center", justifyContent: "center", marginVertical: theme.spacing.md }}>
                <ActivityIndicator animating size={"small"} />
              </View>
            );
          }
        }}
      />
    </MainBody>
  );
}
