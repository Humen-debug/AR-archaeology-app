import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View, FlatList } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Dimensions } from "react-native";
import { MainBody, IconBtn, MarkerCallout } from "@components";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import ExploreListModal from "@components/map/explore_list_modal";
import ExploreItem from "@components/map/explore_item";
import ExploreModal from "@components/map/explore_modal";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useAppTheme } from "@providers/style_provider";
import { Paginated, useFeathers } from "@/providers/feathers_provider";
import { AttractionType, GeoPoint } from "@/models";
import { getCurrentPositionAsync } from "expo-location";
import { Button, Text } from "react-native-paper";

const ITEM_WIDTH = 300;
const ITEM_SPACING = 10;

export default function Explore() {
  const { theme } = useAppTheme();
  const feathers = useFeathers();
  const router = useRouter();
  const { id, latitude, longitude } = useLocalSearchParams<{ id?: string; latitude?: string; longitude?: string }>();
  const typeTabs: (AttractionType | null)[] = [null, "Attraction", "Restaurant", "Lodging", "Other"];

  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [selectedType, setSelectedType] = useState<AttractionType | null>(null);
  const filteredPoints = useMemo(() => (selectedType ? points.filter((point) => point.type === selectedType) : points), [selectedType, points]);

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
      bottom: withTiming(detailOpen || listOpen ? -screenHeight : 86 + theme.spacing.md),
    };
  });

  const isAnimate = useRef(false);

  useEffect(() => {
    async function init() {
      try {
        var total = 1;
        let points: GeoPoint[] = [];
        while (total > points.length) {
          const results: Paginated<GeoPoint> = await feathers.service("attractions").find({
            query: {
              latitude: { $exists: true },
              longitude: { $exists: true },
              $populate: ["tags"],
              $sort: { type: 1, order: 1 },
              $skip: points.length,
            },
          });
          if (total != results.total) total = results.total;
          if (results.total === 0 || results.data.length === 0) break;
          points.push(...results.data);
        }

        setPoints(points);

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
    const focus = points[focusIndex];
    if (mapRef.current) {
      mapRef.current.animateCamera?.({
        center: {
          latitude: focus?.latitude,
          longitude: focus?.longitude,
        },
      });
    }
    if (routeListRef.current) {
      const index = filteredPoints.indexOf(focus);
      if (index > -1) routeListRef.current.scrollToIndex({ animated: true, index: index, viewPosition: 0.5 });
    }

    isAnimate.current = false;
  }, [focusPoint]);

  const onMapPress = () => {
    // close all bottom sheets
    setDetailOpen(false);
    setListOpen(false);
  };

  const computeFocusPoint = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING));
    if (!isAnimate.current && focusPoint !== points[index]._id) setFocusPoint(points[index]._id);
  };

  return (
    <MainBody padding={{ right: 0, left: 0 }}>
      <View>
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
          minZoomLevel={5}
          onPress={onMapPress}
          showsCompass
          showsUserLocation
          showsMyLocationButton={false}
          rotateEnabled={false}
        >
          {filteredPoints.map((point) => (
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
        {/* Attraction types picker */}
        <View style={{ position: "absolute", left: 0, right: 0, top: theme.spacing.lg }}>
          <FlatList
            horizontal
            data={typeTabs}
            ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
            renderItem={({ item }) => {
              const isSelected = selectedType === item;
              return (
                <Button
                  onPress={() => setSelectedType(item)}
                  mode="contained"
                  buttonColor={isSelected ? theme.colors.primary : theme.colors.container}
                  labelStyle={{ marginHorizontal: theme.spacing.md, marginVertical: theme.spacing.xs }}
                >
                  <Text
                    style={{
                      color: isSelected ? theme.colors.textOnPrimary : theme.colors.text,
                      fontWeight: isSelected ? "bold" : "normal",
                    }}
                  >
                    {item || "All"}
                  </Text>
                </Button>
              );
            }}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {/* Point pickers */}
        {filteredPoints.length ? (
          <Animated.View style={cardListStyle}>
            <FlatList
              ref={routeListRef}
              snapToInterval={ITEM_WIDTH + ITEM_SPACING}
              pagingEnabled={true}
              decelerationRate={"fast"}
              horizontal
              ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
              data={filteredPoints}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <ExploreItem points={[item]} id={item._id} />}
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
          <IconBtn
            style={style.iconButton}
            icon="location"
            iconProps={{ fill: theme.colors.text }}
            onPress={async () => {
              if (!mapRef.current) return;
              const { coords } = await getCurrentPositionAsync();
              mapRef.current.animateCamera?.({ center: coords });
            }}
          />
          {__DEV__ && (
            <IconBtn
              style={style.iconButton}
              icon="createAR"
              iconProps={{ fill: theme.colors.text }}
              onPress={() => {
                router.push("/ar_explore");
              }}
            />
          )}
          <IconBtn
            square
            style={style.iconButton}
            icon="menu"
            iconProps={{ fill: theme.colors.text }}
            onPress={() => {
              setListOpen((prev) => !prev);
            }}
          />
        </View>
        <ExploreListModal open={listOpen} setOpen={setListOpen} data={points} isGrouped={false} />
        <ExploreModal open={detailOpen} setOpen={setDetailOpen} data={points[focusIndex]} />
      </View>
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
      bottom: 86 + spacing.md,
    },
    listContainer: {
      paddingHorizontal: Math.round((screenWidth - ITEM_WIDTH) / 2),
    },
    buttonsContainer: {
      position: "absolute",
      bottom: 86 + spacing.md + 120 + spacing.md,
      right: spacing.lg,
    },
    iconButton: {
      marginTop: spacing.md,
    },
  });
