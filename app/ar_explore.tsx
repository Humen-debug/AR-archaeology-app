import { ViroARScene, ViroARSceneNavigator, ViroBox, ViroNode, ViroQuad } from "@viro-community/react-viro";
import { useAppTheme } from "../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import ArrowIcon from "../assets/icons/arrow-up.svg";
import MainBody from "../components/main_body";
import IconBtn from "../components/icon_btn";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect, createRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import _, { transform } from "lodash";
import { ActivityIndicator, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";

/*
 * stackoverflow.com/questions/47419496/augmented-reality-with-react-native-points-of-interest-over-the-camera
 * Solution to convert latitude and longitude to device's local coordinates and vice versa
 * https://github.com/ViroCommunity/geoar/blob/master/App.js for coding
 */

const distanceBetweenPoints = (p1, p2) => {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  var dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.latitude * Math.PI) / 180) * Math.cos((p2.latitude * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

const latLongToMerc = (latDeg: number, longDeg: number) => {
  // From: https://gist.github.com/scaraveos/5409402
  const longRad = (longDeg / 180.0) * Math.PI;
  const latRad = (latDeg / 180.0) * Math.PI;
  const smA = 6378137.0;
  const xmeters = smA * longRad;
  const ymeters = smA * Math.log((Math.sin(latRad) + 1) / Math.cos(latRad));
  return { x: xmeters, y: ymeters };
};

// Important to wrap the props with arSceneNavigator and viroAppProps, based on the
// guidance of ViroReact
interface ARExploreProps {
  arSceneNavigator: {
    viroAppProps: {
      location?: Location.LocationObjectCoords | undefined;
      nearbyItems: Location.LocationObjectCoords[];
    };
  };
}

function ARExplorePage(props?: ARExploreProps) {
  const transformGpsToAR = (lat, lng) => {
    if (!props?.arSceneNavigator.viroAppProps.location) return undefined;
    const isAndroid = Platform.OS === "android";
    const latObj = lat;
    const longObj = lng;
    const latMobile = props?.arSceneNavigator.viroAppProps.location?.latitude;
    const longMobile = props?.arSceneNavigator.viroAppProps.location?.longitude;

    if (!longMobile || !latMobile) return undefined;

    const deviceObjPoint = latLongToMerc(latObj, longObj);
    const mobilePoint = latLongToMerc(latMobile, longMobile);
    const objDeltaY = deviceObjPoint.y - mobilePoint.y;
    const objDeltaX = deviceObjPoint.x - mobilePoint.x;

    if (isAndroid) {
      const degree = props?.arSceneNavigator.viroAppProps.location?.heading;
      if (!degree) return undefined;
      const angleRadian = (degree * Math.PI) / 180;
      const newObjX = objDeltaX * Math.cos(angleRadian) - objDeltaY * Math.sin(angleRadian);
      const newObjY = objDeltaX * Math.sin(angleRadian) + objDeltaY * Math.cos(angleRadian);
      return { x: newObjX, z: -newObjY };
    }

    return { x: objDeltaX, z: -objDeltaY };
  };

  const placeARObjects = () => {
    if (!props?.arSceneNavigator.viroAppProps.nearbyItems) {
      return undefined;
    }

    const ARObjects = props?.arSceneNavigator.viroAppProps.nearbyItems?.map((item, index) => {
      const coords = transformGpsToAR(item.latitude, item.longitude);
      if (!coords) return undefined;

      const scale = Math.abs(Math.round(coords.z / 15));

      return (
        <ViroNode key={index} scale={[scale, scale, scale]} rotation={[0, 0, 0]} position={[coords.x, 0, coords.z]}>
          <ViroBox />
        </ViroNode>
      );
    });
    return ARObjects;
  };

  const placeNavigationPlane = () => {
    return <ViroQuad position={[0, -1, -2]} height={2} width={0.5} rotation={[-45, 0, 0]} />;
  };

  return <ViroARScene>{props?.arSceneNavigator.viroAppProps.location && placeARObjects()}</ViroARScene>;
}

export default () => {
  const theme = useAppTheme();
  const { top } = useSafeAreaInsets();
  const [nearestItem, setNearestItem] = useState<Location.LocationObjectCoords>();
  const mapRef = createRef<MapView>();
  // demo
  const [initLocation, setInitLocation] = useState<Location.LocationObjectCoords>();
  const [location, setLocation] = useState<Location.LocationObjectCoords>();
  const [heading, setHeading] = useState<number>();
  const [nearbyItems, setNearbyItems] = useState<Location.LocationObjectCoords[]>([]);
  const [locationListener, setLocationListener] = useState<Location.LocationSubscription>();
  const [headingListener, setHeadingListener] = useState<Location.LocationSubscription>();

  useEffect(() => {
    (async () => {
      await getCurrentPosition();
    })();
  }, []);

  useEffect(() => {
    return () => {
      locationListener?.remove();
    };
  }, [locationListener]);

  useEffect(() => {
    return () => {
      headingListener?.remove();
    };
  }, [headingListener]);

  useEffect(() => {
    (async () => {
      await getNearbyItems();
    })();
  }, [location]);

  const getCurrentPosition = async () => {
    // demo setting static init location
    let loc = await Location.getCurrentPositionAsync();
    setInitLocation(loc.coords);

    const geoOpt: Location.LocationOptions = {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 10,
    };

    const geoCallback = async (result: Location.LocationObject) => {
      const coords = result.coords;
      if (coords.accuracy && coords.accuracy < 40) {
        setLocation(coords);

        // Moving map to center user's location
        mapRef?.current?.animateToRegion({ latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      }
    };

    const listener = await Location.watchPositionAsync(geoOpt, geoCallback);
    setLocationListener(listener);

    const headingListener = await Location.watchHeadingAsync((heading) => {
      if (heading.trueHeading >= 0) setHeading(heading.trueHeading);
    });
    setHeadingListener(headingListener);
  };

  const getNearbyItems = async () => {
    // demo

    if (initLocation) {
      const lat = initLocation.latitude + 8 * Math.pow(10, -5);
      const lon = initLocation.longitude + Math.pow(10, -5);

      const locations: Location.LocationObjectCoords[] = [
        {
          ...initLocation,
          latitude: lat,
          longitude: lon,
        },
      ];
      const distances = locations.map((item, index) => [distanceBetweenPoints(location, item), index]);
      if (distances.length !== 0) {
        const minDist = distances.reduce((previousValue, currentValue) => {
          return previousValue[0] < currentValue[0] ? previousValue : currentValue;
        });

        setNearestItem?.(locations[minDist[1]]);
      }
      setNearbyItems(locations);
    }
  };

  const placeMarkers = () => {
    if (nearbyItems.length === 0) {
      return undefined;
    }
    const markers = nearbyItems.map((item, index) => {
      return <Marker key={index} coordinate={{ longitude: item.longitude, latitude: item.latitude }} />;
    });
    return markers;
  };

  const getCompassRotation = () => {
    if (!nearestItem || !location) return 0;
    const isAndroid = Platform.OS === "android";

    const latObj = nearestItem.latitude;
    const longObj = nearestItem.longitude;
    const latMobile = location?.latitude;
    const longMobile = location?.longitude;

    const objPoint = latLongToMerc(latObj, longObj);
    const mobilePoint = latLongToMerc(latMobile, longMobile);

    let y = objPoint.y - mobilePoint.y;
    let x = objPoint.x - mobilePoint.x;

    if (isAndroid) {
      console.log("current heading", heading, location.heading);
      const degree = heading ?? 0;
      const angleRadian = (degree * Math.PI) / 180;
      x = x * Math.cos(angleRadian) - y * Math.sin(angleRadian);
      y = x * Math.sin(angleRadian) + y * Math.cos(angleRadian);
    }

    // It is for rotating the icon from upward to right
    // As the rotation is according to the Cartesian coordinate system,
    // in which 0 deg points to the right, and deg is rotated in anticlockwise
    const iconDegreeDelta = 90;
    const res = -(Math.atan2(y, x) + iconDegreeDelta);
    console.log(-res - iconDegreeDelta);
    return -90;
  };

  const getNearestDistance = () => {
    if (!nearestItem) return undefined;
    return distanceBetweenPoints(location, nearestItem);
  };

  return (
    <MainBody>
      <>
        <ViroARSceneNavigator initialScene={{ scene: ARExplorePage }} viroAppProps={{ location, nearbyItems }}></ViroARSceneNavigator>
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
          <IconBtn icon={<ChevronLeftIcon fill={theme.colors.grey1} />} onPress={() => router.back()} />
        </View>
        {getNearestDistance() && (
          <View style={[_style.distanceContainer, { top: top + theme.spacing.xs + 34 }]}>
            <LinearGradient colors={theme.colors.gradientBlack} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={_style.gradient}>
              <View style={[_style.rowLayout, { padding: theme.spacing.xs }]}>
                <ArrowIcon fill={theme.colors.grey1} style={{ transform: [{ rotate: `${getCompassRotation()}deg` }], width: 24, height: 24 }} />
                <View style={_style.columnLayout}>
                  <Text>Destination</Text>
                  {<Text>{Number(getNearestDistance()! * 1000).toFixed(2)} m</Text>}
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        {location && (
          <View style={[_style.miniMapContainer, { top: top + theme.spacing.xs + _style.distanceContainer.height + 34 + theme.spacing.sm }]}>
            <MapView
              ref={mapRef}
              style={_style.miniMap}
              region={{ ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
              showsUserLocation={true}
              showsMyLocationButton={false}
              zoomControlEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              scrollEnabled={false}
              minZoomLevel={15}
            >
              {placeMarkers()}
            </MapView>
          </View>
        )}
        {!(initLocation && location) && (
          <View style={_style.centerContainer}>
            <ActivityIndicator size={"large"} animating={true} />
          </View>
        )}
      </>
    </MainBody>
  );
};
const _style = StyleSheet.create({
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  columnLayout: {
    flexDirection: "column",
    alignContent: "flex-start",
    alignItems: "flex-start",
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
  distanceContainer: {
    position: "absolute",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    right: 0,
    width: 150,
    height: 50,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    flexShrink: 0,
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  miniMapContainer: {
    position: "absolute",
    right: 16,
    width: 134,
    height: 134,
    borderRadius: 12,
    borderColor: "white",
    borderWidth: 2,
    overflow: "hidden",
  },
  miniMap: {
    height: "100%",
    width: "100%",
  },
});
