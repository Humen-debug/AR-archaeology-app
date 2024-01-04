import { ViroARScene, ViroARSceneNavigator, ViroBox, ViroMaterials, ViroNode, ViroPolyline, ViroQuad, ViroText } from "@viro-community/react-viro";
import { useAppTheme } from "../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import ArrowIcon from "../assets/icons/arrow-up.svg";
import MainBody from "../components/main_body";
import IconBtn from "../components/icon_btn";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect, createRef } from "react";
import { View, StyleSheet } from "react-native";
import _ from "lodash";
import { ActivityIndicator, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import { Viro3DPoint } from "@viro-community/react-viro/dist/components/Types/ViroUtils";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

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

  const y = Math.sin(p2.longitude - p1.longitude) * Math.cos(p2.latitude);
  const x = Math.cos(p1.latitude) * Math.sin(p2.latitude) - Math.sin(p1.latitude) * Math.cos(p2.latitude) * Math.cos(p2.longitude - p1.longitude);
  const theta = Math.atan2(y, x);
  const bearing = ((theta * 180) / Math.PI + 360) % 360; // in degrees

  return bearing;
};

const transformGpsToAR = (deviceLoc, objLoc) => {
  if (!deviceLoc || !objLoc) return undefined;

  const objPoint = latLongToMerc(objLoc.latitude, objLoc.longitude);
  const devicePoint = latLongToMerc(deviceLoc.latitude, deviceLoc.longitude);
  // accuracy need improvement
  return { x: objPoint.x - devicePoint.x, z: devicePoint.y - objPoint.y };
};

const degreeInAR = (deviceLoc, objLoc) => {
  if (!deviceLoc || !objLoc) return 0;
  const ARpoint = transformGpsToAR(deviceLoc, objLoc);

  if (!ARpoint) return 0;
  return (Math.atan2(ARpoint.x, ARpoint.z) * 180) / Math.PI;
};

function ARExplorePage(props?: ARExploreProps) {
  // TODO: my guess is when scene init, it should also set its facing(etc to always start as facing north )
  function handleError(event) {
    console.log("OBJ loading failed with error: " + event.nativeEvent.error);
  }

  const placeARObjects = () => {
    if (!props?.arSceneNavigator.viroAppProps.nearbyItems) {
      return undefined;
    }

    const ARObjects = props?.arSceneNavigator.viroAppProps.nearbyItems?.map((item, index) => {
      const coords = transformGpsToAR(props?.arSceneNavigator.viroAppProps.location, item);
      if (!coords) return undefined;

      const scale = Math.max(Math.abs(Math.round(coords.z / 15)), 0.5);

      return (
        <ViroNode key={index} scale={[scale, scale, scale]} rotation={[0, 0, 0]} position={[coords.x, 0, coords.z]}>
          {/* <Viro3DObject
            source={require("../assets/models/location_pin/object.obj")}
            resources={[require("../assets/models/location_pin/material.mtl")]}
            type="OBJ"
            scale={[1, 1, 1]}
            rotation={[0, 0, 0]}
            position={[0, 0, 0]}
            onLoadEnd={() => {
              console.log("complete loading pin");
            }}
            onError={handleError}
          /> */}
          <ViroBox />
          <ViroText
            text={`${item.latitude.toFixed(2)}, ${item.longitude.toFixed(2)}\n${coords.x.toFixed(2)},${coords.z.toFixed(2)}`}
            width={2}
            height={2}
          />
        </ViroNode>
      );
    });
    return ARObjects;
  };

  const placeNavigationPlane = () => {
    return <ViroQuad position={[0, -1, -2]} height={2} width={0.5} rotation={[-45, 0, 0]} />;
  };

  const [position, setPosition] = useState<Viro3DPoint>([0, 0, 0]);

  const calPoint =
    props?.arSceneNavigator.viroAppProps.nearestPoint &&
    transformGpsToAR(props?.arSceneNavigator.viroAppProps.location, props?.arSceneNavigator.viroAppProps.nearestPoint);
  const point = { x: calPoint?.x || 0, z: calPoint?.z || 0 };

  const degree = (Math.atan2(point.x - position[0], point.z - position[2]) * 180) / Math.PI;
  const distance = Math.sqrt((point.z - position[2]) ** 2 + (point.x - position[0]) ** 2);

  ViroMaterials.createMaterials({
    path: {
      lightingModel: "Constant",
      diffuseColor: "#DBF43E",
      diffuseTexture: require("../assets/images/diffuse.png"),
      blendMode: "Add",
    },
  });

  return (
    <ViroARScene
      onCameraTransformUpdate={(cameraTransform) => {
        setPosition([cameraTransform.position[0], cameraTransform.position[1] - 1, cameraTransform.position[2]]);
      }}
    >
      {/* <ViroBox height={1} length={1} width={1} position={[point.x, -1, point.z]} /> */}
      {point.x !== 0 && point.z !== 0 && (
        <ViroBox
          height={0.001}
          length={0.1}
          width={0.6}
          scalePivot={[0, 0, -0.05]}
          scale={[1, 1, distance > 20 ? 20 * 10 : distance * 10]}
          materials={"path"}
          position={position}
          rotation={[0, degree, 0]}
        />
      )}
    </ViroARScene>
  );
}

