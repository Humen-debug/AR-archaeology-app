import { useState, useEffect } from "react";

import _ from "lodash";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import ExpoTHREE, { Renderer, THREE, loadObjAsync, loadTextureAsync, TextureLoader } from "expo-three";
import { AnimatedSensor } from "react-native-reanimated";
import { Scene, PerspectiveCamera, Camera, AmbientLight, PointLight, SpotLight, MeshBasicMaterial } from "three";
import { Asset } from "expo-asset";
import { Platform, ViewStyle } from "react-native";
import * as FileSystem from "expo-file-system";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
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

const copyAssetToCacheAsync = async (assetModule: string | number, localFilename: string) => {
  const localUri = `${FileSystem.cacheDirectory}asset_${localFilename}`;
  const fileInfo = await FileSystem.getInfoAsync(localUri, { size: false });
  if (!fileInfo.exists) {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    // alert(`copy asset to cache ${asset.localUri} -> ${localUri}`);
    await FileSystem.copyAsync({ from: asset.localUri || asset.uri, to: localUri });
  }
  return localUri;
};

export default function ModelView(props: ModelViewProps) {
  const [camera, setCamera] = useState<Camera | null>(null);

  let timeout;

  useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => {
      console.log("end timeout");
      clearTimeout(timeout);
    };
  }, []);

  /// 3D model loader solution https://github.com/expo/expo-three/issues/151
  /// Image resolver in android release build: https://stackoverflow.com/questions/69389275/expo-asset-library-works-in-debug-but-not-in-release-expo-ejected-project-react
  /// Note on loading a texture: https://github.com/expo/expo-three
  const createObj = async () => {
    var object: THREE.Group<THREE.Object3DEventMap> | null = null;
    var texture: THREE.Texture | null = null;
    switch (Platform.OS) {
      case "android":
        object = await loadObjAsync({
          asset: require("@assets/models/demo/object.obj"),
          mtlAsset: require("@assets/models/demo/material.mtl"),
        });

        // if in release mode, build the image to android/android/src/main/assets.
        // cuz expo-gl cannot handel them :(
        if (!__DEV__) {
          const uri = await copyAssetToCacheAsync(require("@assets/models/demo/scan.jpg"), "demo_texture");
          texture = await loadTextureAsync({ asset: uri });
        } else {
          texture = await loadTextureAsync({ asset: require("@assets/models/demo/scan.jpg") });
        }

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

        const mtlAsset = Asset.fromModule(require("@assets/models/demo/material.mtl"));
        await mtlAsset.downloadAsync();
        const { localUri: mtlLocalUri, uri: mtlUri } = mtlAsset;

        const base = new TextureLoader(loadManager).load(require("@assets/models/demo/scan.jpg"));
        texture = base;

        const material = await new MTLLoader(loadManager).loadAsync(mtlLocalUri || mtlUri);
        material.preload();

        const objAsset = Asset.fromModule(require("@assets/models/demo/object.obj"));
        await objAsset.downloadAsync();
        const { localUri: objLocalUri, uri: objUri } = objAsset;

        object = await new OBJLoader(loadManager).setMaterials(material).loadAsync(objLocalUri || objUri);

        break;
    }
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
    if (object) {
      object?.traverse(callback);
    }

    return object;
  };

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    props.setLoading(true);
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.05, 1000);

    setCamera(camera);
    // set camera position away from object
    camera.position.z = 50;

    const ambientLight = new AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 2, 1000, 1);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);

    // spot light on the top
    const spotLight = new SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 500, 100);
    spotLight.lookAt(scene.position);
    scene.add(spotLight);

    const renderer = new Renderer({ gl });
    // set size of buffer to be equal to drawing buffer width
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    var obj: THREE.Group<THREE.Object3DEventMap> | null = null;

    try {
      // render object
      obj = await createObj();
      if (obj) {
        scene.add(obj);
        camera.lookAt(obj.position);
      }
      // dev
      if (Platform.OS === "ios") {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: "white" });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
      }
    } catch (error) {
      console.log(error);
      props.setError(error);
    } finally {
      props.setLoading(false);
    }

    // create render function
    console.log("render");
    const render = () => {
      timeout = requestAnimationFrame(render);
      if (obj) {
        if (Platform.OS === "ios") console.log(`${Date.now()}: rotate`);
        obj.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    // call render
    render();
  };

  return (
    <OrbitControlsView style={{ flex: 1 }} camera={camera} minDistance={10}>
      <GLView onContextCreate={onContextCreate} style={{ flex: 1 }} msaaSamples={0} />
    </OrbitControlsView>
  );
}
