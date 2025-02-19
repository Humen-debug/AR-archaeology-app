import { useLayoutEffect, useState } from "react";
import { Dimensions, ScaledSize } from "react-native";

export type Orientation = "portrait" | "landscape";

export const Orientations: Record<string, Orientation> = {
  PORTRAIT: "portrait",
  LANDSCAPE: "landscape",
};

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  useLayoutEffect(() => {
    function onResize({ window: { width, height } }: { window: ScaledSize }) {
      if (width < height) {
        setOrientation("portrait");
      } else {
        setOrientation("landscape");
      }
    }
    Dimensions.addEventListener("change", onResize);
  }, []);
  return orientation;
}

export function isLandScape(orientation: Orientation) {
  return orientation === Orientations.LANDSCAPE;
}

export function isPortrait(orientation: Orientation) {
  return orientation === Orientations.PORTRAIT;
}
