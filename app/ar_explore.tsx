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
import { View, StyleSheet, useWindowDimensions, Platform } from "react-native";
import _, { head } from "lodash";
import { ActivityIndicator, Text } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { TouchableHighlight } from "react-native-gesture-handler";
import { Viro3DPoint } from "@viro-community/react-viro/dist/components/Types/ViroUtils";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { distanceFromLatLonInKm, bearingBetweenTwoPoints, transformGpsToAR, getNextPoint, degBetweenPoints, degree360 } from "@/plugins/geolocation";

function ARExplorePage(props?: ViroARSceneProps<ARExploreProps>) {
  const { initLocation, location, points, nearestPoint, initHeading, targetIndex } = props?.arSceneNavigator?.viroAppProps ?? {};

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

  function rotateObject(point: Viro3DPoint | undefined): Viro3DPoint {
    if (Platform.OS === "android") {
      if (point && initHeading) {
        let angle = initHeading;
        const z = -point[2];
        const x = point[0];
        let newRotatedX = x * Math.cos(angle) - z * Math.sin(angle);
        let newRotatedZ = z * Math.cos(angle) + x * Math.sin(angle);

        return [newRotatedX, 0, -newRotatedZ];
      }
    }
    return point || [0, 0, 0];
  }

  const [position, setPosition] = useState<Viro3DPoint>([0, 0, 0]);

  const calPoint = rotateObject(transformGpsToAR(initLocation, nearestPoint));
  const targetPoint = points && typeof targetIndex === "number" ? points[targetIndex] : undefined;
  var calTarget = rotateObject(transformGpsToAR(initLocation, targetPoint));

  const degree = degBetweenPoints(calPoint[0], position[0], calPoint[2], position[2]);
  const distance = Math.hypot(calPoint[2] - position[2], calPoint[0] - position[0]);

  useEffect(() => {
    if (!nearestPoint) return;

    console.log("ar rotated point:", calPoint.toString());
    console.log("origin point:", transformGpsToAR(initLocation, nearestPoint));
    console.log("ar degree:", degree);
  }, [nearestPoint]);

  return (
    <ViroARScene
      onCameraTransformUpdate={(cameraTransform) => {
        const { position: cameraPos, rotation } = cameraTransform;
        setPosition([cameraPos[0], cameraPos[1] - 1, cameraPos[2]]);
      }}
    >
      {/* {props?.arSceneNavigator.viroAppProps.location && placeARObjects()} */}
      {calPoint && (
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
          <ViroNode rotation={[0, 0, 0]} position={calPoint}>
            <ViroAmbientLight intensity={2000} color={"white"} />
            <Viro3DObject source={require("@assets/models/location_pin/object.obj")} type="OBJ" onError={handleError} />
          </ViroNode>
        </>
      )}
      {/* <Viro3DObject
        position={[-350, -960, 30]}
        source={require("@assets/models/wall/wall.obj")}
        type="OBJ"
        onError={handleError}
        shadowCastingBitMask={2}
      /> */}
    </ViroARScene>
  );
}

