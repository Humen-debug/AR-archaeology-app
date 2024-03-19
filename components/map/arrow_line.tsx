import { bearingBetweenTwoPoints } from "@/plugins/geolocation";
import { useMemo } from "react";
import { View } from "react-native";
import { Polyline, MapPolylineProps, LatLng, Marker } from "react-native-maps";

export interface Props extends MapPolylineProps {
  addOnlyLastArrow?: boolean;
  arrowSize?: number;
  heading?: number;
}

const calculateRotation = (point: LatLng, prePoint: LatLng, heading: number = 0) => {
  if (!point || !prePoint) return;
  const { latitude: lat1, longitude: lng1 } = point;
  const { latitude: lat2, longitude: lng2 } = prePoint;
  const rotationFunc = bearingBetweenTwoPoints;
  // count degree counter-clockwise then flip the arrow marker with 180;
  const flippedRotation = 360 - rotationFunc(point, prePoint) - 180;
  return {
    coordinate: { latitude: lat1, longitude: lng1 },
    rotation: flippedRotation - heading || 0,
    key: `${lat1}-${lng1}-${lat2}-${lng2}`,
  };
};

const DefaultArrow = ({ color, size }) => {
  return (
    <View style={{ height: size, width: size }}>
      <View
        style={{
          backgroundColor: "transparent",
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderTopWidth: 0,
          borderBottomWidth: size,
          borderRightWidth: size / 2,
          borderLeftWidth: size / 2,
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
          borderLeftColor: "transparent",
        }}
      />
    </View>
  );
};

export default function ArrowLine(props: Props) {
  const { coordinates = [], geodesic = false, heading = 0, addOnlyLastArrow = false, arrowSize = 8, strokeColor, strokeWidth } = props;
  const makers = useMemo(() => {
    if (addOnlyLastArrow) {
      const index = coordinates.length - 1;
      return [calculateRotation(coordinates[index], coordinates[index - 1], heading)];
    }
    const result = coordinates.map((coord, index) => calculateRotation(coord, coordinates[index - 1], heading));
    // first item will be empty as we don't place marker at the line start
    result.shift();
    return result;
  }, [coordinates, geodesic, addOnlyLastArrow, heading]);

  if (coordinates.length < 2) {
    return null;
  }
  return (
    <>
      <Polyline coordinates={coordinates} strokeColor={strokeColor} strokeWidth={strokeWidth} />
      {makers
        .filter((markerProp) => !!markerProp)
        .map((markerProps) => {
          const color = strokeColor;
          return (
            <Marker {...markerProps} tappable={false} flat={false} anchor={{ x: 0.5, y: -0.01 }} centerOffset={{ x: 0.0, y: -0.01 }}>
              <DefaultArrow color={color} size={arrowSize} />
            </Marker>
          );
        })}
    </>
  );
}
