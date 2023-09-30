import { extend, Object3DNode } from "@react-three/fiber/native";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

declare module "@react-three/fiber/native" {
  interface ThreeElements {
    orbitControls: Object3DNode<OrbitControls, typeof OrbitControls>;
  }
}