export default () => {
  const { theme } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const style = useStyle({ theme });
  const { targetId, POINTS } = useLocalSearchParams<{ targetId: string; POINTS: string }>();
  const [targetIndex, setTargetIndex] = useState(parseInt(targetId ?? "0"));
  const points: LatLong[] | undefined = POINTS && JSON.parse(POINTS);

  const animatedProps = { duration: 300, easing: Easing.inOut(Easing.quad) };
  const [mapExpand, setMapExpand] = useState<boolean>(false);

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
  const [initLocation, setInitLocation] = useState<Location.LocationObjectCoords>();
  const [heading, setHeading] = useState<number>();
  const [initHeading, setInitHeading] = useState<number>();
  const [nearbyItems, setNearbyItems] = useState<LatLong[]>([]);

  // const
  const distanceInterval: number = 25;

  useEffect(() => {
    let headingListener: Location.LocationSubscription | undefined;
    let locationListener: Location.LocationSubscription | undefined;
    // init nearby items if points is not undefined
    if (points) setNearbyItems(points);
    const getCurrentLocation = async () => {
      const geoOpt: Location.LocationOptions = {
        accuracy: Location.Accuracy.High,
        distanceInterval: distanceInterval, // update for each 25 meters
      };

      var headingInit: boolean = false;
      var locationInit: boolean = false;

      const geoCallback = async (result: Location.LocationObject) => {
        const coords = result.coords;

        if (coords.accuracy && coords.accuracy < 50) {
          setLocation(coords);
          if (!locationInit) {
            setInitLocation(coords);
            // generate dummy points if no default points in params
            if (!points) {
              const lat = coords.latitude + 8 * Math.pow(10, -5);
              const lon = coords.longitude + Math.pow(10, -5);
              const locations: Location.LocationObjectCoords[] = [
                {
                  ...coords,
                  latitude: lat,
                  longitude: lon,
                },
                {
                  ...coords,
                  latitude: 22.282812,
                  longitude: 114.139614,
                },
                {
                  ...coords,
                  latitude: 22.282812,
                  longitude: 114.139634,
                },
              ];
              setNearbyItems(locations);
            }
            locationInit = true;
          }
        }
      };

      headingListener = await Location.watchHeadingAsync((heading) => {
        const { trueHeading } = heading;
        if (trueHeading < 0) return;
        if (heading.accuracy > 1) {
          if (!headingInit) {
            headingInit = true;
            setInitHeading(trueHeading);
          }
        }
        setHeading(trueHeading);
      });
      locationListener = await Location.watchPositionAsync(geoOpt, geoCallback);
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

    if (nearbyItems && nearbyItems.length) {
      const { currentAnimate, closestPoint } = getNextPoint(targetIndex, nearbyItems, location);
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
    if (!nearestPoint || !location) return 0;
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

  const degree = getBearingDegree();
  const distanceText = getNearestDistance();
  const loading: boolean = !(initLocation && initHeading);

  return (
    <MainBody>
      {loading ? (
        <View style={[style.centerContainer, { backgroundColor: theme.colors.secondary }]}>
          <View style={style.loadingCard}>
            <Text variant="labelMedium" style={{ color: theme.colors?.primary, textAlign: "center", paddingBottom: theme.spacing.xs }}>
              {"Waiting\nGPS information.\nPlease stand still."}
            </Text>
            <ActivityIndicator size={"large"} animating={true} />
          </View>
        </View>
      ) : (
        <Animated.View style={ARsceneStyle}>
          <ViroARSceneNavigator
            worldAlignment="GravityAndHeading"
            initialScene={{ scene: ARExplorePage }}
            viroAppProps={
              {
                initLocation,
                location,
                points: nearbyItems,
                nearestPoint,
                degree,
                initHeading,
                targetIndex,
              } as ARExploreProps
            }
          />
        </Animated.View>
      )}

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
      </View>
      {!!distanceText && (
        <View style={[style.distanceContainer, { top: top + theme.spacing.xs + 34 }]}>
          <View style={[style.rowLayout, { padding: theme.spacing.xs, gap: theme.spacing.sm }]}>
            <ArrowUpIcon fill={theme.colors.text} style={{ transform: [{ rotate: `${degree}deg` }], width: 24, height: 24 }} />
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
              showsCompass={true}
              followsUserLocation={true}
              showsMyLocationButton={false}
              zoomControlEnabled={true}
              zoomEnabled={true}
              rotateEnabled={false}
              pitchEnabled={false}
              scrollEnabled={false}
              minZoomLevel={16}
            >
              {placeMarkers()}
            </MapView>
          </TouchableHighlight>
        </Animated.View>
      )}
      {__DEV__ && location && (
        <View
          style={[
            style.distanceContainer,
            { top: top + theme.spacing.xs + style.distanceContainer.height + 34 * 2 + (mapExpand ? 0 : 134) + theme.spacing.sm, height: 150 },
          ]}
        >
          <View style={[style.rowLayout, { padding: theme.spacing.xs, gap: theme.spacing.sm }]}>
            <View style={style.columnLayout}>
              <Text>lat:{location.latitude}</Text>
              <Text>lon:{location.longitude}</Text>
              <Text>init lat: {initLocation?.latitude}</Text>
              <Text>init lon: {initLocation?.longitude}</Text>
              <Text>heading:{heading}</Text>
              <Text>initHeading: {initHeading}</Text>
            </View>
          </View>
        </View>
      )}
      {/* <View style={style.centerContainer}><ParticlesEffect playing={animate} /></View> */}
      {animate !== 0 && (
        <View style={style.centerContainer}>
          <View style={{ width: "100%", paddingVertical: 16 }}>
            <Text>{animate == 1 ? "You are getting too far from path!" : "You have reached a way point!"} </Text>
          </View>
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
  initLocation?: Location.LocationObjectCoords;
  location?: Location.LocationObjectCoords;
  points: LatLong[];
  nearestPoint: LatLong;
  degree: Float;
  initHeading: number;
  targetIndex: number;
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
      backgroundColor: theme.colors.container,
      overflow: "hidden",
      flexDirection: "column",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
  });