export default () => {
  const theme = useAppTheme();
  const { top } = useSafeAreaInsets();
  const [nearestPoint, setNearestPoint] = useState<Location.LocationObjectCoords>();
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

  const getCurrentPosition = async () => {
    // demo setting static init location
    let loc = await Location.getCurrentPositionAsync();
    setInitLocation(loc.coords);

    const geoOpt: Location.LocationOptions = {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: distanceInterval, // update for each 10 meters
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

        setNearestPoint(locations[minDist[1]]);
      }
      setNearbyItems(locations);
    }
  };

  const placeMarkers = () => {
    if (nearbyItems.length === 0) {
      return undefined;
    }
    const markers = nearbyItems.map((item, index) => {
      // console.log("nearby item coordinate", item);
      return <Marker key={index} coordinate={{ longitude: item.longitude, latitude: item.latitude }} />;
    });
    return markers;
  };

  const getBearingDegree = () => {
    // http://www.movable-type.co.uk/scripts/latlong.html?from=48.9613600,-122.0413400&to=48.965496,-122.072989
    if (!nearestPoint || !location) return 0;
    // Accurate bearing degree
    const bearing = bearingBetweenTwoPoints(location, nearestPoint);
    // In case that GPS's accuracy is low, use the rending position to
    // guide user to the destination instead.
    const degree = degreeInAR(location, nearestPoint);
    if (heading && heading > -1) {
      if (degree) return 360 - ((heading - degree + 360) % 360); // hmm
      return 360 - ((heading - bearing + 360) % 360);
    }
    return bearing;
  };

  const getNearestDistance = () => {
    if (!nearestPoint) return undefined;
    // convert km to m
    const distance = distanceBetweenPoints(location, nearestPoint) * 1000;
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

  var degree = getBearingDegree();
  var distance = getNearestDistance();

  return (
    <MainBody>
      <>
        <ViroARSceneNavigator
          initialScene={{ scene: ARExplorePage }}
          viroAppProps={{ heading, location, nearbyItems, nearestPoint, degree, distance: distanceBetweenPoints(location, nearestPoint) * 1000 }}
        ></ViroARSceneNavigator>
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
        {distance && (
          <View style={[_style.distanceContainer, { top: top + theme.spacing.xs + 34 }]}>
            <LinearGradient colors={theme.colors.gradientBlack} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={_style.gradient}>
              <View style={[_style.rowLayout, { padding: theme.spacing.xs, gap: theme.spacing.sm }]}>
                <ArrowIcon fill={theme.colors.grey1} style={{ transform: [{ rotate: `${degree}deg` }], width: 24, height: 24 }} />
                <View style={_style.columnLayout}>
                  <Text>Destination</Text>
                  <Text>{distance}</Text>
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
            <Text variant="labelMedium" style={{ color: theme.colors?.primary, textAlign: "center", paddingBottom: theme.spacing.xs }}>
              {"Getting\npath information"}
            </Text>
            <ActivityIndicator size={"large"} animating={true} />
          </View>
        )}
      </>
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
      nearestPoint: Location.LocationObjectCoords;
      degree: Float;
      distance: Float;
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
    borderColor: "white",
    borderWidth: 2,
    overflow: "hidden",
  },
  miniMap: {
    height: "100%",
    width: "100%",
  },
});
