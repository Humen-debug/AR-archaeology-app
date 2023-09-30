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
  setLoading: (value: boolean) => void;
  setError: (value: any) => void;
}

interface ModelProps {
  setObjPos: (pos: THREE.Vector3) => void;
}

/// 3D model loader solution https://github.com/expo/expo-three/issues/151
function Model(props: ModelViewProps & ModelProps & MeshProps) {
  const [obj, setObj] = useState<THREE.Group<THREE.Object3DEventMap> | THREE.Group<THREE.Object3DEventMap>[] | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // componentDidMount
  useLayoutEffect(() => {
    props.setLoading(obj === null);
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
            setObj(object);
          } else if (object) {
            setObj(object);
          }
          break;
      }
    };
    loadAsset()
      .catch((error) => props.setError(error))
      .then(() => console.log("loaded"))
      .finally(() => props.setLoading(false));
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
      props.setObjPos(obj[0].position);
    } else if (obj) {
      obj?.traverse(callback);
      props.setObjPos(obj.position);
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
      {obj ? <primitive object={obj} scale={0.1} /> : null}
    </mesh>
  );
}

// solution of setting default camera: https://github.com/pmndrs/react-three-fiber/discussions/1148
// solution of using ref.current in forwardRef: https://stackoverflow.com/questions/62238716/using-ref-current-in-react-forwardref
const Camera = forwardRef(function Camera(
  props: PerspectiveCameraProps & { objPos: THREE.Vector3 | null },
  ref: ForwardedRef<THREE.PerspectiveCamera>
) {
  const set = useThree((state) => state.set);
  const size = useThree(({ size }) => size);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useLayoutEffect(() => {
    const node = cameraRef.current;
    if (node) {
      node.aspect = size.width / size.height;
      node.updateProjectionMatrix();
    }
  }, [size]);

  useLayoutEffect(() => {
    const node = cameraRef.current;
    if (node) {
      console.log("set default camera");
      set({ camera: node });
    }
  }, [ref]);

  useEffect(() => {
    const node = cameraRef.current;
    if (node && props.objPos) {
      console.log("look at obj position:", props.objPos);
      node.lookAt(props.objPos);
    }
  }, [props]);

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
  const [objPos, setObjPos] = useState<THREE.Vector3 | null>(null);
  return (
    <Canvas onCreated={() => console.log("canvas created")} style={props.style}>
      <ambientLight />
      <pointLight position={[0, 2, 2]} />
      <directionalLight />
      <Camera ref={cameraRef} objPos={objPos} position={[0, 0, 10]} />
      <Suspense fallback={null}>
        <Model setObjPos={setObjPos} {...props} />
      </Suspense>
    </Canvas>
  );
}
