import { GeoPoint } from "@/models";
import { degBetweenPoints } from "@/plugins/geolocation";
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroARTrackingReasonConstants,
  ViroBox,
  ViroCameraTransform,
  ViroFlexView,
  ViroMaterials,
  ViroNode,
  ViroText,
  ViroTrackingReason,
  ViroTrackingState,
  ViroTrackingStateConstants,
} from "@viro-community/react-viro";
import { Viro3DPoint } from "@viro-community/react-viro/dist/components/Types/ViroUtils";
import { createRef, useCallback, useMemo, useRef, useState } from "react";
import { LatLng } from "react-native-maps";
import * as Vector from "@/plugins/vector";

export interface Props<T extends unknown> {
  arSceneNavigator: {
    viroAppProps: T;
  };
}

export interface ARExploreProps {
  location?: LatLng;
  targetPoint: GeoPoint | undefined;
  setARnear?: (value: boolean) => void;
  calTarget?: Viro3DPoint;
  calPoint?: Viro3DPoint;
  speed?: number;
}

export default function ARExplorePage(props?: Props<ARExploreProps>) {
  const { targetPoint, setARnear, calPoint: wayPoint, calTarget: target, speed } = props?.arSceneNavigator?.viroAppProps ?? {};
  const sceneRef = createRef<ViroARScene>();

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

  const init = useRef(false);
  const prePosition = useRef<Viro3DPoint>([0, 0, 0]);
  const [position, setPosition] = useState<Viro3DPoint>([0, 0, 0]);

  const computePoint = (point: Viro3DPoint | undefined) => {
    return point && (Vector.add(point, position) as Viro3DPoint);
  };

  const calPoint = useMemo(() => computePoint(wayPoint), [wayPoint]);
  const calTarget = useMemo(() => computePoint(target), [target]);
  const degree = calTarget ? degBetweenPoints(position, calTarget) : 180;

  // In viro space, object distance larger than 60m will likely not appear on screen
  const distance = useMemo(() => (calPoint ? Math.round(Vector.distance(calPoint, position)) : 1), [wayPoint, position]);
  const targetDistance = useMemo(() => (calTarget ? Math.round(Vector.distance(calTarget, position)) : -1), [target, position]);
  const targetScale = targetDistance > 10 ? 10 : targetDistance;
  const showDesc = calTarget && targetDistance <= 25 && targetPoint?.desc;

  /** Important to add initialized checking because Viro space needs real-world alignment before rending objects. */
  const _onInitialized = (state: ViroTrackingState, reason: ViroTrackingReason) => {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL && reason === ViroARTrackingReasonConstants.TRACKING_REASON_NONE) {
      if (init.current) return;
      init.current = true;
    }
    if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      // TODO urge user to update camera tracking
    }
  };

  const _onCameraTransformed = useCallback(
    (cameraTransform: ViroCameraTransform) => {
      const { position: cameraPos } = cameraTransform;
      const distance = Vector.distance(cameraPos, prePosition.current);
      // TODO 1. add smoothing animation even with noise filter
      // Filter distance delta smaller than 0.5 meters in order to lift burden of React native
      if (distance >= 0.5) {
        setPosition(cameraPos);
        prePosition.current = cameraPos;
      }
    },
    [setARnear]
  );

  return (
    <ViroARScene onTrackingUpdated={_onInitialized} onCameraTransformUpdate={_onCameraTransformed} ref={sceneRef}>
      <ViroAmbientLight intensity={2000} color={"white"} />
      {init.current && (
        <>
          {calPoint && (
            <>
              <ViroBox
                height={0.001}
                length={0.1}
                width={0.6}
                scalePivot={[0, 0, -0.05]}
                scale={[1, 1, distance > 20 ? 20 * 10 : distance * 10]}
                materials={"path"}
                position={[position[0], position[1] - 1, position[2]]}
                rotation={[0, degree, 0]}
              />
              {(!calTarget || !Vector.equal(calPoint, calTarget)) && (
                <ViroNode position={calPoint}>
                  <ViroText text="Waypoint" color={"#fff"} transformBehaviors={["billboard"]} position={[0, 1, 0]} />
                  <Viro3DObject
                    source={require("@assets/models/location_pin/object.obj")}
                    transformBehaviors={["billboard"]}
                    type="OBJ"
                    onError={handleError}
                  />
                </ViroNode>
              )}
            </>
          )}
          {calTarget && (
            <ViroNode position={calTarget}>
              {showDesc && (
                <ViroFlexView height={1} width={3.5} position={[0, targetScale + 1, 0]} style={{ backgroundColor: "white" }}>
                  <ViroText
                    style={{ flex: 1 }}
                    transformBehaviors={["billboard"]}
                    textLineBreakMode="CharWrap"
                    textClipMode="None"
                    color={"#000"}
                    text={targetPoint ? targetPoint?.desc || "" : ""}
                  />
                </ViroFlexView>
              )}
              <Viro3DObject
                scale={[targetScale, targetScale, targetScale]}
                transformBehaviors={["billboard"]}
                source={require("@assets/models/location_pin/object.obj")}
                type="OBJ"
                onError={handleError}
              />
            </ViroNode>
          )}
        </>
      )}
    </ViroARScene>
  );
}
