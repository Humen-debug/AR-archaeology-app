import { AppBar, Carousel, ContentItem, ErrorPage, LoadingPage, MainBody, NAVBAR_HEIGHT } from "@/components";
import { CompassIcon, FootStepsIcon, LocationIcon, MountainIcon, TimeOutlineIcon } from "@/components/icons";
import MapPreview from "@/components/map/map_preview";
import { GeoPoint, Location, Route } from "@/models";
import { distanceFromLatLonInKm } from "@/plugins/geolocation";
import { getThumb } from "@/plugins/utils";
import { Paginated, useFeathers } from "@/providers/feathers_provider";
import { AppTheme, useAppTheme } from "@/providers/style_provider";
import { router, useLocalSearchParams } from "expo-router";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

export default function Page() {
  const feathers = useFeathers();
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const style = useStyle({ theme, screenWidth });
  /**
   * @property {string} id refers to the _id of model
   */
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loaded, setLoaded] = useState(false);
  const [route, setRoute] = useState<Route>();
  const [points, setPoints] = useState<Location[]>([]);
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
        const locations: Location[] = [];
        while (total.current > locations.length) {
          const results: Paginated<Location> = await feathers.service("locations").find({
            query: { route: id, $sort: "order", $skip: locations.length },
          });

          total.current = results.total;
          if (results.total === 0 || results.data.length === 0) break;

          locations.push(...results.data);
        }
        var sum = 0;
        if (locations.length > 1) {
          for (let i = 1; i < locations.length; i++) {
            const prev = locations[i - 1];
            const cur = locations[i];
            sum += distanceFromLatLonInKm(prev, cur);
          }
        }
        // round up to nearest 0.05
        const distance = Math.ceil(sum * 20) / 20;
        var text = "";
        if (distance < 1) {
          text = `${distance * 1000} m`;
        } else {
          text = `${distance} km`;
        }
        setDistance(text);
        const duration = Number((sum / avgKmPerHour).toFixed(2));
        if (duration < 1) {
          text = `~${Math.round(duration * 60)} minutes`;
        } else if (duration > 1) {
          text = `${duration} hours`;
        } else {
          text = "1 hour";
        }
        setDuration(text);
        setPoints(locations);
        setRoute(res);
      } catch (error) {
        console.warn(error);
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, []);

  function startARTour(index: number) {
    const ids = points.map(({ _id }) => _id);
    router.push({ pathname: "/ar_explore", params: { service: "locations", targetId: index, idString: JSON.stringify(ids) } });
  }

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
        <LoadingPage />
      ) : route ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: NAVBAR_HEIGHT + theme.spacing.md }}>
          {renderTopSection()}
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.text, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xl }}
          >
            {route.desc}
          </Text>

          {points && points.length ? (
            <View style={{ flexDirection: "column" }}>
              <Text variant="titleMedium" style={{ color: theme.colors.text, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xs }}>
                Explore the area
              </Text>
              <MapPreview points={points} style={style.map} />
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
                  onPress={() =>
                    router.push({
                      pathname: "/home/route_map",
                      params: { latitude: points[0].latitude, longitude: points[0].longitude, routeId: route._id },
                    })
                  }
                  textColor={theme.colors.textOnPrimary}
                  style={style.button}
                  labelStyle={style.buttonLabelStyle}
                  // icon={() => <LocationIcon fill={theme.colors.textOnPrimary} size={20} />}
                >
                  <Text variant="labelMedium" style={{ color: theme.colors.textOnPrimary, textAlignVertical: "center" }}>
                    View in a map
                  </Text>
                </Button>
                <Button
                  mode="outlined"
                  style={[style.button, { borderWidth: 2, borderColor: theme.colors.primary }]}
                  labelStyle={style.buttonLabelStyle}
                  // icon={() => <CompassIcon fill={theme.colors.primary} size={20} />}
                >
                  <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                    Start AR tour
                  </Text>
                </Button>
              </View>
            </View>
          ) : null}

          {route.content ? (
            <View style={{ flexDirection: "column", rowGap: 1.5 * theme.spacing.xl }}>
              {route.content.map((item, index) => (
                <ContentItem content={item} key={index} imageStyle={{ marginHorizontal: theme.spacing.lg, borderRadius: theme.spacing.xs }} />
              ))}
            </View>
          ) : null}

          <View style={{ flexDirection: "column", rowGap: theme.spacing.xl, marginTop: theme.spacing.xl * 1.5 }}>
            {points
              ? points.map((point, index) => (
                  <View key={point._id} style={{ flexDirection: "column", rowGap: theme.spacing.md }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        columnGap: theme.spacing.xs,
                        paddingHorizontal: theme.spacing.lg,
                      }}
                    >
                      <Text variant="titleMedium" style={{ color: theme.colors.text, flexGrow: 1, flexShrink: 1 }}>
                        {index + 1}. {point.name}
                      </Text>
                      <Button
                        mode="contained"
                        textColor={theme.colors.textOnPrimary}
                        style={style.button}
                        labelStyle={style.buttonLabelStyle}
                        onPress={() => startARTour(index)}
                      >
                        <Text
                          variant="labelMedium"
                          style={{ color: theme.colors.textOnPrimary, textAlignVertical: "center", flexShrink: 1, flexGrow: 0 }}
                        >
                          Start AR tour
                        </Text>
                      </Button>
                    </View>

                    {point.images && <Carousel images={point.images} />}

                    <Text
                      variant="bodyMedium"
                      style={{
                        color: theme.colors.text,
                        paddingHorizontal: theme.spacing.lg,
                      }}
                    >
                      {point.desc || ""}
                    </Text>
                  </View>
                ))
              : null}
          </View>
        </ScrollView>
      ) : (
        <ErrorPage />
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
      height: Math.round((screenWidth * 9) / 16),
      position: "relative",
    },
    labelRow: {
      flexDirection: "row",
      gap: theme.spacing.xs,
      alignItems: "center",
    },
    map: {
      width: screenWidth,
      height: Math.round((screenWidth * 9) / 32),
    },
    button: {
      borderRadius: theme.borderRadius.xs,
      flexDirection: "row",
      alignContent: "center",
      padding: 0,
    },
    buttonLabelStyle: {
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
    },
  });
