import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View, FlatList, Platform } from "react-native";
import MapView, { LatLng, Marker, Polyline } from "react-native-maps";
import { Dimensions } from "react-native";
import { useAppTheme } from "@styles";
import { MainBody, IconBtn, MarkerCallout } from "@components";
import { createRef, useEffect, useMemo, useState } from "react";
import ExploreListModal from "@components/explore/explore_list_modal";
import ExploreItem from "@components/explore/explore_item";
import ExploreModal from "@/components/explore/explore_modal";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

export const POINTS = [
  {
    _id: "0",
    title: "Starting point",
    latitude: 39.926781353240344,
    longitude: 44.737506336440376,
  },
  {
    _id: "1",
    title: "Lower Trench",
    latitude: 39.925769,
    longitude: 44.74278,
    desc: "The lower trench explores the area between the site’s main fortification walls. Archaeologists found a series of rough rectangular structures built near the surface sitting within the local drainage channel here. Archaeologists speculate that the structures at the top might be built during the late Medieval period for capturing water or for animal pens. Below the top layer, there are at least four wash layers. The bottom layer sits directly above natural bedrock and archaeologists found pottery dating back to the Late Bronze Age-Iron Age 1 here.",
  },
  {
    _id: "2",
    title: "Top Trench",
    latitude: 39.92469,
    longitude: 44.744071,
    desc: "The top trench sits at the top of the site and has the deepest stratigraphy down to insitu Late Bronze Age-Iron Age 1 (ca. 1550 B.C.E. to 800 B.C.E.) layers. A portion of the site’s upper fortification wall runs along the western side of the entire trench. Archaeologists hypothesize that people in Early Medieval period rebuilt the wall on the remains of the Late Bronze Age-Iron Age 1 wall with some sections eroded away and others covered with dirt. Archaeologists also found a hard-pack layer throughout the southern part of the trench. The ashy soil with chunks of burnt wood indicates that the fortress was burned around 800 B.C.E., which may be due to the attack by the Urartians. ",
  },
  {
    _id: "3",
    title: "East shelf trench",
    latitude: 39.924963,
    longitude: 44.74524,
    desc: "In the east shelf trench, archaeologists found a bell-shaped burial pit dug into the natural bedrock. This pit contained ashy soil with several minimally fragmented pottery vessels and other interesting finds. However, there were almost no bones, so the archaeologists proposed that this may be a cremation burial. They also found a pottery jar directly above the pit, which may have been a marker for the burial. A carbon sample collected here dates to the Early Medieval period (416-545 C.E.). ",
  },
];

export const getBoundaries = (points: { latitude: number; longitude: number }[]) => {
  let north = -Infinity,
    east = -Infinity;
  let west = Infinity,
    south = Infinity;
  for (const point of points) {
    const { latitude, longitude } = point;
    if (latitude > north) north = latitude;
    if (latitude < south) south = latitude;
    if (longitude > east) east = longitude;
    if (longitude < west) west = longitude;
  }
  return {
    northEast: { latitude: north, longitude: east },
    southWest: { latitude: south, longitude: west },
  };
};

