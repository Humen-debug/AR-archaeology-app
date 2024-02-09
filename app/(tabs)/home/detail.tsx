import { AppBar, Carousel, ContentItem, MainBody, NAVBAR_HEIGHT } from "@/components";
import MapPreview from "@/components/map/map_preview";
import { BookmarkOutlineIcon, CompassIcon, LocationIcon } from "@components/icons";
import { Attraction, GeoPoint } from "@models";
import { useFeathers } from "@providers/feathers_provider";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ActivityIndicator, Button, Text } from "react-native-paper";

export default function Page() {
  const feathers = useFeathers();
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const style = useStyle({ theme, screenWidth });
  /**
   * @param id refers to the _id of model
   * @param service refers to the feathers api service's name
   */
  const { id, service } = useLocalSearchParams<{ id?: string; service?: string }>();
  const [loaded, setLoaded] = useState(false);
  const [item, setItem] = useState<Attraction>();
  const [canNavigate, setCanNavigate] = useState(false);

  useEffect(() => {
    async function init() {
      if (!service || !id) {
        setLoaded(true);
        return;
      }
      try {
        const res = await feathers.service(service).get(id);
        const { latitude, longitude } = res;

        setCanNavigate(typeof latitude === "number" && typeof longitude === "number");
        setItem(res);
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, []);

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar showBack actions={[{ icon: (props) => <BookmarkOutlineIcon fill={props.color} size={props.size} /> }]} />
      {!loaded ? (
        <View style={style.center}>
          <ActivityIndicator size={"large"} />
        </View>
      ) : item ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: NAVBAR_HEIGHT + theme.spacing.md }}>
          {item.thumbnails && <Carousel images={item.thumbnails} />}

          <View style={style.topSection}>
            <Text variant="headlineSmall" style={{ color: theme.colors.text }}>
              {item.name}
            </Text>
            {item.desc ? (
              <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
                {item.desc}
              </Text>
            ) : (
              item.briefDesc && (
                <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
                  {item.briefDesc}
                </Text>
              )
            )}
          </View>

          {/* Map */}
          {canNavigate && (
            <View style={{ flexDirection: "column" }}>
              <Text variant="titleMedium" style={{ color: theme.colors.text, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xs }}>
                Explore the area
              </Text>
              <MapPreview points={[item as GeoPoint]} style={style.map} miniZoomLevel={13} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.xs,
                }}
              >
                <Button
                  mode="contained"
                  onPress={() => router.replace({ pathname: "/map", params: { latitude: item.latitude, longitude: item.longitude } })}
                  textColor={theme.colors.textOnPrimary}
                  style={{ borderRadius: theme.borderRadius.xs }}
                  icon={() => <LocationIcon fill={theme.colors.textOnPrimary} size={20} />}
                >
                  <Text variant="labelMedium" style={{ color: theme.colors.textOnPrimary }}>
                    View in a map
                  </Text>
                </Button>
                <Button
                  mode="outlined"
                  style={{ borderRadius: theme.borderRadius.xs, borderWidth: 2, borderColor: theme.colors.primary }}
                  icon={() => <CompassIcon fill={theme.colors.primary} size={20} />}
                >
                  <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                    Start AR tour
                  </Text>
                </Button>
              </View>
            </View>
          )}

          {/* Content */}
          {item.content && (
            <View style={{ flexDirection: "column", rowGap: 1.5 * theme.spacing.xl }}>
              {item.content.map((item, index) => (
                <ContentItem content={item} key={index} imageStyle={{ marginHorizontal: theme.spacing.lg, borderRadius: theme.spacing.xs }} />
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={style.center}>
          <Text variant="headlineMedium" style={{ color: theme.colors.error, fontWeight: "bold" }}>
            404 Not Found :(
          </Text>
        </View>
      )}
    </MainBody>
  );
}

const useStyle = ({ theme, screenWidth }: { theme: AppTheme; screenWidth: number }) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignContent: "center" },
    topSection: {
      flexDirection: "column",
      paddingHorizontal: theme.spacing.lg,
      rowGap: theme.spacing.sm,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    image: { resizeMode: "cover" },
    thumbnail: {
      width: screenWidth,
      height: (screenWidth * 9) / 16,
    },
    map: {
      width: screenWidth,
      height: (screenWidth * 9) / 32,
    },
  });
