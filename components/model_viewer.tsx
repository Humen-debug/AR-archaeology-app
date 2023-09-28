import { useState, useRef, Suspense, useLayoutEffect, useEffect, useCallback } from "react";
import { Canvas, useFrame, useLoader, MeshProps, useThree, PerspectiveCameraProps, extend } from "@react-three/fiber/native";
import { useSpring, config } from "@react-spring/core";
import { useGesture } from "@use-gesture/react";
import _ from "lodash";

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { loadObjAsync, loadTextureAsync, THREE } from "expo-three";
import ExpoTHREE from "expo-three";
import { useAnimatedSensor, SensorType, AnimatedSensor } from "react-native-reanimated";
import { Mesh, TextureLoader } from "three";
import { Asset } from "expo-asset";
import { Platform, ViewStyle } from "react-native";

interface ModelViewProps {
  animatedSensor?: AnimatedSensor<any>;
  objURL?: string[] | string;
  materialURL?: string[] | string;
  textureURL?: string[] | string;
  style?: ViewStyle;
}
/// 3D model loader solution https://github.com/expo/expo-three/issues/151
function Model(props: ModelViewProps & MeshProps) {
  const [obj, setObj] = useState<THREE.Group<THREE.Object3DEventMap> | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // componentDidMount
  useEffect(() => {
    const loadAsset = async () => {
      const textureAsset = Asset.fromModule(require("../assets/models/demo/scan.jpg"));
      await textureAsset.downloadAsync();
      const { localUri: textureLocalUri, uri: textureUri } = textureAsset;

      var object: THREE.Group<THREE.Object3DEventMap> | THREE.Group<THREE.Object3DEventMap>[] | null | any = null;

      switch (Platform.OS) {
        case "android":
          object = await loadObjAsync({ asset: require("../assets/models/demo/scan.obj"), mtlAsset: require("../assets/models/demo/scan.mtl") });
          const texture = await loadTextureAsync({ asset: require("../assets/models/demo/scan.jpg") });
          setTexture(texture);
          setObj(object);
          break;
        default:
          const mtlAsset = Asset.fromModule(require("../assets/models/demo/scan.mtl"));
          await mtlAsset.downloadAsync();
          const { localUri: mtlLocalUri, uri: mtlUri } = mtlAsset;
          const base = new TextureLoader().load(textureLocalUri || textureUri);
          setTexture(base);
          const objAsset = Asset.fromModule(require("../assets/models/demo/scan.obj"));
          await objAsset.downloadAsync();
          const { localUri: objLocalUri, uri: objUri } = objAsset;
          //   const material = useLoader(MTLLoader, mtlLocalUri || mtlUri);
          object = useLoader(OBJLoader, require("../assets/models/demo/scan.obj"), (loader) => console.log("loader", loader));
          if (Array.isArray(object)) {
            setObj(object[0]);
          } else if (object) {
            setObj(object);
          }
          break;
      }
    };
    loadAsset()
      .catch((error) => console.log("error", error))
      .then(() => console.log("loaded"));
  }, []);

  const meshRef = useRef<Mesh>(null);
  useLayoutEffect(() => {
    function callback(child: THREE.Object3D) {
      if (!texture) return;
      if (child instanceof THREE.Mesh) {
        try {
          child.material.map = texture;
          child.material.normalMap = texture;
        } catch {
          console.log("cannot set material map");
        }
      }
    }

    if (Array.isArray(obj)) {
      console.log("obj is array");
      obj.forEach((it) => it?.traverse(callback));
    } else if (obj) {
      obj?.traverse(callback);
    }
  }, [obj, texture]);

  useFrame(({ clock }, delta, frame) => {
    if (!meshRef) return;
    if (!meshRef.current?.rotation) return;
    const y = clock.getElapsedTime();
    meshRef.current.rotation.y = y;
  });

  return (
    <mesh ref={meshRef} {...props}>
      {obj ? <primitive object={obj} scale={0.05} /> : null}
    </mesh>
  );
}

export default function ModelViewer(props: ModelViewProps) {
  return (
    <Canvas onCreated={() => console.log("canvas created")} style={props.style}>
      <ambientLight />
      <pointLight position={[0, 2, 2]} />
      <directionalLight />
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </Canvas>
  );
}
