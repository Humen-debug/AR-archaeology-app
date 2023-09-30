import { useState, useRef, Suspense, useLayoutEffect, useEffect, forwardRef, ForwardedRef } from "react";
import { Canvas, useFrame, useLoader, MeshProps, useThree, PerspectiveCameraProps, extend } from "@react-three/fiber/native";
import _ from "lodash";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { loadMtlAsync, loadObjAsync, loadTextureAsync, Renderer, THREE } from "expo-three";
import { AnimatedSensor } from "react-native-reanimated";
import { Mesh, TextureLoader } from "three";
import { Asset } from "expo-asset";
import { Platform, ViewStyle } from "react-native";
extend({ OrbitControls });

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
      const textureAsset = Asset.fromModule(require("../assets/models/demo/texture.jpg"));
      await textureAsset.downloadAsync();
      const { localUri: textureLocalUri, uri: textureUri } = textureAsset;

      var object: THREE.Group<THREE.Object3DEventMap> | THREE.Group<THREE.Object3DEventMap>[] | null | any = null;

      switch (Platform.OS) {
        case "android":
          object = await loadObjAsync({
            asset: require("../assets/models/demo/object.obj"),
            mtlAsset: require("../assets/models/demo/material.mtl"),
          });

          const texture = await loadTextureAsync({ asset: require("../assets/models/demo/texture.jpg") });
          setTexture(texture);
          setObj(object);
          break;
        default:
          const loadManager = new THREE.LoadingManager();
          loadManager.onProgress = function (item, loaded, total) {
            console.log(item);
            console.log(`${(loaded / total) * 100}% loaded`);
          };
          loadManager.onError = function (url) {
            console.log(`An error on "${url}"`);
          };

          const mtlAsset = Asset.fromModule(require("../assets/models/demo/material.mtl"));
          await mtlAsset.downloadAsync();
          const { localUri: mtlLocalUri, uri: mtlUri } = mtlAsset;
          try {
            const base = new TextureLoader().load(textureLocalUri || textureUri);
            setTexture(base);
          } catch (error) {
            console.log("unable to load texture");
            throw error;
          }

          const material = await new MTLLoader(loadManager).loadAsync(mtlAsset.localUri || mtlAsset.uri);
          material.preload();

          const objAsset = Asset.fromModule(require("../assets/models/demo/object.obj"));
          await objAsset.downloadAsync();
          const { localUri: objLocalUri, uri: objUri } = objAsset;

          object = await new OBJLoader(loadManager).setMaterials(material).loadAsync(objAsset.localUri || objAsset.uri);

          if (Array.isArray(object)) {
            setObj(object);
          } else if (object) {
            setObj(object);
          }
          break;
      }
    };
    loadAsset()
      .catch((error) => {
        props.setError(error);
        console.log(error);
      })
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

  return (
    <mesh ref={meshRef} {...props}>
      {obj ? <primitive object={obj} scale={0.1} /> : null}
    </mesh>
  );
}

// solution of orbit control without @react-three/drei: https://codesandbox.io/s/react-three-fiber-orbit-controls-without-drei-7c11y
function CameraControls(props: PerspectiveCameraProps & { objPos?: THREE.Vector3 }) {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls class.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls
  const {
    camera,
    gl: { domElement },
  } = useThree();

  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef<OrbitControls | null>(null);
  useFrame((state) => {
    const control = controls.current;
    if (control && control.autoRotate) {
      control.update();
    }
  });

  useEffect(() => {
    const control = controls.current;
    if (control) {
      if (props.objPos) camera.lookAt(props.objPos);
      control.addEventListener("start", () => console.log("start dragging"));
    }
    return () => {
      if (control) {
        control.dispose();
      }
    };
  }, [camera, domElement]);
  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      enabled={true}
      enableZoom={true}
      enableRotate={true}
      enablePan={true}
      autoRotate={true}
      enableDamping={true}
      dampingFactor={0.25}
      minDistance={7}
      maxDistance={20}
      target={props.objPos}
      position={props.position}
    />
  );
}

export default function ModelViewer(props: ModelViewProps) {
  const [objPos, setObjPos] = useState<THREE.Vector3>();

  return (
    <Canvas
      onCreated={(state) => {
        console.log("canvas created");
      }}
      shadows
      gl={{ preserveDrawingBuffer: true, alpha: true }}
      style={props.style}
    >
      <CameraControls objPos={objPos} position={[0, 0, 10]} />

      <ambientLight />
      <pointLight position={[0, 0, 2]} />
      <directionalLight />

      <Suspense fallback={null}>
        <Model setObjPos={setObjPos} {...props} />
      </Suspense>
    </Canvas>
  );
}
