import {
  ViroARPlane,
  ViroARScene,
  ViroARSceneNavigator,
  ViroBox,
  ViroCameraTransform,
  ViroNode,
  ViroFlexView,
  ViroText,
} from "@viro-community/react-viro";
import { useAppTheme } from "../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import MainBody from "../components/main_body";
import IconBtn from "../components/icon_btn";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Viro3DPoint } from "@viro-community/react-viro/dist/components/Types/ViroUtils";

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

function ARExplorePage() {
  const [cameraPos, setCameraPos] = useState<Viro3DPoint>();
  // demo
  const [initLocation, setInitLocation] = useState<Location.LocationObjectCoords>();
  const [location, setLocation] = useState<Location.LocationObjectCoords>();
  const [nearbyItems, setNearbyItems] = useState<Location.LocationObjectCoords[]>([]);
  const [locationListener, setLocationListener] = useState<Location.LocationSubscription>();

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
    (async () => {
      await getNearbyItems();
    })();
  }, [location]);

  function onCameraTransformUpdate(cameraTransform: ViroCameraTransform) {
    const pos = cameraTransform.position;
    if (cameraPos?.[0] !== pos[0] || cameraPos?.[1] !== pos[1] || cameraPos?.[2] !== pos[2]) {
      setCameraPos(cameraTransform.position);
    }
  }

  const getCurrentPosition = async () => {
    const geoCallback = async (result: Location.LocationObject) => {
      if (!initLocation) setInitLocation(result.coords);
      setLocation(result.coords);
    };

    const listener = await Location.watchPositionAsync({}, geoCallback);
    setLocationListener(listener);
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

  const transformGpsToAR = (lat, lng) => {
    if (!location) return undefined;
    const isAndroid = Platform.OS === "android";
    const latObj = lat;
    const longObj = lng;
    const latMobile = location?.latitude;
    const longMobile = location?.longitude;

    const deviceObjPoint = latLongToMerc(latObj, longObj);
    const mobilePoint = latLongToMerc(latMobile, longMobile);
    const objDeltaY = deviceObjPoint.y - mobilePoint.y;
    const objDeltaX = deviceObjPoint.x - mobilePoint.x;

    if (isAndroid) {
      const degree = location.heading;
      if (degree === undefined || degree === null) return undefined;
      const angleRadian = (degree * Math.PI) / 180;
      const newObjX = objDeltaX * Math.cos(angleRadian) - objDeltaY * Math.sin(angleRadian);
      const newObjY = objDeltaX * Math.sin(angleRadian) + objDeltaY * Math.cos(angleRadian);
      return { x: newObjX, z: -newObjY };
    }

    return { x: objDeltaX, z: -objDeltaY };
  };

  const getNearbyItems = async () => {
    // demo

    if (initLocation) {
      const lat = initLocation.latitude + 8 * Math.pow(10, -5);
      const lon = initLocation.longitude + Math.pow(10, -5);
      console.log(`lat ${lat}, lon ${lon}`);
      const places: Location.LocationObjectCoords[] = [
        {
          ...initLocation,
          latitude: lat,
          longitude: lon,
        },
      ];
      setNearbyItems(places);
    }
  };

  const placeARObjects = () => {
    if (nearbyItems.length === 0) {
      return undefined;
    }
    const ARObjects = nearbyItems.map((item, index) => {
      const coords = transformGpsToAR(item.latitude, item.longitude);
      if (!coords) return undefined;
      const scale = Math.abs(Math.round(coords.z / 15));
      const distance = distanceBetweenPoints(location, item);

      if (!distance) return undefined;
      return (
        <ViroNode key={index} scale={[scale, scale, scale]} rotation={[0, 0, 0]} position={[coords.x, 0, coords.z]}>
          <ViroBox scale={[1, 1, 1]} />
          <ViroFlexView style={{ alignItems: "center", justifyContent: "center" }}>
            <ViroText text={`${Number(distance * 1000).toFixed(2)} m`} position={[0, 1, 0]} />
          </ViroFlexView>
        </ViroNode>
      );
    });
    return ARObjects;
  };

  return <ViroARScene onCameraTransformUpdate={onCameraTransformUpdate}>{location && placeARObjects()}</ViroARScene>;
}

export default () => {
  const theme = useAppTheme();
  const { top } = useSafeAreaInsets();
  return (
    <MainBody>
      <>
        <ViroARSceneNavigator initialScene={{ scene: ARExplorePage }}></ViroARSceneNavigator>
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
      </>
    </MainBody>
  );
};
const _style = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  columnLayout: {
    flex: 1,
    flexDirection: "column",
    alignContent: "flex-start",
    alignItems: "center",
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
});
