import LPF from "@/plugins/low-pass-filter";
import { Viro3DPoint } from "@viro-community/react-viro/dist/components/Types/ViroUtils";
import * as Location from "expo-location";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

class ARLocationContext {
  initLocation: Location.LocationObjectCoords | undefined;
  location: Location.LocationObjectCoords | undefined;
  heading: number | undefined;
  initHeading: number | undefined;
  speed: number;
  position: Viro3DPoint;
  indoor: boolean;
  cameraReady: boolean;
  setPosition: (position: Viro3DPoint) => void;
}

interface Props {
  children: React.ReactNode;
}

const ARLocationStore = createContext<ARLocationContext | null>(null);

const DISTANCE_INTERVAL = 20;
const GPS_ERROR_MARGIN = 50;
export function ARLocationProvider({ children }: Props) {
  const [cameraReady, setCameraReady] = useState(true);
  const [indoor, setIndoor] = useState(false);

  const [initLocation, setInitLocation] = useState<Location.LocationObjectCoords>();
  const [location, setLocation] = useState<Location.LocationObjectCoords>();
  const [speed, setSpeed] = useState<number>(0.5); // meters per second
  const [heading, setHeading] = useState<number>();
  const [initHeading, setInitHeading] = useState<number>();

  const [position, setPosition] = useState<Viro3DPoint>([0, 0, 0]);

  const isAndroid: boolean = Platform.OS === "android";
  /** Init environment */
  useEffect(() => {
    const headingAccuracyThreshold = 3;

    var locationInit: boolean = false;
    var headingInit: boolean = false;
    var waited: boolean = false;

    let headingListener: Location.LocationSubscription | undefined;
    let locationListener: Location.LocationSubscription | undefined;
    var timer: NodeJS.Timeout;
    const headingFilter = new LPF();
    const speedFilter = new LPF(0.75);

    const displayAlert = async () => {
      timer = setInterval(() => {
        // display a cameraReady and remind the user to face the device's camera forward,
        // if the user completed the compass calibration
        if (!headingInit) {
          waited = true;
        }
        // remind the user to stay outside
        if (!locationInit) {
          setIndoor(true);
        }
      }, 30 * 1000); // 30 seconds
    };

    const getCurrentLocation = async () => {
      const geoOpt: Location.LocationOptions = {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: DISTANCE_INTERVAL,
      };

      headingListener = await Location.watchHeadingAsync((heading) => {
        const { trueHeading } = heading;
        if (trueHeading < 0) return;

        if (heading.accuracy >= headingAccuracyThreshold) {
          if (!headingInit) {
            setInitHeading(trueHeading);
            headingInit = true;
            if (waited) {
              setCameraReady(false);
            }
          }
          if (!isAndroid || heading.accuracy > 0) {
            // Filter noise of true heading using low-pass-filter
            const smoothHeading = Math.round(headingFilter.next(trueHeading));
            setHeading(smoothHeading);
          }
        }
      });
      locationListener = await Location.watchPositionAsync(geoOpt, async (result: Location.LocationObject) => {
        const coords = result.coords;

        // Consider applying low-pass-filter to recompute accuracy threshold
        if (coords.accuracy && coords.accuracy < GPS_ERROR_MARGIN) {
          if (!locationInit) {
            setInitLocation(coords);
            locationInit = true;
          }
          setLocation(coords);

          let smoothSpeed = coords.speed || 0.5;
          if (smoothSpeed < 0.5) smoothSpeed = 0.5;
          smoothSpeed = speedFilter.next(smoothSpeed);
          setSpeed(smoothSpeed);
        }
      });
    };
    headingFilter.init([]);
    speedFilter.init([]);

    displayAlert();
    getCurrentLocation();
    return () => {
      locationListener?.remove();
      headingListener?.remove();
      timer && clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!(initHeading && location)) return;
    // End animate after 10 sec
    var timer = setTimeout(() => {
      if (!cameraReady) {
        setCameraReady(true);
      }
    }, 10 * 1000);
    return () => timer && clearTimeout(timer);
  }, [cameraReady, initHeading, location]);

  return (
    <ARLocationStore.Provider value={{ initLocation, initHeading, location, heading, indoor, cameraReady, speed, position, setPosition }}>
      {children}
    </ARLocationStore.Provider>
  );
}

export function useARLocation() {
  const arLocation = useContext(ARLocationStore);
  if (!arLocation) throw Error("useARLocation must be inside ARLocationProvider.");
  return arLocation;
}
