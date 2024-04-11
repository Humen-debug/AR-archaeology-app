import { GeoPoint } from "@/models";
import { degBetweenPoints, transformGpsToAR } from "@/plugins/geolocation";
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
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
import { Viro3DPoint, ViroRotation } from "@viro-community/react-viro/dist/components/Types/ViroUtils";
import { createRef, useCallback, useMemo, useRef } from "react";
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

interface ViroOrientation {
  position: Viro3DPoint;
  rotation: ViroRotation;
  forward: Viro3DPoint;
  up: Viro3DPoint;
}

export default function ARExplorePage(props?: Props<ARExploreProps>) {
  const { targetPoint, calPoint, calTarget, addComment, comments } = props?.arSceneNavigator?.viroAppProps ?? {};
  const { speed, position, setPosition, initLocation, location, initHeading } = useARLocation();
  const sceneRef = createRef<ViroARScene>();

  function handleError(event) {
    console.log("OBJ loading failed with error: " + event.nativeEvent.error);
  }

  const init = useRef(false);
  const prePosition = useRef<Viro3DPoint>([0, 0, 0]);
  const preTimeStamp = useRef<Date>(new Date());
  // const preConsoleTimeStamp = useRef<Date>(new Date());
  const degree = calTarget ? degBetweenPoints(position, calTarget) : 180;

  // In viro space, object distance larger than 60m will likely not appear on screen
  const distance = useMemo(() => (calPoint ? Math.max(1, Math.round(Vector.distance(calPoint, position))) : 1), [calPoint, position]);
  const targetDistance = useMemo(() => (calTarget ? Math.max(1, Math.round(Vector.distance(calTarget, position))) : 1), [calTarget, position]);
  const targetScale = targetDistance > 10 ? 10 : targetDistance;
  const showDesc = calTarget && targetDistance <= 25 && targetPoint?.desc;

  /** Important to add initialized checking because Viro space needs real-world alignment before rending objects. */
  const _onTrackingUpdated = (state: ViroTrackingState, reason: ViroTrackingReason) => {
    switch (state) {
      case ViroTrackingStateConstants.TRACKING_NORMAL:
        if (!init.current) {
          init.current = true;
        }
        break;
      default:
        // in case the camera is off-tracked
        if (init.current) {
          console.log("camera off-tracked, try replace position with transform from GPS to AR ");
          // try place the route object based on the geolocation of the device
          try {
            const pos = transformGpsToAR(initLocation, location, initHeading);
            if (pos) {
              setPosition(pos);
            }
          } catch (error) {
            console.log("not available to transform location to AR space");
          }
        }
        break;
    }
  };

  const _onCameraTransformed = (cameraTransform: ViroCameraTransform) => {
    if (!init.current) return;

    const { position: cameraPos, rotation } = cameraTransform;

    const distance = Vector.distance(cameraPos, prePosition.current);
    const now = new Date();
    const secondDiff = (now.getTime() - preTimeStamp.current.getTime()) / 1000;

    // if ((now.getTime() - preConsoleTimeStamp.current.getTime()) / 1000 > 2) {
    //   console.log("rotY:", rotation[1]);
    //   preConsoleTimeStamp.current = now;
    // }

    // Filter distance delta smaller than speed(i.e. meters per second) in order to lift burden of render
    if (Math.floor(distance) > speed && secondDiff > 0) {
      setPosition(cameraPos);

      prePosition.current = cameraPos;
      preTimeStamp.current = now;
    }
  };

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
    <ViroARScene onTrackingUpdated={_onTrackingUpdated} onCameraTransformUpdate={_onCameraTransformed} onClick={_onSceneClicked} ref={sceneRef}>
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
                scale={[1, 1, targetDistance > 20 ? 20 * 10 : targetDistance * 10]}
                materials={"path"}
                position={[position[0], position[1] - 1, position[2]]}
                rotation={[0, degree, 0]}
              />
              {(!calTarget || !Vector.equal(calPoint, calTarget)) && (
                <ViroNode position={calPoint}>
                  <Viro3DObject
                    source={require("@assets/models/location_pin/object.obj")}
                    type="OBJ"
                    transformBehaviors={["billboardY"]}
                    materials={"waypoint"}
                    onError={handleError}
                  />
                </ViroNode>
              )}
            </>
          )}
          {calTarget && (
            <ViroNode position={calTarget}>
              {showDesc && (
                <ViroFlexView
                  height={1}
                  width={3.5}
                  position={[0, targetScale / 2, 0]}
                  style={{ backgroundColor: "#FFF", paddingHorizontal: 0.1, paddingVertical: 0.05 }}
                  transformBehaviors={["billboardY"]}
                >
                  <ViroText style={{ flex: 1 }} textLineBreakMode="CharWrap" textClipMode="None" color={"#000"} text={targetPoint?.desc || ""} />
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
  waypoint: {
    lightingModel: "Constant",
    diffuseColor: "#1CD8D2",
  },
});
