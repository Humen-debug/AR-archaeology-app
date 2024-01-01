import {
  Viro3DObject,
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  ViroAnimations,
  ViroMaterials,
  ViroNode,
} from "@viro-community/react-viro";
import { useAppTheme } from "../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import ArrowIcon from "../assets/icons/arrow-up.svg";
import MainBody from "../components/main_body";
import IconBtn from "../components/icon_btn";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect, createRef } from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import _, { transform } from "lodash";
import { ActivityIndicator, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { TouchableHighlight } from "react-native-gesture-handler";

/*
 * stackoverflow.com/questions/47419496/augmented-reality-with-react-native-points-of-interest-over-the-camera
 * Solution to convert latitude and longitude to device's local coordinates and vice versa
 * https://github.com/ViroCommunity/geoar/blob/master/App.js for coding
 */

const distanceBetweenPoints = (p1: LatLong | undefined, p2: LatLong | undefined) => {
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

/*
 * From http://www.movable-type.co.uk/scripts/latlong.html?from=48.9613600,-122.0413400&to=48.965496,-122.072989
 * Given two points, return the bearing degree from p1 to p2
 */
const bearingBetweenTwoPoints = (p1: LatLong | undefined, p2: LatLong | undefined) => {
  if (!p1 || !p2) return 0;

  const lat1 = p1.latitude - Math.PI / 180;
  const lat2 = p2.latitude - Math.PI / 180;
  const dLong = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const y = Math.sin(dLong) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLong);

  const theta = Math.atan2(y, x);
  const bearing = ((theta * 180) / Math.PI + 360) % 360;
  return bearing;
};

const degreeInAR = (location, obj) => {
  if (!location || !obj) return 0;
  const latObj = obj.latitude;
  const longObj = obj.longitude;
  const latMobile = location.latitude;
  const longMobile = location.longitude;

  if (!longMobile || !latMobile) return undefined;

  const deviceObjPoint = latLongToMerc(latObj, longObj);
  const mobilePoint = latLongToMerc(latMobile, longMobile);
  const objDeltaY = deviceObjPoint.y - mobilePoint.y;
  const objDeltaX = deviceObjPoint.x - mobilePoint.x;

  // convert the degree from right side of x-axis to top of y-axis
  const degree = ((Math.atan2(objDeltaY, objDeltaX) * 180) / Math.PI + 270) % 360;
  return degree;
};

function ARExplorePage(props?: ARExploreProps) {
  ViroAnimations.registerAnimations({
    rotation: {
      properties: {
        rotateY: "+=10",
      },
      duration: 3000 / 36,
    },
  });

  ViroMaterials.createMaterials({
    area: {
      lightingModel: "Constant",
      diffuseColor: "#DBF43E30",
      colorWritesMask: "Green",
      blendMode: "Alpha",
    },
  });

  const transformGpsToAR = (lat, lng) => {
    if (!props?.arSceneNavigator.viroAppProps.location) return undefined;

    const latObj = lat;
    const longObj = lng;
    const latMobile = props?.arSceneNavigator.viroAppProps.location?.latitude;
    const longMobile = props?.arSceneNavigator.viroAppProps.location?.longitude;

    if (!longMobile || !latMobile) return undefined;

    const deviceObjPoint = latLongToMerc(latObj, longObj);
    const mobilePoint = latLongToMerc(latMobile, longMobile);
    // accuracy need improvement
    const objDeltaY = deviceObjPoint.y - mobilePoint.y;
    const objDeltaX = deviceObjPoint.x - mobilePoint.x;
    return { x: objDeltaX, z: -objDeltaY };
  };

  function handleError(event) {
    console.log("OBJ loading failed with error: " + event.nativeEvent.error);
  }

  const placeARObjects = () => {
    if (!props?.arSceneNavigator.viroAppProps.nearbyItems) {
      return undefined;
    }

    const ARObjects = props?.arSceneNavigator.viroAppProps.nearbyItems?.map((item, index) => {
      const coords = transformGpsToAR(item.latitude, item.longitude);
      if (!coords) return undefined;
      const scale = Math.min(Math.abs(Math.round(15 / coords.z)), 0.5);

      return (
        <ViroNode key={index} scale={[scale, scale, scale]} rotation={[0, 0, 0]} position={[coords.x, 0, coords.z]}>
          <Viro3DObject
            source={require("../assets/models/star/object.obj")}
            resources={[require("../assets/models/star/material.mtl")]}
            type="OBJ"
            scale={[0.5, 0.5, 0.5]}
            onError={handleError}
            shadowCastingBitMask={2}
            animation={{ name: "rotation", run: true, loop: true }}
          />
          {/* Default 2.5m radius */}
          <Viro3DObject
            source={require("../assets/models/circle/object.obj")}
            resources={[require("../assets/models/circle/circle.mtl")]}
            type="OBJ"
            onError={handleError}
            rotation={[0, 0, 0]}
            position={[0, -5, 0]}
            materials={["area"]}
          />
        </ViroNode>
      );
    });
    return ARObjects;
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#FFFFFF" intensity={1000} />
      {props?.arSceneNavigator.viroAppProps.location && placeARObjects()}
    </ViroARScene>
  );
}

export default () => {
  const theme = useAppTheme();
  const { top } = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const animatedProps = { duration: 300, easing: Easing.inOut(Easing.quad) };
  const [mapExpand, setMapExpand] = useState<boolean>(false);
  const miniMapStyle = useAnimatedStyle(() => {
    var pos = mapExpand
      ? { bottom: 0, right: 0, left: 0, top: undefined }
      : { top: top + theme.spacing.xs + _style.distanceContainer.height + 34 + theme.spacing.sm, right: 16, left: undefined, bottom: undefined };

    return {
      position: mapExpand ? "relative" : "absolute",
      height: withTiming(mapExpand ? 200 : 134, animatedProps),
      width: mapExpand ? "100%" : 134,
      overflow: "hidden",
      borderColor: "white",
      borderRadius: mapExpand ? 0 : 12,
      borderWidth: 2,
      ...pos,
    };
  });
  const ARsceneStyle = useAnimatedStyle(() => {
    return { height: withTiming(mapExpand ? screenHeight - 200 : screenHeight, animatedProps) };
  });

  const [nearestItem, setNearestItem] = useState<Location.LocationObjectCoords>();
  const mapRef = createRef<MapView>();
  // demo
  const [initLocation, setInitLocation] = useState<Location.LocationObjectCoords>();
  const [location, setLocation] = useState<Location.LocationObjectCoords>();
  const [heading, setHeading] = useState<number>();
  const [nearbyItems, setNearbyItems] = useState<Location.LocationObjectCoords[]>([]);
  const [locationListener, setLocationListener] = useState<Location.LocationSubscription>();
  const [headingListener, setHeadingListener] = useState<Location.LocationSubscription>();
  // const
  const distanceInterval: number = 25;

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

  const handleMapPressed = () => {
    setMapExpand((value) => !value);
  };

  const getCurrentPosition = async () => {
    // demo setting static init location
    let loc = await Location.getCurrentPositionAsync();
    setInitLocation(loc.coords);

    const geoOpt: Location.LocationOptions = {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: distanceInterval, // update for each 25 meters
    };

    const geoCallback = async (result: Location.LocationObject) => {
      const coords = result.coords;
      if (coords.accuracy && coords.accuracy < 50) {
        setLocation(coords);

        // Moving map to center user's location
        mapRef?.current?.animateToRegion({ latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      }
    };

    const listener = await Location.watchPositionAsync(geoOpt, geoCallback);
    setLocationListener(listener);

    const headingListener = await Location.watchHeadingAsync((heading) => {
      // for iOS devices
      setHeading(heading.magHeading);
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

  const getBearingDegree = () => {
    // http://www.movable-type.co.uk/scripts/latlong.html?from=48.9613600,-122.0413400&to=48.965496,-122.072989
    if (!nearestItem || !location) return 0;
    // Accurate bearing degree
    const bearing = bearingBetweenTwoPoints(location, nearestItem);
    // In case that GPS's accuracy is low, use the rending position to
    // guide user to the destination instead.
    const degree = degreeInAR(location, nearestItem);
    if (heading && heading > -1) {
      if (degree) return 360 - ((heading - degree + 360) % 360);
      return 360 - ((heading - bearing + 360) % 360);
    }
    return bearing;
  };

  const getNearestDistance = () => {
    if (!nearestItem) return undefined;
    // convert km to m
    const distance = distanceBetweenPoints(location, nearestItem) * 1000;
    if (distance > 99) {
      return ">100m";
    } else if (distance > 49) {
      return ">50m";
    } else if (distance > 19) {
      return ">20m";
    } else if (distance > 9) {
      return ">10m";
    } else if (distance > 5) {
      return "~10m";
    } else {
      return "~5m";
    }
  };

  return (
    <MainBody>
      <Animated.View style={ARsceneStyle}>
        <ViroARSceneNavigator
          style={{ width: "100%", height: "100%" }}
          initialScene={{ scene: ARExplorePage }}
          viroAppProps={{ heading, location, nearbyItems }}
        />
      </Animated.View>
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
            <View style={[_style.rowLayout, { padding: theme.spacing.xs, gap: theme.spacing.sm }]}>
              <ArrowIcon fill={theme.colors.grey1} style={{ transform: [{ rotate: `${getBearingDegree()}deg` }], width: 24, height: 24 }} />
              <View style={_style.columnLayout}>
                <Text>Destination</Text>
                <Text>{getNearestDistance()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}
      {location && (
        <Animated.View style={miniMapStyle}>
          <TouchableHighlight onPress={handleMapPressed} activeOpacity={1}>
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
          </TouchableHighlight>
        </Animated.View>
      )}
      {!(initLocation && location) && (
        <View style={_style.centerContainer}>
          <ActivityIndicator size={"large"} animating={true} />
        </View>
      )}
    </MainBody>
  );
};

/*
 * Important to wrap the props with arSceneNavigator and viroAppProps, based on the
 * guidance of ViroReact
 */
interface ARExploreProps {
  arSceneNavigator: {
    viroAppProps: {
      heading?: number | undefined;
      location?: Location.LocationObjectCoords | undefined;
      nearbyItems: Location.LocationObjectCoords[];
    };
  };
}

interface LatLong {
  latitude: number;
  longitude: number;
  [key: string]: any;
}

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
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
  },
  miniMap: {
    height: "100%",
    width: "100%",
  },
});
