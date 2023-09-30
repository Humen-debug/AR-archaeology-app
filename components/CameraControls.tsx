import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber/native";

function CameraControls() {
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const controls = useRef(null);

  useFrame((state) => controls?.current?.update());

  return <orbitControls ref={controls} args={[camera, domElement]} enableZoom={true} enableRotate={true} />;
}
