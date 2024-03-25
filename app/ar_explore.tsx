import { ViroARSceneNavigator } from "@viro-community/react-viro";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MainBody, IconBtn, ARExploreProps, ARExploreScene } from "@components";
import { ChevronLeftIcon, ArrowUpIcon } from "@components/icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, createRef, useCallback, useRef, useMemo } from "react";
import { View, StyleSheet, useWindowDimensions, Platform } from "react-native";
import _ from "lodash";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import MapView, { LatLng, Marker } from "react-native-maps";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { TouchableHighlight } from "react-native-gesture-handler";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { distanceFromLatLonInKm, bearingBetweenTwoPoints, getNextPoint, isNear, transformGpsToAR } from "@/plugins/geolocation";
import { GeoPoint } from "@/models";
import { Paginated, useFeathers } from "@/providers/feathers_provider";
import LPF from "@/plugins/low-pass-filter";

const ICON_BUTTON_SIZE = 48;
const MINI_MAP_HEIGHT = 134;
const MAP_HEIGHT = 200;
const TOP_PADDING = ICON_BUTTON_SIZE + 34;
const DISTANCE_CONTAINER_H = 50;

const DISTANCE_INTERVAL = 20;
export const ALERT_DISTANCE = 50;

export default () => {
  const feathers = useFeathers();
  // style const
  const { theme } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const style = useStyle({ theme });
  const safeTop = useMemo(() => top + theme.spacing.xs, [top]);

  const animatedProps = { duration: 300, easing: Easing.inOut(Easing.quad) };
  const [mapExpand, setMapExpand] = useState<boolean>(false);
  const [animate, setAnimate] = useState<number>(0);

  const miniMapStyle = useAnimatedStyle(() => {
    var pos = mapExpand
      ? { bottom: 0, right: 0, left: 0, top: undefined }
      : { top: safeTop + DISTANCE_CONTAINER_H + TOP_PADDING + theme.spacing.sm, right: 16, left: undefined, bottom: undefined };

    return {
      position: mapExpand ? "relative" : "absolute",
      height: withTiming(mapExpand ? MAP_HEIGHT : MINI_MAP_HEIGHT, animatedProps),
      width: mapExpand ? "100%" : MINI_MAP_HEIGHT,
      overflow: "hidden",
      borderColor: "white",
      borderRadius: mapExpand ? 0 : 12,
      borderWidth: 2,
      ...pos,
    };
  });

  const ARsceneStyle = useAnimatedStyle(() => {
    return { height: withTiming(mapExpand ? screenHeight - MAP_HEIGHT : screenHeight, animatedProps) };
  });

  const { targetId = "0", idString, service = "locations" } = useLocalSearchParams<{ targetId: string; idString: string; service: string }>();

  // geo locations and viro coordinates
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [targetIndex, setTargetIndex] = useState(parseInt(targetId));
  const targetPoint = points.length > 0 ? points[targetIndex] : undefined;

  const [arrived, setArrived] = useState(false);
  const [arNear, setARnear] = useState(false);

  const [nearestPoint, setNearestPoint] = useState<LatLng>();
  const [location, setLocation] = useState<Location.LocationObjectCoords>();

  const [heading, setHeading] = useState<number>();
  const [initHeading, setInitHeading] = useState<number>();
  // Move calPoint and calTarget in main component in order to erase the computation burden in Viro
  const calPoint = useMemo(() => transformGpsToAR(location, nearestPoint, initHeading), [location, initHeading, nearestPoint]);
  const calTarget = useMemo(() => transformGpsToAR(location, targetPoint, initHeading), [location, initHeading, points, targetIndex]);

  // const
  const isAndroid: boolean = Platform.OS === "android";
  const mapRef = createRef<MapView>();

  const fetchData = async () => {
    const points: GeoPoint[] = [];
    var total = 1;
    const ids: string[] | undefined = idString && JSON.parse(idString);
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

  /** Init environment */
  useEffect(() => {
    var headingAccuracyThreshold = 3;
    var headingInit: boolean = false;

    let headingListener: Location.LocationSubscription | undefined;
    let locationListener: Location.LocationSubscription | undefined;
    var timer: NodeJS.Timeout;
    const headingFilter = new LPF();

    const adjustAccuracy = async () => {
      const timeout = 10 * 1000;
      timer = setInterval(() => {
        if (headingAccuracyThreshold > 0) {
          headingAccuracyThreshold--;
        }
      }, timeout);
    };

    const getCurrentLocation = async () => {
      const geoOpt: Location.LocationOptions = {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: DISTANCE_INTERVAL,
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
        // Filter noise of true heading using low-pass-filter
        if (!isAndroid || heading.accuracy >= headingAccuracyThreshold) {
          const smoothHeading = Math.round(headingFilter?.next(trueHeading));
          setHeading(smoothHeading);
        }
      });
      locationListener = await Location.watchPositionAsync(geoOpt, async (result: Location.LocationObject) => {
        const coords = result.coords;
        // Consider applying low-pass-filter to recompute accuracy threshold
        if (coords.accuracy && coords.accuracy < 50) {
          setLocation(coords);
        }
      });
    };

    headingFilter.init([]);
    fetchData();
    adjustAccuracy();
    getCurrentLocation();
    return () => {
      locationListener?.remove();
      headingListener?.remove();
      timer && clearInterval(timer);
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
    if (targetPoint && isNear(targetPoint, location, ALERT_DISTANCE)) {
      setArrived(true);
    }
  }, [location, targetIndex, points]);

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

  const handleNextStop = () => {
    if (targetIndex < points.length - 1) {
      setTargetIndex((index) => index + 1);
    }
    setArrived(false);
    setARnear(false);
  };

  const placeMarkers = useCallback(() => {
    if (!points.length) return;
    const markers = points.map((item, index) => {
      return <Marker key={index} coordinate={{ longitude: item.longitude, latitude: item.latitude }} />;
    });
    return markers;
  }, [points]);

  const computeBearingDiff = () => {
    // http://www.movable-type.co.uk/scripts/latlong.html?from=48.9613600,-122.0413400&to=48.965496,-122.072989
    if (!nearestPoint || !location) return 0;
    // Accurate bearing degree
    const bearing = bearingBetweenTwoPoints(location, nearestPoint);
    if (heading && heading > -1) {
      if (isAndroid) {
        if (bearing >= heading) {
          return Math.round(bearing - heading);
        } else {
          return Math.round(360 - heading + bearing);
        }
      } else {
        return Math.round((360 - bearing - heading) % 360);
      }
    }
    return Math.round(bearing);
  };

  const getNearestDistance = () => {
    if (!targetPoint || !location) return undefined;
    // convert km to m
    const distance = distanceFromLatLonInKm(location, targetPoint) * 1000;
    console.log("reality distance:", distance);
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

  const degree = useMemo(computeBearingDiff, [location, nearestPoint, heading, initHeading]);
  const distanceText = useMemo(getNearestDistance, [location, points, targetIndex]);
  const loading: boolean = !(location && initHeading);

  return (
    <MainBody>
      {loading ? (
        <View style={[style.centerContainer, { backgroundColor: theme.colors.secondary }]}>
          <View style={style.loadingCard}>
            <Text variant="labelMedium" style={{ color: theme.colors?.primary, textAlign: "center", paddingBottom: theme.spacing.xs }}>
              {"Waiting\nGPS information..."}
            </Text>
            <ActivityIndicator size={"large"} animating={true} />
          </View>
        </View>
      ) : (
        <Animated.View style={ARsceneStyle}>
          <ViroARSceneNavigator
            videoQuality="Low"
            worldAlignment="GravityAndHeading"
            autofocus
            initialScene={{ scene: ARExploreScene }}
            viroAppProps={
              {
                location,
                targetPoint,
                setARnear,
                calTarget,
                calPoint,
                speed: Math.round(location?.speed || 0),
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
            top: safeTop,
            left: 0,
            right: 0,
            paddingHorizontal: theme.spacing.md,
          },
        ]}
      >
        <IconBtn icon={<ChevronLeftIcon fill={theme.colors.text} />} size={ICON_BUTTON_SIZE} onPress={() => router.back()} />
      </View>
      {!loading && (
        <>
          <View style={{ position: "absolute", top: safeTop + ICON_BUTTON_SIZE + theme.spacing.sm, left: 0, right: 0 }}>
            <View style={{ width: "100%", paddingHorizontal: theme.spacing.lg }}>
              <Text variant={arNear || arrived ? "titleMedium" : "labelMedium"} style={{ color: "white", textAlign: "center" }}>
                {arNear || arrived
                  ? `Congrats! You've arrived ${targetPoint?.name || `${targetIndex + 1} Stop`}!`
                  : "Please follow the direction on the bottom navigation"}
              </Text>
            </View>
          </View>
          {!!distanceText && (
            <View style={[style.distanceContainer, { top: safeTop + TOP_PADDING }]}>
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
                  top: safeTop + DISTANCE_CONTAINER_H + TOP_PADDING + (mapExpand ? 0 : MINI_MAP_HEIGHT + theme.spacing.md),
                  height: 150,
                },
              ]}
            >
              <View style={[style.rowLayout, { padding: theme.spacing.xs, gap: theme.spacing.sm }]}>
                <View style={style.columnLayout}>
                  <Text variant="bodySmall">lat:{location.latitude}</Text>
                  <Text variant="bodySmall">lon:{location.longitude}</Text>
                  <Text variant="bodySmall">speed:{Math.round(location.speed || 0)} m/s</Text>
                  <Text variant="bodySmall">init heading:{initHeading || 0}</Text>
                  <Text variant="bodySmall">heading:{heading}</Text>
                  <Text variant="bodySmall">bearing diff: {degree}</Text>
                </View>
              </View>
            </View>
          )}

          {(arNear || arrived) && targetIndex < points.length - 1 && (
            <View style={{ position: "absolute", bottom: theme.spacing.lg, right: theme.spacing.lg }}>
              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                labelStyle={{ marginHorizontal: theme.spacing.lg, marginVertical: theme.spacing.sm }}
                onPress={handleNextStop}
              >
                <Text variant="labelLarge" style={{ color: theme.colors.textOnPrimary, fontWeight: "bold" }}>
                  Next Stop
                </Text>
              </Button>
            </View>
          )}

          {animate > 0 && (
            <View style={style.centerContainer}>
              <View style={{ width: "100%", paddingHorizontal: theme.spacing.lg }}>
                <Text style={{ color: "white" }}>{animate == 1 ? "You are getting too far from path!" : "You have reached a way point!"}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </MainBody>
  );
};

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
      height: DISTANCE_CONTAINER_H,
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
      width: MINI_MAP_HEIGHT,
      height: MINI_MAP_HEIGHT,
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
