import { useState, useRef, Suspense, useLayoutEffect } from "react";
import { Canvas, useFrame, useLoader, MeshProps } from "@react-three/fiber/native";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { TextureLoader, THREE } from "expo-three";
import { useAnimatedSensor, SensorType, AnimatedSensor } from "react-native-reanimated";
import { Mesh } from "three";
import { Asset } from "expo-asset";
import { ViewStyle } from "react-native";

interface ModelViewProps {
  animatedSensor?: AnimatedSensor<any>;
  objURL?: string[] | string;
  materialURL?: string[] | string;
  textureURL?: string[] | string;
  style?: ViewStyle;
}

function Model(props: ModelViewProps & MeshProps) {
  const animatedSensor =
    props.animatedSensor ||
    useAnimatedSensor(SensorType.GYROSCOPE, {
      interval: 100,
    });

  const [base] = useLoader(TextureLoader, [require("../assets/models/demo/scan.jpg")]);

  const obj = useLoader(OBJLoader, require("../assets/models/demo/scan.obj"));

  const meshRef = useRef<Mesh>(null);
  useLayoutEffect(() => {
    function callback(child: THREE.Object3D) {
      if (child instanceof THREE.Mesh) {
        try {
          child.material.map = base;
        } catch {
          console.log("cannot set material map");
        }
      }
    }

    if (Array.isArray(obj)) {
      for (var it of obj) it.traverse(callback);
    } else {
      obj.traverse(callback);
    }
  }, [obj]);

  useFrame((state, delta, frame) => {
    if (!animatedSensor || !meshRef) return;
    let { x, y, z } = animatedSensor.sensor.value;
    x = ~~(x * 100) / 5000;

    y = ~~(y * 100) / 5000;
    if (!meshRef.current?.rotation) {
      console.log("has no rotation");
      return;
    }
    meshRef.current.rotation.x += x;
    meshRef.current.rotation.y += y;
  });

  return (
    <mesh ref={meshRef} onClick={(e) => console.log("click")} {...props}>
      {obj ? <primitive object={obj} scale={0.05} /> : null}
    </mesh>
  );
}

export default function ModelView(props: ModelViewProps) {
  return (
    <Canvas onCreated={() => console.log("canvas created")} style={props.style}>
      <ambientLight />
      <pointLight position={[0, 10, 10]} />
      <directionalLight />
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </Canvas>
  );
}
