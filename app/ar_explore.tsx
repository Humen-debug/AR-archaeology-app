import {
  Viro3DObject,
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  ViroAnimations,
  ViroBox,
  ViroMaterials,
  ViroNode,
} from "@viro-community/react-viro";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MainBody, IconBtn } from "@components";
import { ChevronLeftIcon, ArrowUpIcon } from "@components/icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, createRef, useCallback, useRef } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import _ from "lodash";
import { ActivityIndicator, Text } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { TouchableHighlight } from "react-native-gesture-handler";
import { Viro3DPoint } from "@viro-community/react-viro/dist/components/Types/ViroUtils";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { distanceFromLatLonInKm, bearingBetweenTwoPoints, transformGpsToAR, getNextPoint } from "@/plugins/geolocation";
import ParticlesEffect from "@/components/particles_effect";

function ARExplorePage(props?: ViroARSceneProps<ARExploreProps>) {
  const { location, points, nearestPoint } = props?.arSceneNavigator?.viroAppProps ?? {};

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
    path: {
      lightingModel: "Constant",
      diffuseColor: "#DBF43E",
      diffuseTexture: require("@assets/images/diffuse.png"),
      blendMode: "Add",
    },
  });

  function handleError(event) {
    console.log("OBJ loading failed with error: " + event.nativeEvent.error);
  }

  const placeARObjects = useCallback(() => {
    if (!points) {
      return undefined;
    }

    const ARObjects = points.map((item, index) => {
      const coords = transformGpsToAR(location, item);
      if (!coords) return undefined;

      const scale = Math.min(Math.abs(Math.round(15 / coords.z)), 0.5);

      return (
        <ViroNode key={index} scale={[scale, scale, scale]} position={[coords.x, 0, coords.z]}>
          <ViroAmbientLight intensity={2000} color={"white"} />
          <Viro3DObject
            source={require("@assets/models/star/star.obj")}
            type="OBJ"
            onError={handleError}
            shadowCastingBitMask={2}
            animation={{ name: "rotation", run: true, loop: true }}
            onClick={() => {}}
          />
          {/* Default 2.5m radius */}
          <Viro3DObject
            source={require("@assets/models/circle/object.obj")}
            resources={[require("@assets/models/circle/circle.mtl")]}
            type="OBJ"
            onError={handleError}
            position={[0, -5, 0]}
            materials={["area"]}
          />
        </ViroNode>
      );
    });
    return ARObjects;
  }, [location, points]);

  const [position, setPosition] = useState<Viro3DPoint>([0, 0, 0]);
  const calPoint = nearestPoint && transformGpsToAR(location, nearestPoint);
  const point = { x: calPoint?.x || 0, z: calPoint?.z || 0 };

  const degree = (Math.atan2(point.x - position[0], point.z - position[2]) * 180) / Math.PI;
  const distance = Math.sqrt((point.z - position[2]) ** 2 + (point.x - position[0]) ** 2);

  return (
    <ViroARScene
      onCameraTransformUpdate={(cameraTransform) => {
        setPosition([cameraTransform.position[0], cameraTransform.position[1] - 1, cameraTransform.position[2]]);
      }}
    >
      {/* {props?.arSceneNavigator.viroAppProps.location && placeARObjects()} */}
      {(point.x !== 0 || point.z !== 0) && (
        <>
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
          <ViroNode rotation={[0, 0, 0]} position={[point.x, 0, point.z]}>
            <ViroAmbientLight intensity={2000} color={"white"} />
            <Viro3DObject
              source={require("@assets/models/location_pin/object.obj")}
              type="OBJ"
              onError={handleError}
              // shadowCastingBitMask={2}
            />
          </ViroNode>
        </>
      )}
      <Viro3DObject
        position={[-350, -960, 30]}
        source={require("@assets/models/wall/wall.obj")}
        type="OBJ"
        onError={handleError}
        shadowCastingBitMask={2}
      />
    </ViroARScene>
  );
}

