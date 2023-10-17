import {
  Viro3DObject,
  ViroARPlaneSelector,
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  ViroQuad,
  ViroSpinner,
  ViroSpotLight,
} from "@viro-community/react-viro";
import MainBody from "../components/main_body";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { useAppTheme } from "../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IconBtn from "../components/icon_btn";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import { router } from "expo-router";
import { useState } from "react";
import { ViroPinchState, ViroRotateState } from "@viro-community/react-viro/dist/components/Types/ViroEvents";
import { ViroRotation, ViroScale } from "@viro-community/react-viro/dist/components/Types/ViroUtils";

function ARPlacementPage() {
  const [loading, setLoading] = useState(false);
  const [initScale, setInitScale] = useState<ViroScale>([0.025, 0.025, 0.025]);
  const [scale, setScale] = useState<ViroScale>([0.025, 0.025, 0.025]);
  const [initRotationY, setInitRotationY] = useState(0);
  const [rotation, setRotation] = useState<ViroRotation>([0, 0, 0]);

  function handleError(event) {
    console.log("OBJ loading failed with error: " + event.nativeEvent.error);
  }

  // todo: add state for scaling and rotation, so that they won't simultaneously occur
  function onPinch(pinchState: ViroPinchState, scaleFactor: number, source: ImageSourcePropType) {
    switch (pinchState) {
      // start pinching
      case 1:
        break;
      // user has adjusted pinch, moving both fingers
      case 2:
        setScale((scale) => initScale.map((it) => it * scaleFactor) as ViroScale);
        break;
      // finish and release both touch points
      case 3:
        const newScale = scale.map((it) => it * scaleFactor) as ViroScale;
        setInitScale(newScale);

        break;
    }
  }
  // rotate factor is in degree
  function onRotate(rotateState: ViroRotateState, rotateFactor: number, source: ImageSourcePropType) {
    switch (rotateState) {
      // start rotation
      case 1:
        break;
      // adjust rotation, moving both fingers
      case 2:
        setRotation((rotation) => [rotation[0], initRotationY + rotateFactor, rotation[2]]);
        break;
      // finish and released both touch points
      case 3:
        setInitRotationY(rotation[1] + rotateFactor);

        break;
    }
  }

  return (
    <ViroARScene>
      <ViroAmbientLight color="#FFFFFF" intensity={1000} />

      <ViroARPlaneSelector alignment="Horizontal" maxPlanes={5}>
        <ViroSpotLight
          innerAngle={5}
          outerAngle={25}
          direction={[0, -1, -0.2]}
          position={[0, 3, 1]}
          color="#ffffff"
          castsShadow={true}
          shadowMapSize={2048}
          shadowNearZ={2}
          shadowFarZ={5}
          shadowOpacity={0.7}
        />
        {loading && <ViroSpinner position={[0, 2, 0]} scale={[2, 2, 2]} />}
        <Viro3DObject
          source={require("../assets/models/demo/object.obj")}
          resources={[require("../assets/models/demo/material.mtl"), require("../assets/models/demo/scan.jpg")]}
          highAccuracyEvents={true}
          position={[0, 0, 0]}
          rotation={rotation}
          scale={scale}
          type="OBJ"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleError}
          shadowCastingBitMask={2}
          onPinch={onPinch}
          onRotate={onRotate}
        />
        {/* <ViroQuad position={[0, 0, 0]} rotation={[-90, 0, 0]} width={4} height={4} arShadowReceiver={true} /> */}
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}
export default () => {
  const theme = useAppTheme();
  const { top } = useSafeAreaInsets();
  return (
    <MainBody>
      <>
        <ViroARSceneNavigator initialScene={{ scene: ARPlacementPage }}></ViroARSceneNavigator>
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
