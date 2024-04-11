import { StyleSheet, View } from "react-native";
import { Circle, G, Svg, Polygon } from "react-native-svg";

export interface Props {
  size?: number;
  arrowSize?: number;
  rotateDegree: number;
  stroke: string;
  arrowColor: string;
  degree: number;
}

export default function HeadingIndicator({ size = 32, arrowSize = 16, rotateDegree, stroke, degree, arrowColor }: Props) {
  const radius = 300;
  const circumference = radius * 2 * Math.PI;
  const length = (degree / 360) * circumference;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", alignContent: "center" }}>
      <View style={style.centerContainer}>
        <View style={style.fill}>
          <Svg viewBox="-600 -600 1200 1200">
            <G transform={`rotate(${rotateDegree - degree / 2 - 90})`}>
              <Circle
                stroke={stroke}
                fill={"none"}
                r={radius}
                strokeWidth={radius * 2}
                strokeOpacity={0.5}
                strokeDasharray={`${length} ${circumference}`}
              />
            </G>
          </Svg>
        </View>
      </View>
      <View style={style.centerContainer}>
        {/* Triangle */}
        <View style={[{ width: arrowSize, height: arrowSize, transform: [{ rotate: `${rotateDegree}deg` }] }]}>
          <Svg height={"100%"} width={"100%"}>
            <Polygon points={"8,0 0,16 16,16"} fill={arrowColor} />
          </Svg>
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  centerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  fill: {
    height: "100%",
    width: "100%",
  },
});
