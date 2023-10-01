import { useState, useEffect } from "react";

import _ from "lodash";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import ExpoTHREE, { Renderer, THREE, loadObjAsync, loadTextureAsync } from "expo-three";
import { AnimatedSensor } from "react-native-reanimated";
import { Scene, PerspectiveCamera, TextureLoader, Camera, AmbientLight, PointLight, SpotLight } from "three";
import { Asset } from "expo-asset";
import { Platform, ViewStyle } from "react-native";

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

export default function ModelView(props: ModelViewProps) {
  const [camera, setCamera] = useState<Camera | null>(null);

  let timeout;

  useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => clearTimeout(timeout);
  }, []);

  /// 3D model loader solution https://github.com/expo/expo-three/issues/151
  const createObj = async () => {
    const textureAsset = Asset.fromModule(require("../assets/models/demo/texture.jpg"));
    await textureAsset.downloadAsync();
    const { localUri: textureLocalUri, uri: textureUri } = textureAsset;

    var object: THREE.Group<THREE.Object3DEventMap> | THREE.Group<THREE.Object3DEventMap>[] | null = null;
    var texture: THREE.Texture | null = null;
    switch (Platform.OS) {
      case "android":
        object = await loadObjAsync({
          asset: require("../assets/models/demo/object.obj"),
          mtlAsset: require("../assets/models/demo/material.mtl"),
        });

        texture = await loadTextureAsync({ asset: require("../assets/models/demo/texture.jpg") });

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
          texture = base;
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
    if (Array.isArray(object)) {
      object.forEach((it) => it?.traverse(callback));
    } else if (object) {
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
    var obj: THREE.Group<THREE.Object3DEventMap> | THREE.Group<THREE.Object3DEventMap>[] | null;
    // render object
    try {
      obj = await createObj();
      if (Array.isArray(obj)) {
        obj.forEach((it) => {
          scene.add(it);
        });
      } else if (obj) {
        scene.add(obj);
        camera.lookAt(obj.position);
      }
    } catch (error) {
      console.log(error);
      props.setError(error);
    } finally {
      props.setLoading(false);
    }

    // create render function
    const render = () => {
      timeout = requestAnimationFrame(render);
      if (Array.isArray(obj)) {
        obj.forEach((it) => {
          it.rotation.y += 0.01;
        });
      } else if (obj) {
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
      <GLView onContextCreate={onContextCreate} style={{ flex: 1 }} />
    </OrbitControlsView>
  );
}
