import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View, FlatList, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Dimensions } from "react-native";
import { MainBody, IconBtn, MarkerCallout, ArrowLine, AppBar, NAVBAR_HEIGHT, ErrorPage, LoadingPage } from "@components";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import ExploreListModal from "@components/map/explore_list_modal";
import ExploreItem from "@components/map/explore_item";
import ExploreModal from "@components/map/explore_modal";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useAppTheme } from "@providers/style_provider";
import { getBoundaries } from "@/plugins/geolocation";
import { Paginated, useFeathers } from "@/providers/feathers_provider";
import { Location, Route } from "@/models";
import { getCurrentPositionAsync } from "expo-location";
import { ActivityIndicator, Text } from "react-native-paper";

const ITEM_WIDTH = 300;
const ITEM_SPACING = 10;

export default function Explore() {
  const { theme } = useAppTheme();
  const feathers = useFeathers();

  const { id, routeId, latitude, longitude } = useLocalSearchParams<{ id?: string; routeId?: string; latitude?: string; longitude?: string }>();
  const [points, setPoints] = useState<Location[]>([]);
  const [route, setRoute] = useState<Route>();

  const initPoint = {
    latitude: !!latitude ? Number(latitude) : 39.92634215565024,
    longitude: !!longitude ? Number(longitude) : 44.74058628178656,
  };
  const [loaded, setLoaded] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const style = useStyle({
    spacing: theme.spacing,
    screenWidth,
  });

  const [listOpen, setListOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusPoint, setFocusPoint] = useState<string | undefined>(id);
  const focusIndex = useMemo(() => points.findIndex((point) => point._id === focusPoint), [focusPoint]);
  const mapRef = createRef<MapView>();

  const routeListRef = createRef<FlatList>();
  const cardListStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      bottom: withTiming(detailOpen || listOpen ? -screenHeight : NAVBAR_HEIGHT + 86),
    };
  });

  const isAnimate = useRef(false);

  useEffect(() => {
    async function init() {
      try {
        if (!routeId) return;
        const routeRes: Route = await feathers.service("routes").get(routeId);
        setRoute(routeRes);

        const locations: Location[] = [];
        var total = 1;
        while (total > locations.length) {
          const results: Paginated<Location> = await feathers
            .service("locations")
            .find({ query: { route: routeId, $sort: { order: 1 }, $skip: locations.length } });
          if (total != results.total) total = results.total;
          if (results.total === 0 || results.data.length === 0) break;
          locations.push(...results.data);
        }

        setPoints(locations);
        if (mapRef.current) {
          mapRef.current.animateCamera?.({
            center: initPoint,
          });
        }
      } catch (error) {
        console.warn("init map error:", error);
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, []);

  // Watch focusPoint
  useEffect(() => {
    if (!focusPoint) return;
    if (isAnimate.current) return;

    isAnimate.current = true;
    if (mapRef.current) {
      const focus = points[focusIndex];
      mapRef.current.animateCamera?.({
        center: {
          latitude: focus?.latitude,
          longitude: focus?.longitude,
        },
      });
    }
    if (routeListRef.current) {
      routeListRef.current.scrollToIndex({ animated: true, index: focusIndex, viewPosition: 0.5 });
    }

    isAnimate.current = false;
  }, [focusPoint]);

  const onMapPressed = () => {
    // close all bottom sheets
    setDetailOpen(false);
    setListOpen(false);
  };

  const onCurrentLocationPressed = async () => {
    if (!mapRef.current) return;
    const { coords } = await getCurrentPositionAsync();
    mapRef.current.animateCamera?.({ center: coords });
  };

  const computeFocusPoint = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING));
    if (!isAnimate.current && focusPoint !== points[index]._id) setFocusPoint(points[index]._id);
  };

  return (
    <MainBody padding={{ top: 0, bottom: NAVBAR_HEIGHT, right: 0, left: 0 }}>
      <AppBar showBack title={route?.name || ""} />
      {loaded ? (
        route ? (
          <View style={{ position: "relative", width: "100%", height: "100%" }}>
            <MapView
              ref={mapRef}
              style={style.map}
              initialRegion={{
                ...initPoint,
                latitudeDelta: 0.009,
                longitudeDelta: 0.009,
              }}
              mapType="satellite"
              userInterfaceStyle="dark"
              minZoomLevel={10}
              onPress={onMapPressed}
              showsCompass
              showsUserLocation
              showsMyLocationButton={false}
              rotateEnabled={false}
            >
              <ArrowLine key={route._id} coordinates={points} strokeWidth={6} strokeColor={theme.colors.tertiary} arrowSize={20} />
              {points.map((point) => (
                <Marker
                  key={point._id}
                  coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                  onPress={() => setFocusPoint(point._id)}
                  onCalloutPress={() => setDetailOpen(true)}
                  zIndex={10}
                >
                  <MarkerCallout title={point.name} desc={point.desc} image={point.images?.[0]} />
                </Marker>
              ))}
            </MapView>
            {/* Point pickers */}
            {points.length ? (
              <Animated.View style={cardListStyle}>
                <FlatList
                  ref={routeListRef}
                  snapToInterval={ITEM_WIDTH + ITEM_SPACING}
                  pagingEnabled={true}
                  decelerationRate={"fast"}
                  horizontal
                  ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
                  data={points}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => <ExploreItem points={points.filter((point) => point.route === item.route)} id={item._id} />}
                  onMomentumScrollEnd={computeFocusPoint}
                  contentContainerStyle={style.listContainer}
                  onScrollToIndexFailed={(info) => {
                    const wait = new Promise((resolve) => setTimeout(resolve, 500));
                    wait.then(() => {
                      routeListRef.current?.scrollToIndex({
                        index: info.index,
                        animated: false,
                      });
                    });
                  }}
                  showsHorizontalScrollIndicator={false}
                />
              </Animated.View>
            ) : null}

            <View style={style.buttonsContainer}>
              <IconBtn style={style.iconButton} icon="location" iconProps={{ fill: theme.colors.text }} onPress={onCurrentLocationPressed} />
              <IconBtn
                square
                style={style.iconButton}
                icon="menu"
                iconProps={{ fill: theme.colors.text }}
                onPress={() => setListOpen((prev) => !prev)}
              />
            </View>
            <ExploreListModal open={listOpen} setOpen={setListOpen} data={points} />
            <ExploreModal open={detailOpen} setOpen={setDetailOpen} data={points[focusIndex]} />
          </View>
        ) : (
          <ErrorPage />
        )
      ) : (
        <LoadingPage />
      )}
    </MainBody>
  );
}

const useStyle = ({ spacing, screenWidth }: { spacing: any; screenWidth: number }) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignContent: "center" },
    map: {
      height: "100%",
      width: "100%",
    },
    list: {
      position: "absolute",
      bottom: NAVBAR_HEIGHT + 86 + spacing.md,
    },
    listContainer: {
      paddingHorizontal: (screenWidth - ITEM_WIDTH) / 2,
    },
    buttonsContainer: {
      position: "absolute",
      bottom: NAVBAR_HEIGHT + 86 + spacing.md + 120 + spacing.md,
      right: spacing.lg,
    },
    iconButton: {
      marginTop: spacing.md,
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
