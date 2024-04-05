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
import * as Vector from "@/plugins/vector";
import moment from "moment";
import { useARLocation } from "@/providers/ar_location_provider";

export interface Props<T extends unknown> {
  arSceneNavigator: {
    viroAppProps: T;
  };
}

export interface Comment {
  content: string;
  position?: Viro3DPoint;
  user: string;
  createdAt: Date;
}

export interface ARExploreProps {
  targetPoint: GeoPoint | undefined;
  calTarget?: Viro3DPoint;
  calPoint?: Viro3DPoint;
  addComment?: (position: Viro3DPoint) => Promise<void>;
  comments?: Comment[];
}

export default function ARExplorePage(props?: Props<ARExploreProps>) {
  const { targetPoint, calPoint, calTarget, addComment, comments } = props?.arSceneNavigator?.viroAppProps ?? {};
  const { speed, position, setPosition } = useARLocation();
  const sceneRef = createRef<ViroARScene>();

  function handleError(event) {
    console.log("OBJ loading failed with error: " + event.nativeEvent.error);
  }

  const init = useRef(false);
  const prePosition = useRef<Viro3DPoint>([0, 0, 0]);
  const degree = calTarget ? degBetweenPoints(position, calTarget) : 180;

  // In viro space, object distance larger than 60m will likely not appear on screen
  const distance = useMemo(() => (calPoint ? Math.round(Vector.distance(calPoint, position)) : 1), [calPoint, position]);
  const targetDistance = useMemo(() => (calTarget ? Math.round(Vector.distance(calTarget, position)) : -1), [calTarget, position]);
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

  const _onCameraTransformed = useCallback((cameraTransform: ViroCameraTransform) => {
    const { position: cameraPos } = cameraTransform;
    const distance = Vector.distance(cameraPos, prePosition.current);

    // Filter distance delta smaller than speed(i.e. meters per second) in order to lift burden of React native
    if (distance >= (speed < 0.5 ? 0.5 : speed)) {
      setPosition(cameraPos);
      prePosition.current = cameraPos;
    }
  }, []);

  const _onSceneClicked = useCallback(
    (position: Viro3DPoint) => {
      if (position.length !== 3) return;
      addComment?.(position);
    },
    [addComment]
  );

  const renderComments = useCallback(() => {
    return (comments || []).map(({ position, user, createdAt, content }, index) => {
      return (
        position && (
          <ViroNode position={position} key={index}>
            <ViroFlexView
              height={1}
              width={2}
              style={{ backgroundColor: "#FFFFFF", flexDirection: "column", paddingHorizontal: 0.1, paddingVertical: 0.05 }}
              transformBehaviors={["billboardY"]}
              position={[0, 1, 0]}
            >
              <ViroText
                style={{ flex: 1, flexShrink: 1, textAlignVertical: "top" }}
                textLineBreakMode="CharWrap"
                textClipMode="None"
                color={"#000"}
                text={user}
              />
              <ViroText
                style={{ flex: 1, fontSize: 8, textAlignVertical: "top" }}
                textLineBreakMode="CharWrap"
                textClipMode="None"
                color={"#000"}
                text={moment(createdAt).format("DD/MM/YYYY")}
              />
              <ViroText
                style={{ flex: 2, textAlignVertical: "top" }}
                textLineBreakMode="CharWrap"
                textClipMode="None"
                color={"#000"}
                text={content}
              />
            </ViroFlexView>
          </ViroNode>
        )
      );
    });
  }, [comments]);

  return (
    <ViroARScene onTrackingUpdated={_onInitialized} onCameraTransformUpdate={_onCameraTransformed} onClick={_onSceneClicked} ref={sceneRef}>
      <ViroAmbientLight intensity={2000} color={"white"} />

      {init.current && (
        <>
          {renderComments()}
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
                  <ViroText text="Waypoint" color={"#fff"} transformBehaviors={["billboardY"]} position={[0, 1, 0]} />
                  <Viro3DObject
                    source={require("@assets/models/location_pin/object.obj")}
                    type="OBJ"
                    transformBehaviors={["billboardY"]}
                    materials={"pin"}
                    onError={handleError}
                  />
                </ViroNode>
              )}
            </>
          )}
          {calTarget && (
            <ViroNode position={calTarget}>
              {showDesc && (
                <ViroFlexView height={1} width={3.5} position={[0, 1, 0]} style={{ backgroundColor: "#FFF" }} transformBehaviors={["billboardY"]}>
                  <ViroText
                    style={{ flex: 1 }}
                    textLineBreakMode="CharWrap"
                    textClipMode="None"
                    color={"#000"}
                    text={targetPoint ? targetPoint?.desc || "" : ""}
                  />
                </ViroFlexView>
              )}
              <Viro3DObject
                scale={[targetScale, targetScale, targetScale]}
                transformBehaviors={["billboardY"]}
                source={require("@assets/models/location_pin/object.obj")}
                materials={"pin"}
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
  pin: {
    lightingModel: "Constant",
    diffuseColor: "#D81C1C",
  },
});
