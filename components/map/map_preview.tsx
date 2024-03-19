import { GeoPoint } from "@/models";
import { getBoundaries } from "@/plugins/geolocation";
import { useAppTheme } from "@/providers/style_provider";
import { router } from "expo-router";
import { createRef, useEffect, useMemo, useState } from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import MapView, { LatLng, MapType, Marker, Region } from "react-native-maps";
import ArrowLine from "./arrow_line";

export interface Props {
  points: GeoPoint[];
  style: StyleProp<ViewStyle>;
  onMapPress?: () => void;
  initialRegion?: Region;
  miniZoomLevel?: number;
  mapType?: MapType;
}

export default function MapPreview({ points, style, onMapPress, initialRegion, miniZoomLevel = 15, mapType = "standard" }: Props) {
  const ref = createRef<MapView>();
  const [isAnimate, setIsAnimate] = useState(false);
  const { style: appStyle, theme } = useAppTheme();

  const bound = useMemo(() => getBoundaries(points), [points]);
  useEffect(() => {
    if (ref.current && Platform.OS !== "ios" && points.length) {
      ref.current.setMapBoundaries?.(bound.northEast, bound.southWest);
    }
  }, []);

  const vediFortress: LatLng = { latitude: 39.92634215565024, longitude: 44.74058628178656 };

  return (
    <View style={[style, { overflow: "hidden" }]}>
      <MapView
        ref={ref}
        style={{ width: "100%", height: "100%" }}
        initialRegion={initialRegion ?? { ...(points?.[0] ?? vediFortress), latitudeDelta: 0.009, longitudeDelta: 0.009 }}
        mapType={mapType}
        minZoomLevel={miniZoomLevel}
        rotateEnabled={false}
        userInterfaceStyle={appStyle}
        onPress={() => {
          if (onMapPress) {
            onMapPress();
          } else {
            let params = {};
            if (points && points?.[0]) {
              const { latitude, longitude } = points?.[0];
              params = !!latitude && !!longitude ? { latitude, longitude } : {};
            }

            router.replace({ pathname: "/map", params: params });
          }
        }}
        onRegionChangeComplete={(region) => {
          if (!isAnimate && points.length) {
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

            if (ref.current && needUpdate) {
              setIsAnimate(true);
              ref.current.animateToRegion(newRegion);
            }
          } else setIsAnimate(false);
        }}
      >
        <ArrowLine coordinates={points} strokeWidth={6} strokeColor={theme.colors.tertiary} arrowSize={20} />
        {(points || []).map((point) => (
          <Marker
            key={point._id}
            coordinate={point}
            onPress={() => {
              router.replace({
                pathname: "/map",
                params: {
                  latitude: point.latitude,
                  longitude: point.longitude,
                },
              });
            }}
            zIndex={10}
          />
        ))}
      </MapView>
    </View>
  );
}
