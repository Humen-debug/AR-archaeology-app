import { Viro3DObject, ViroARPlaneSelector, ViroARScene, ViroARSceneNavigator, ViroAmbientLight, ViroSpotLight } from "@viro-community/react-viro";
import MainBody from "../components/main_body";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IconBtn from "../components/icon_btn";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";
import { router } from "expo-router";

function ARPlacementPage() {
  return (
    <ViroARScene>
      <ViroAmbientLight color="#FFFFFF" intensity={400} />
      <ViroSpotLight
        position={[0, -0.5, -0.5]}
        color="#111"
        direction={[0, 0, -1]}
        attenuationStartDistance={5}
        attenuationEndDistance={10}
        innerAngle={5}
        outerAngle={20}
      />
      <ViroARPlaneSelector alignment="Horizontal" maxPlanes={5}>
        <Viro3DObject
          source={require("../assets/models/demo/object.obj")}
          resources={[require("../assets/models/demo/object.mtl"), require("../assets/models/demo/scan.jpg")]}
          highAccuracyEvents={true}
          position={[0, 0, 0]}
          scale={[0.01, 0.01, 0.01]}
          type="OBJ"
        />
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
            { justifyContent: "space-between", position: "absolute", top: top, left: 0, right: 0, paddingHorizontal: theme.spacing.md },
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
