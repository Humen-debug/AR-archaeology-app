import { Viro3DPoint } from "@viro-community/react-viro/dist/components/Types/ViroUtils";
import { head } from "lodash";
import { Platform } from "react-native";
import { LatLng } from "react-native-maps";

export function distanceFromLatLonInKm(p1?: LatLng, p2?: LatLng) {
  if (!p1 || !p2) return 0;
  const { latitude: lat1, longitude: lon1 } = p1;
  const { latitude: lat2, longitude: lon2 } = p2;
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

export function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function rad2deg(rad: number): number {
  return rad * (180 / Math.PI);
}

export function degree360(deg: number): number {
  if (deg < 0) return 360 + deg;
  return deg % 360;
}
/**
 *
 * @param p1 Viro3D vector of point 1
 * @param p2 Viro3D vector of point 2
 * @returns Angle measured in the clockwise direction from the north line with `p1` as the origin
 * the line segment `p1` `p2` in Viro's X-Z plane.
 *
 * @link
 * https://math.stackexchange.com/questions/1596513/find-the-bearing-angle-between-two-points-in-a-2d-space
 */
export function degBetweenPoints(p1: Viro3DPoint, p2: Viro3DPoint): number {
  const [x1, _, z1] = p1;
  const [x2, __, z2] = p2;
  // rads to degree, range (-180, 180]
  const deg = rad2deg(Math.atan2(x2 - x1, z2 - z1));
  return degree360(deg); // range [0, 360)
}

export function getBoundaries(points: LatLng[]) {
  let north = -90,
    east = -180;
  let west = 89,
    south = 179;
  if (!points)
    return {
      northEast: { latitude: north, longitude: east },
      southWest: { latitude: south, longitude: west },
    };
  for (const point of points) {
    const { latitude, longitude } = point;
    if (latitude > north) north = latitude;
    if (latitude < south) south = latitude;
    if (longitude > east) east = longitude;
    if (longitude < west) west = longitude;
  }
  return {
    northEast: { latitude: north, longitude: east },
    southWest: { latitude: south, longitude: west },
  };
}

/**
 * @param latDeg The latitude of point
 * @param longDeg The longitude of point
 * @returns Conversion of latitude and longitude to device's local coordinates and vice versa.
 *
 * @link
 * https://stackoverflow.com/questions/47419496/augmented-reality-with-react-native-points-of-interest-over-the-camera.
 * https://github.com/ViroCommunity/geoar/blob/master/App.js for coding.
 *
 */
export const latLongToMerc = (latDeg: number, longDeg: number) => {
  // From: https://gist.github.com/scaraveos/5409402
  const longRad = (longDeg / 180.0) * Math.PI;
  const latRad = (latDeg / 180.0) * Math.PI;
  const smA = 6378137.0;
  const xmeters = smA * longRad;
  const ymeters = smA * Math.log((Math.sin(latRad) + 1) / Math.cos(latRad));
  return { x: xmeters, y: ymeters };
};

/**
 * @returns Bearing degree measured in the clockwise direction from the north line with `p1` as the origin
 * to `p2`
 *
 * @link
 * https://stackoverflow.com/questions/8123049/calculate-bearing-between-two-locations-lat-long
 */
export const bearingBetweenTwoPoints = (p1: LatLng | undefined, p2: LatLng | undefined): number => {
  if (!p1 || !p2) return 0;

  const y = Math.sin(p2.longitude - p1.longitude) * Math.cos(p2.latitude);
  const x = Math.cos(p1.latitude) * Math.sin(p2.latitude) - Math.sin(p1.latitude) * Math.cos(p2.latitude) * Math.cos(p2.longitude - p1.longitude);
  const theta = Math.atan2(y, x);
  const bearing = degree360(rad2deg(theta)); // in degrees

  return 360 - bearing;
};

/**
 * @param deviceLoc The latitude and longitude of user's device.
 * @param objLoc The latitude and longitude of target object.
 * @returns Viro's local coordinates [x, y, z] of `objLoc` with `deviceLoc` as the origin
 *
 * @link
 * (viro transform GPS to AR space) https://github.com/viromedia/viro/issues/131.
 * @link
 * (convert from global coordinate space to a local space) https://gamedev.stackexchange.com/questions/79765/how-do-i-convert-from-the-global-coordinate-space-to-a-local-space
 */
export const transformGpsToAR = (deviceLoc: LatLng | undefined, objLoc: LatLng | undefined, heading: number = 0): Viro3DPoint | undefined => {
  if (!deviceLoc || !objLoc) return undefined;

  const objPoint = latLongToMerc(objLoc.latitude, objLoc.longitude);
  const devicePoint = latLongToMerc(deviceLoc.latitude, deviceLoc.longitude);
  const dx = objPoint.x - devicePoint.x;
  const dy = objPoint.y - devicePoint.y;
  if (Platform.OS === "android") {
    // convert bearing to angle measured from x-axis to y-axis
    let angle = 0.0;
    if (heading <= 90) {
      angle = 90 - heading;
    } else {
      angle = 360 - heading + 90;
    }
    // Rotate the system to move the the heading to y-axis
    let newRotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
    let newRotatedZ = dx * Math.sin(-angle) + dy * Math.cos(-angle);
    return [newRotatedX, 0, -newRotatedZ];
  }

  // flip z because Viro use -z as the north.
  return [dx, 0, -dy];
};

/**
 *
 * @param point The user's location
 * @param path A path contains two points (2D vector)
 * @returns closest point on the `path` using orthogonal projection
 *
 * @link
 * https://www.quora.com/Is-there-a-method-to-find-the-point-on-a-straight-line-g-which-is-closest-to-a-certain-point-P.
 */
export const getClosestPointOnPath = (point: LatLng, ...path: [LatLng, LatLng]) => {
  const { latitude: lat1, longitude: lon1 } = path[0];
  const { latitude: lat2, longitude: lon2 } = path[1];

  const lineAB = {
    longitude: lon2 - lon1,
    latitude: lat2 - lat1,
  };
  const lineAP = {
    longitude: point.longitude - lon1,
    latitude: point.latitude - lat1,
  };

  const len = lineAB.longitude * lineAB.longitude + lineAB.latitude * lineAB.latitude;
  let dot = lineAP.longitude * lineAB.longitude + lineAP.latitude * lineAB.latitude;

  const t = Math.min(1, Math.max(0, dot / len));
  dot = lineAB.longitude * lineAP.latitude - lineAB.latitude * lineAP.longitude;

  return {
    latitude: lat1 + lineAB.latitude * t,
    longitude: lon1 + lineAB.longitude * t,
  } as LatLng;
};

/**
 *
 * @param targetIndex Index of user selected point on the path `points`.
 * @param points A list of points representing a path.
 * @param location User's current location.
 * @param threshold A number representing distance range in km to determine whether return the orthogonal closest point
 * between two points in `points` or the closer point between itself and `points[targetIndex]`. Default is 0.025.
 * @returns The next closest point between user's `location` and the `points[targetIndex]`.
 */
export const getNextPoint = (targetIndex: number, points: LatLng[], location: LatLng, threshold: number = 0.025) => {
  let closestPoint = points[0];
  let closestDistance = -1;
  let currentAnimate = 0;

  if (points.length > 1) {
    for (let i = 0; i < points.length - 1; i++) {
      const p = getClosestPointOnPath(location, points[i], points[i + 1]);
      const d = distanceFromLatLonInKm(p, location);
      if (closestDistance == -1 || closestDistance > d) {
        closestDistance = d;

        if (d > threshold) {
          currentAnimate = 1; // Getting far from path
          closestPoint = p;
        } else if (distanceFromLatLonInKm(points[i], points[targetIndex]) < distanceFromLatLonInKm(points[i + 1], points[targetIndex])) {
          closestPoint = points[i];
        } else {
          currentAnimate = 2; // Getting to point
          closestPoint = points[i + 1];
        }
      }
    }
  }

  return { currentAnimate, closestPoint: closestPoint };
};

export const isNear = (location: LatLng, target: LatLng, threshold: number = 0.001) => {
  return distanceFromLatLonInKm(location, target) <= threshold;
};
