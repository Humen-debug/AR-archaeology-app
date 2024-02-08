import { AppBar, ContentItem, MainBody, NAVBAR_HEIGHT } from "@/components";
import { FootStepsIcon, MountainIcon, TimeOutlineIcon } from "@/components/icons";
import MapPreview from "@/components/map/map_preview";
import { GeoPoint, Route } from "@/models";
import { distanceFromLatLonInKm } from "@/plugins/geolocation";
import { getThumb } from "@/plugins/utils";
import { Paginated, useFeathers } from "@/providers/feathers_provider";
import { AppTheme, useAppTheme } from "@/providers/style_provider";
import { useLocalSearchParams } from "expo-router";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ActivityIndicator, Text } from "react-native-paper";

export default function Page() {
  const feathers = useFeathers();
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const style = useStyle({ theme, screenWidth });
  /**
   * @param id refers to the _id of model
   */
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loaded, setLoaded] = useState(false);
  const [route, setRoute] = useState<Route>();
  const points = useRef<GeoPoint[]>([]);
  const total = useRef(1); // used to fetch all related points in route

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  /** This is from google map */
  const avgKmPerHour = 4.5;

  useEffect(() => {
    async function init() {
      try {
        if (!id) return;
        const res = await feathers.service("routes").get(id);
        setRoute(res);
        while (total.current > points.current.length) {
          const locations: Paginated<GeoPoint> = await feathers.service("locations").find({
            query: { route: id, $sort: "order", $select: ["latitude", "longitude"], $skip: points.current.length },
          });
          total.current = locations.total;
          if (locations.total === 0 || locations.data.length === 0) break;
          points.current = [...points.current, ...locations.data];
        }
        if (points.current.length > 1) {
          var sum = 0;
          for (let i = 1; i < points.current.length; i++) {
            const prev = points.current[i - 1];
            const cur = points.current[i];
            sum += distanceFromLatLonInKm(prev, cur);
          }
          // round up to nearest 0.05
          const distance = Math.ceil(sum * 20) / 20;
          setDistance((_) => {
            if (distance < 1) {
              return `${distance * 1000} m`;
            } else {
              return `${distance} km`;
            }
          });
          const duration = Math.ceil(sum / avgKmPerHour);
          setDuration((_) => {
            if (duration < 1) {
              return `~${duration * 60} minutes`;
            } else if (duration > 1) {
              return `${duration} hours`;
            } else {
              return "1 hour";
            }
          });
        }
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, []);

  function renderTopSection() {
    if (!route) return <></>;
    const image = route?.thumbnails?.[0];
    const content = (
      <>
        <View style={{ top: theme.spacing.lg, right: theme.spacing.lg, left: theme.spacing.lg, position: "absolute" }}>
          <Text variant="headlineMedium" style={{ color: theme.colors.white, textShadowOffset: { width: 0, height: 2 }, textShadowColor: "black" }}>
            {route.name}
          </Text>
        </View>
        <View style={{ bottom: theme.spacing.xs, left: theme.spacing.lg, right: theme.spacing.xl, position: "absolute" }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: theme.spacing.xs, columnGap: theme.spacing.xl }}>
            <View style={style.labelRow}>
              <TimeOutlineIcon size={24} fill="white" />
              <Text variant="bodyMedium" style={{ color: "white" }}>
                {duration}
              </Text>
            </View>
            <View style={style.labelRow}>
              <MountainIcon size={24} fill="white" />
              <Text variant="bodyMedium" style={{ color: "white" }}>
                {distance}
              </Text>
            </View>
            <View style={style.labelRow}>
              <FootStepsIcon size={24} fill="white" />
              <Text variant="bodyMedium" style={{ color: "white" }}>
                {route.difficulty}
              </Text>
            </View>
          </View>
        </View>
      </>
    );

    return image ? (
      <ImageBackground source={{ uri: getThumb(image) }} style={style.thumbnail} imageStyle={style.image}>
        {content}
      </ImageBackground>
    ) : (
      <View style={[style.thumbnail, { backgroundColor: theme.colors.grey3 }]}>{content}</View>
    );
  }

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar showBack />
      {!loaded ? (
        <View style={style.center}>
          <ActivityIndicator size={"large"} />
        </View>
      ) : route ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: NAVBAR_HEIGHT + theme.spacing.md }}>
          {renderTopSection()}
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.text, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xl }}
          >
            {route.desc}
          </Text>

          {points.current.length && (
            <View style={{ flexDirection: "column" }}>
              <Text variant="titleMedium" style={{ color: theme.colors.text, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xs }}>
                Map to {route.name}
              </Text>
              <MapPreview points={points.current} style={style.map} />
            </View>
          )}

          {route.content && (
            <View style={{ flexDirection: "column", rowGap: 1.5 * theme.spacing.xl }}>
              {route.content.map((item, index) => (
                <ContentItem content={item} key={index} imageStyle={{ marginHorizontal: theme.spacing.lg, borderRadius: theme.spacing.xs }} />
              ))}
            </View>
          )}
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

const useStyle = ({ theme, screenWidth }: { theme: AppTheme; screenWidth: number }) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignContent: "center" },
    image: { resizeMode: "cover" },
    thumbnail: {
      width: screenWidth,
      height: (screenWidth * 9) / 16,
      position: "relative",
    },
    labelRow: {
      flexDirection: "row",
      gap: theme.spacing.xs,
      alignItems: "center",
    },
    map: {
      width: screenWidth,
      height: (screenWidth * 9) / 16,
    },
  });