export default function Explore() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const itemWidth = 300;
  const itemSpacing = 10;
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const _style = useStyle({
    spacing: theme.spacing,
    itemWidth,
    screenWidth,
  });

  const [listOpen, setListOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusPoint, setFocusPoint] = useState<string | undefined>(id);
  const focusIndex = useMemo(() => POINTS.findIndex((point) => point._id === focusPoint), [focusPoint]);
  const mapRef = createRef<MapView>();
  const routeListRef = createRef<FlatList>();
  const cardListStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      bottom: withTiming(detailOpen || listOpen ? -screenHeight : 86 + theme.spacing.md),
    };
  });

  const [isAnimate, setIsAnimate] = useState(false);
  const bound = getBoundaries(POINTS);
  useEffect(() => {
    if (mapRef.current && Platform.OS !== "ios") {
      mapRef.current.setMapBoundaries?.(bound.northEast, bound.southWest);
    }
  }, []);

  // Watch focusPoint
  useEffect(() => {
    if (mapRef.current && focusPoint) {
      if (focusIndex !== -1) {
        const focus = POINTS[focusIndex];
        mapRef.current.animateToRegion({
          latitude: focus?.latitude,
          longitude: focus?.longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        });
      }
    }
    if (routeListRef.current && focusPoint) {
      routeListRef.current.scrollToIndex({ animated: true, index: focusIndex, viewPosition: 0.5 });
    }
  }, [focusPoint]);

  const onMapPress = () => {
    // close all bottom sheets
    setDetailOpen(false);
    setListOpen(false);
  };

  const getItemId = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (itemWidth + itemSpacing));
    setFocusPoint(POINTS[index]._id);
  };

  return (
    <MainBody padding={{ right: 0, left: 0 }}>
      <>
        <MapView
          ref={mapRef}
          style={_style.map}
          initialRegion={{
            latitude: 39.92634215565024,
            longitude: 44.74058628178656,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          }}
          mapType="satellite"
          userInterfaceStyle="dark"
          minZoomLevel={10}
          onPress={onMapPress}
          onRegionChangeComplete={(region) => {
            if (!isAnimate && Platform.OS == "ios") {
              let needUpdate = false;
              const newRegion = { ...region };
              if (region.latitude > bound.northEast.latitude) {
                newRegion.latitude = bound.northEast.latitude - 0.00001;
                needUpdate = true;
              }
              if (region.latitude < bound.southWest.latitude) {
                newRegion.latitude = bound.southWest.latitude - 0.00001;
                needUpdate = true;
              }
              if (region.longitude > bound.northEast.longitude) {
                newRegion.longitude = bound.northEast.longitude + 0.00001;
                needUpdate = true;
              }
              if (region.longitude < bound.southWest.longitude) {
                newRegion.longitude = bound.southWest.longitude + 0.00001;
                needUpdate = true;
              }

              if (mapRef.current && needUpdate) {
                setIsAnimate(true);
                mapRef.current.animateToRegion(newRegion);
              }
            } else setIsAnimate(false);
          }}
        >
          {POINTS.map((point) => (
            <Marker key={point._id} coordinate={{ latitude: point.latitude, longitude: point.longitude }} onPress={() => setFocusPoint(point._id)}>
              <MarkerCallout
                {...point}
                onPress={() => {
                  setDetailOpen(true);
                }}
              />
            </Marker>
          ))}
          <Polyline coordinates={POINTS.map((point) => point as LatLng)} strokeWidth={6} strokeColor={theme.colors.secondary} />
        </MapView>
        {/* Point pickers */}
        <Animated.View style={cardListStyle}>
          <FlatList
            ref={routeListRef}
            snapToInterval={itemWidth + itemSpacing}
            pagingEnabled={true}
            decelerationRate={"fast"}
            horizontal
            ItemSeparatorComponent={() => <View style={{ width: itemSpacing }} />}
            data={POINTS}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ExploreItem title={item.title} POINTS={POINTS} id={item._id} />}
            onMomentumScrollEnd={getItemId}
            contentContainerStyle={_style.listContainer}
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

        {/* Path pickers */}
        {/* <FlatList
          snapToInterval={270 + itemSpacing}
          pagingEnabled={true}
          decelerationRate={"fast"}
          horizontal
          ItemSeparatorComponent={() => <View style={{ width: itemSpacing }} />}
          style={_style.list}
          data={DATA}
          renderItem={({ item }) => <ExploreItem title={item.title} length={item.length} isSaved={item.save} />}
          contentContainerStyle={_style.listContainer}
        /> */}
        <View style={_style.buttonsContainer}>
          <IconBtn style={_style.iconButton} icon="locate" iconProps={{ fill: theme.colors.grey1 }} onPress={() => {}} />
          <IconBtn
            style={_style.iconButton}
            icon="createAR"
            iconProps={{ fill: theme.colors.grey1 }}
            onPress={() => {
              router.push("/ar_explore");
            }}
          />
          <IconBtn
            square
            style={_style.iconButton}
            icon="menu"
            iconProps={{ fill: theme.colors.grey1 }}
            onPress={() => {
              setListOpen((prev) => !prev);
            }}
          />
        </View>
        <ExploreListModal open={listOpen} setOpen={setListOpen} data={POINTS} />
        <ExploreModal open={detailOpen} setOpen={setDetailOpen} data={POINTS[focusIndex]} />
      </>
    </MainBody>
  );
}

const useStyle = ({ spacing, itemWidth, screenWidth }: any) =>
  StyleSheet.create({
    map: {
      height: "100%",
      width: "100%",
    },
    list: {
      position: "absolute",
      bottom: 86 + spacing.md,
    },
    listContainer: {
      paddingHorizontal: (screenWidth - itemWidth) / 2,
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
