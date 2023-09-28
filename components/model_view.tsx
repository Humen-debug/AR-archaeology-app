import { useState, useRef, Suspense, useLayoutEffect, useEffect, useCallback } from "react";
import { Canvas, useFrame, useLoader, MeshProps, useThree, PerspectiveCameraProps, extend } from "@react-three/fiber/native";
import { useSpring, config } from "@react-spring/core";
import { useGesture } from "@use-gesture/react";
import _ from "lodash";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { Renderer } from "expo-three";
import { useAnimatedSensor, SensorType, AnimatedSensor } from "react-native-reanimated";
import { Mesh, Scene, MeshBasicMaterial, PerspectiveCamera, BoxGeometry, TextureLoader } from "three";
import { Asset } from "expo-asset";
import { Platform, ViewStyle } from "react-native";

import { GLView } from "expo-gl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ModelViewProps {
  animatedSensor?: AnimatedSensor<any>;
  objURL?: string[] | string;
  materialURL?: string[] | string;
  textureURL?: string[] | string;
  style?: ViewStyle;
}
/// 3D model loader solution https://github.com/expo/expo-three/issues/151
// function Model(props: ModelViewProps & MeshProps) {
//   let obj: THREE.Group<THREE.Object3DEventMap> | null = null;
//   let texture: THREE.Texture | null = null;

//   const loadAsset = async () => {
//     texture = await loadTextureAsync({ asset: require("../assets/models/demo/scan.jpg") });
//     obj = await loadObjAsync({ asset: require("../assets/models/demo/scan.obj") });
//   };

//   // componentDidMount
//   useEffect(() => {
//     loadAsset()
//       .catch((error) => console.log("error", error))
//       .then(() => console.log("loaded"));
//   }, []);

//   const meshRef = useRef<Mesh>(null);
//   useLayoutEffect(() => {
//     function callback(child: THREE.Object3D) {
//       if (child instanceof THREE.Mesh) {
//         try {
//           child.material.map = texture;
//         } catch {
//           console.log("cannot set material map");
//         }
//       }
//     }

//     if (Array.isArray(obj)) {
//       for (var it of obj) it?.traverse(callback);
//     } else {
//       obj?.traverse(callback);
//     }
//   }, [obj]);

//   useFrame(({ clock }, delta, frame) => {
//     if (!meshRef) return;
//     if (!meshRef.current?.rotation) return;
//     const y = clock.getElapsedTime();
//     meshRef.current.rotation.y = y;
//   });

//   return (
//     <mesh ref={meshRef} {...props}>
//       {obj ? <primitive object={obj} scale={0.05} /> : null}
//     </mesh>
//   );
// }

export default function ModelView(props: ModelViewProps) {
  const createObj = async () => {
    const loadManager = new THREE.LoadingManager();
    loadManager.onProgress = function (item, loaded, total) {
      console.log(item);
      console.log(`${(loaded / total) * 100}% loaded`);
    };
    loadManager.onError = function (url) {
      console.log(`An error on "${url}"`);
    };
    const mtlAsset = await Asset.fromModule(require("../assets/models/demo/scan.mtl")).downloadAsync();
    const objAsset = await Asset.fromModule(require("../assets/models/demo/scan.obj")).downloadAsync();
    const textureAsset = await Asset.fromModule(require("../assets/models/demo/scan.jpg")).downloadAsync();

    const texture = new THREE.TextureLoader(loadManager).load(textureAsset.localUri || textureAsset.uri);
    // texture.needsUpdate = true;

    const material = await new MTLLoader(loadManager).loadAsync(mtlAsset.localUri || mtlAsset.uri);
    material.preload();
    const object = await new OBJLoader(loadManager).setMaterials(material).loadAsync(objAsset.localUri || objAsset.uri);
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = texture;
      }
    });
    object.scale.set(0.05, 0.05, 0.05);

    console.log(object.position);
    return object;
  };

  const onContextCreate = async (gl: any) => {
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);

    gl.canvas = {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
    };
    // set camera position away from cube
    camera.position.z = 2;

    const renderer = new Renderer({ gl });
    // set size of buffer to be equal to drawing buffer width
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.set(0, 20, 10);
    controls.update();
    // render object
    // const obj = await createObj();
    // obj.position.copy(new THREE.Vector3(-400, 0, 0));
    // scene.add(obj);

    // create render function
    const render = () => {
      requestAnimationFrame(render);

      controls.update();
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    // call render
    render();
  };
  return <GLView onContextCreate={onContextCreate} style={{ flex: 1 }} />;
}
