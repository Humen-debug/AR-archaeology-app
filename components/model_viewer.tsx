import { useState, useRef, Suspense, useLayoutEffect, useEffect, forwardRef, ForwardedRef } from "react";
import { Canvas, useFrame, useLoader, MeshProps, useThree, PerspectiveCameraProps } from "@react-three/fiber/native";
import _ from "lodash";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { loadObjAsync, loadTextureAsync, THREE } from "expo-three";
import { AnimatedSensor } from "react-native-reanimated";
import { Mesh, TextureLoader } from "three";
import { Asset } from "expo-asset";
import { Platform, ViewStyle } from "react-native";
import OrbitControlsView from "expo-three-orbit-controls";

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
  useLayoutEffect(() => {
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
      obj.forEach((it) => it?.traverse(callback));
    } else if (obj) {
      obj?.traverse(callback);
    }
  }, [obj, texture]);

  useFrame(({ clock }, delta, frame) => {
    if (!meshRef) return;
    if (!meshRef.current?.rotation) return;
    // const y = clock.getElapsedTime();
    // meshRef.current.rotation.y = y;
  });

  return (
    <mesh ref={meshRef} {...props}>
      {obj ? <primitive object={obj} scale={0.1} /> : null}
    </mesh>
  );
}

// solution of setting default camera: https://github.com/pmndrs/react-three-fiber/discussions/1148
// solution of using ref.current in forwardRef: https://stackoverflow.com/questions/62238716/using-ref-current-in-react-forwardref
const Camera = forwardRef(function Camera(props: PerspectiveCameraProps, ref: ForwardedRef<THREE.PerspectiveCamera>) {
  const set = useThree((state) => state.set);
  const size = useThree(({ size }) => size);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useLayoutEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.aspect = size.width / size.height;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [size, props]);

  useLayoutEffect(() => {
    const node = cameraRef.current;
    if (node) {
      console.log("set default camera");
      node.lookAt(new THREE.Vector3(0, 0, 0));
      set({ camera: node });
    }
  }, [ref]);

  const useForwardRef = (...refs: React.Ref<THREE.PerspectiveCamera>[]) => {
    return (node: THREE.PerspectiveCamera | null) => {
      refs.forEach((r) => {
        if (typeof r === "function") {
          r(node);
        } else if (r) {
          (r as React.MutableRefObject<THREE.PerspectiveCamera | null>).current = node;
        }
      });
    };
  };

  return <perspectiveCamera ref={useForwardRef(cameraRef, ref)} {...props} />;
});

export default function ModelViewer(props: ModelViewProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  return (
    // <OrbitControlsView style={[props.style, { flex: 1 }]} camera={cameraRef && cameraRef.current}>
    <Canvas onCreated={() => console.log("canvas created")} style={props.style}>
      <ambientLight />
      <pointLight position={[0, 2, 2]} />
      <directionalLight />
      <Camera ref={cameraRef} position={[0, 0, 10]} />
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </Canvas>
    // </OrbitControlsView>
  );
}