export default () => {
  const { theme } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const style = useStyle({ theme });
  const { targetId, POINTS } = useLocalSearchParams<{ targetId: string; POINTS: string }>();
  const points: LatLong[] | undefined = POINTS && JSON.parse(POINTS);

  const animatedProps = { duration: 300, easing: Easing.inOut(Easing.quad) };
  const [mapExpand, setMapExpand] = useState<boolean>(false);
  const [initAngle, setInitAngle] = useState<number>(-1);
  const [animate, setAnimate] = useState<number>(0);
  const miniMapStyle = useAnimatedStyle(() => {
    var pos = mapExpand
      ? { bottom: 0, right: 0, left: 0, top: undefined }
      : { top: top + theme.spacing.xs + style.distanceContainer.height + 34 + theme.spacing.sm, right: 16, left: undefined, bottom: undefined };

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

  const [nearestPoint, setNearestPoint] = useState<LatLong>();
  const mapRef = createRef<MapView>();

  const [location, setLocation] = useState<Location.LocationObjectCoords>();
  const [heading, setHeading] = useState<number>();
  const [nearbyItems, setNearbyItems] = useState<LatLong[]>([]);

  // const
  const distanceInterval: number = 25;

  useEffect(() => {
    let headingListener: Location.LocationSubscription | undefined;
    let locationListener: Location.LocationSubscription | undefined;
    // init nearby items if points is not undefined
    if (points) setNearbyItems(points);
    const getCurrentLocation = async () => {
      const { coords: initCoords } = await Location.getCurrentPositionAsync();
      // generate dummy points if no default points in params
      if (!points) {
        const lat = initCoords.latitude + 8 * Math.pow(10, -5);
        const lon = initCoords.longitude + Math.pow(10, -5);
        const locations: Location.LocationObjectCoords[] = [
          {
            ...initCoords,
            latitude: lat,
            longitude: lon,
          },
          {
            ...initCoords,
            latitude: 22.282812,
            longitude: 114.139614,
          },
          {
            ...initCoords,
            latitude: 22.282812,
            longitude: 114.139634,
          },
        ];
        setNearbyItems(locations);
      }

      const geoOpt: Location.LocationOptions = {
        accuracy: Location.Accuracy.High,
        distanceInterval: distanceInterval, // update for each 25 meters
      };

      const geoCallback = async (result: Location.LocationObject) => {
        const coords = result.coords;
        if (coords.accuracy && coords.accuracy < 50) {
          setLocation(coords);
        }
      };

      locationListener = await Location.watchPositionAsync(geoOpt, geoCallback);
      headingListener = await Location.watchHeadingAsync((heading) => {
        setHeading(heading.trueHeading);
      });
    };
    getCurrentLocation();
    return () => {
      locationListener?.remove();
      headingListener?.remove();
    };
  }, []);

  /** Watch update of location */
  useEffect(() => {
    if (!location) return;
    mapRef?.current?.animateToRegion({ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
    if (nearbyItems && nearbyItems.length) {
      const { currentAnimate, closestPoint } = getNextPoint(parseInt(targetId ?? "0"), nearbyItems, location);
      setAnimate(currentAnimate);
      setNearestPoint(closestPoint);
    }
  }, [location, nearbyItems]);

  useEffect(() => {
    if (animate == 0) return;

    // End animate after 2 sec
    setTimeout(() => {
      setAnimate(0);
    }, 2000);
  }, [animate]);

  const handleMapPressed = () => {
    setMapExpand((value) => !value);
  };

  const placeMarkers = useCallback(() => {
    if (nearbyItems.length === 0) {
      return undefined;
    }
    const markers = nearbyItems.map((item, index) => {
      return <Marker key={index} coordinate={{ longitude: item.longitude, latitude: item.latitude }} />;
    });
    return markers;
  }, [nearbyItems]);

  const getBearingDegree = () => {
    // http://www.movable-type.co.uk/scripts/latlong.html?from=48.9613600,-122.0413400&to=48.965496,-122.072989
    if (!nearestPoint || !location) return -1;
    // Accurate bearing degree
    const bearing = bearingBetweenTwoPoints(location, nearestPoint);
    if (heading && heading > -1) {
      return (360 - heading - bearing) % 360;
    }
    return bearing;
  };

  const getNearestDistance = () => {
    if (!nearestPoint) return undefined;
    // convert km to m
    const distance = distanceFromLatLonInKm(location, nearestPoint) * 1000;
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
  const distanceText = getNearestDistance();
  const loading: boolean = !(location && heading);

  return (
    <MainBody>
      <Animated.View style={ARsceneStyle}>
        <ViroARSceneNavigator
          worldAlignment="GravityAndHeading"
          initialScene={{ scene: ARExplorePage }}
          viroAppProps={
            {
              location,
              points: nearbyItems,
              nearestPoint,
              degree,
              setInitAngle,
              initAngle,
            } as ARExploreProps
          }
        />
      </Animated.View>
      <View
        style={[
          style.rowLayout,
          {
            columnGap: theme.spacing.sm,
            position: "absolute",
            top: top + theme.spacing.xs,
            left: 0,
            right: 0,
            paddingHorizontal: theme.spacing.md,
          },
        ]}
      >
        <IconBtn icon={<ChevronLeftIcon fill={theme.colors.text} />} onPress={() => router.back()} />
        <IconBtn icon={"backpack"} iconProps={{ fill: theme.colors.text }} onPress={() => router.push("/collection")} />
      </View>
      {!!distanceText && (
        <View style={[style.distanceContainer, { top: top + theme.spacing.xs + 34 }]}>
          <View style={[style.rowLayout, { padding: theme.spacing.xs, gap: theme.spacing.sm }]}>
            <ArrowUpIcon fill={theme.colors.text} style={{ transform: [{ rotate: `${degree == -1 ? 0 : degree}deg` }], width: 24, height: 24 }} />
            <View style={style.columnLayout}>
              <Text>Destination</Text>
              <Text>{distanceText}</Text>
            </View>
          </View>
        </View>
      )}
      {location && (
        <Animated.View style={miniMapStyle}>
          <TouchableHighlight onPress={handleMapPressed} activeOpacity={1}>
            <MapView
              ref={mapRef}
              style={style.miniMap}
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
      {loading && (
        <View style={style.centerContainer}>
          <View style={style.loadingCard}>
            <Text variant="labelMedium" style={{ color: theme.colors?.primary, textAlign: "center", paddingBottom: theme.spacing.xs }}>
              {"Waiting\nGPS information"}
            </Text>
            <ActivityIndicator size={"large"} animating={true} />
          </View>
        </View>
      )}
      <View style={style.centerContainer}>
        <ParticlesEffect playing={animate} />
      </View>
      {animate !== 0 && (
        <View style={style.centerContainer}>
          <Text>{animate == 1 ? "You are getting too far from path!" : "You have reached a way point!"} </Text>
        </View>
      )}
    </MainBody>
  );
};

/*
 * Important to wrap the props with arSceneNavigator and viroAppProps, based on the
 * guidance of ViroReact
 */
interface ViroARSceneProps<T extends unknown> {
  arSceneNavigator: {
    viroAppProps: T;
  };
}

interface ARExploreProps {
  location?: Location.LocationObjectCoords | undefined;
  points: LatLong[];
  nearestPoint: LatLong;
  degree: Float;
  setInitAngle: Function;
  initAngle: Number;
}

interface LatLong {
  latitude: number;
  longitude: number;
  heading?: number | null;
  [key: string]: any;
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
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
      backgroundColor: theme.colors.container,
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
      borderRadius: theme.borderRadius.md,
      borderColor: "white",
      borderWidth: 2,
      overflow: "hidden",
    },
    miniMap: {
      height: "100%",
      width: "100%",
    },
    loadingCard: {
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.container.concat("80"),
      overflow: "hidden",
      flexDirection: "column",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
  });
