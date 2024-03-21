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
import _ from "lodash";
import { ActivityIndicator, Text } from "react-native-paper";
import MapView, { LatLng, Marker } from "react-native-maps";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { TouchableHighlight } from "react-native-gesture-handler";
import { Viro3DPoint } from "@viro-community/react-viro/dist/components/Types/ViroUtils";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import {
  distanceFromLatLonInKm,
  bearingBetweenTwoPoints,
  transformGpsToAR,
  getNextPoint,
  degBetweenPoints,
  degree360,
  deg2rad,
} from "@/plugins/geolocation";
import { GeoPoint } from "@/models";
import { Paginated, useFeathers } from "@/providers/feathers_provider";

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

  const isAndroid: boolean = Platform.OS === "android";

  const [position, setPosition] = useState<Viro3DPoint>([0, 0, 0]);
  const [rotation, setRotation] = useState<Viro3DPoint>([0, 0, 0]);
  const [init, setInit] = useState(false);

  const calPoint = transformGpsToAR(initLocation, nearestPoint, initHeading);
  const degree = calPoint ? degBetweenPoints(position, calPoint) : 180;
  const distance = calPoint ? Math.hypot(calPoint[2] - position[2], calPoint[0] - position[0]) : 1;

  return (
    <ViroARScene
      onTrackingUpdated={() => {
        console.log("init ar scene");
        if (!init) setInit(true);
        else {
          console.log("ar rotated point:", calPoint?.toString());
          console.log("ar degree:", degree, ", distance:", distance);
          console.log("camera position:", position.toString());
          console.log("camera rotation:", rotation.toString());
        }
      }}
      onCameraTransformUpdate={(cameraTransform) => {
        const { position: cameraPos, rotation } = cameraTransform;
        setRotation(rotation);
        setPosition([cameraPos[0], cameraPos[1] - 1, cameraPos[2]]);
      }}
    >
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
          <ViroNode rotation={[0, 0, 0]} position={calPoint} scale={[2, 2, 2]}>
            <ViroAmbientLight intensity={2000} color={"white"} />
            <Viro3DObject source={require("@assets/models/location_pin/object.obj")} type="OBJ" onError={handleError} />
          </ViroNode>
        </>
      )}
    </ViroARScene>
  );
}

export default () => {
  const { theme } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const feathers = useFeathers();
  const { height: screenHeight } = useWindowDimensions();
  const style = useStyle({ theme });
  const { targetId = "0", idString, service = "locations" } = useLocalSearchParams<{ targetId: string; idString: string; service: string }>();
  const ids: string[] | undefined = idString && JSON.parse(idString);

  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [targetIndex, setTargetIndex] = useState(parseInt(targetId));
  const [showSuggest, setShowSuggest] = useState(false);

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

  const [nearestPoint, setNearestPoint] = useState<LatLng>();
  const mapRef = createRef<MapView>();

  const [location, setLocation] = useState<Location.LocationObjectCoords>();
  const [initLocation, setInitLocation] = useState<Location.LocationObjectCoords>();
  const [heading, setHeading] = useState<number>();
  const [initHeading, setInitHeading] = useState<number>();

  // const
  const distanceInterval: number = 25;

  useEffect(() => {
    const points: GeoPoint[] = [];

    const fetchData = async () => {
      var total = 1;
      if (!ids || ids.length === 0) return;
      while (total > points.length) {
        const results: Paginated<GeoPoint> = await feathers.service(service).find({
          query: {
            _id: { $in: ids },
            latitude: { $exists: true },
            longitude: { $exists: true },
            $sort: { order: 1 },
            $skip: points.length,
          },
        });

        if (total != results.total) total = results.total;
        if (results.total === 0 || results.data.length === 0) break;
        points.push(...results.data);
      }

      setPoints(points);
    };
    var headingAccuracyThreshold = 3;
    var headingInit: boolean = false;
    var locationInit: boolean = false;
    var timer: NodeJS.Timeout;

    let headingListener: Location.LocationSubscription | undefined;
    let locationListener: Location.LocationSubscription | undefined;

    const adjustAccuracy = async () => {
      const timeout = 10 * 1000;
      timer = setInterval(() => {
        if (headingAccuracyThreshold > 0) {
          headingAccuracyThreshold--;
          if (Platform.OS === "android") console.log("decrease heading accuracy after 10 s", headingAccuracyThreshold);
          else console.warn("decrease heading accuracy after 10 s", headingAccuracyThreshold);
        } else {
          timer && clearInterval(timer);
        }
      }, timeout);
    };

    const getCurrentLocation = async () => {
      const geoOpt: Location.LocationOptions = {
        accuracy: Location.Accuracy.High,
        distanceInterval: distanceInterval, // update for each 25 meters
      };

      headingListener = await Location.watchHeadingAsync((heading) => {
        const { trueHeading } = heading;
        if (trueHeading < 0) return;
        if (heading.accuracy >= headingAccuracyThreshold) {
          if (!headingInit) {
            headingInit = true;
            setInitHeading(trueHeading);
            timer && clearInterval(timer);
          }
        }
        if (Platform.OS !== "android") {
          setHeading(trueHeading);
        }
        if (Platform.OS === "android" && heading.accuracy >= headingAccuracyThreshold) {
          setHeading(trueHeading);
        }
      });
      locationListener = await Location.watchPositionAsync(geoOpt, async (result: Location.LocationObject) => {
        const coords = result.coords;
        if (coords.accuracy && coords.accuracy < 50) {
          if (!locationInit) {
            setInitLocation(coords);
            locationInit = true;
          }
          setLocation(coords);
        }
      });
    };

    const init = async () => {
      await fetchData();
      adjustAccuracy();
      await getCurrentLocation();
    };

    init();
    return () => {
      locationListener?.remove();
      headingListener?.remove();
    };
  }, []);

  /** Watch update of location */
  useEffect(() => {
    if (!location) return;

    if (points.length) {
      const { currentAnimate, closestPoint } = getNextPoint(targetIndex, points, location);
      setAnimate(currentAnimate);
      setNearestPoint(closestPoint);
    }
  }, [location, points]);

  /** Watch update of heading */
  // useEffect(() => {
  //   if (mapRef.current) {
  //     mapRef.current.setCamera({ heading: heading });
  //   }
  // }, [heading]);

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
    if (!points.length) return;
    const markers = points.map((item, index) => {
      return <Marker key={index} coordinate={{ longitude: item.longitude, latitude: item.latitude }} />;
    });
    return markers;
  }, [points]);

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
    if (!points.length) return undefined;
    const point = points[targetIndex];
    // convert km to m
    const distance = distanceFromLatLonInKm(location, point) * 1000;
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
                points,
                nearestPoint,
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
      {!loading && !!distanceText && (
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

      {!loading && location && (
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
              // zoomControlEnabled={true}
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
            {
              top: top + theme.spacing.xs + style.distanceContainer.height + 34 * 2 + (mapExpand ? 0 : 134) + theme.spacing.sm,
              height: 150,
            },
          ]}
        >
          <View style={[style.rowLayout, { padding: theme.spacing.xs, gap: theme.spacing.sm }]}>
            <View style={style.columnLayout}>
              <Text>lat:{location.latitude}</Text>
              <Text>lon:{location.longitude}</Text>
              <Text>heading:{heading}</Text>
              <Text>initHeading: {initHeading}</Text>
            </View>
          </View>
        </View>
      )}

      {!loading && animate !== 0 && (
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
  points: GeoPoint[];
  nearestPoint: LatLng;
  initHeading: number;
  targetIndex: number;
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
