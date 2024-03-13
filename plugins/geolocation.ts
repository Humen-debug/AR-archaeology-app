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

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
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
 * @param latDeg The latitude
 * @param longDeg The longitude
 * @returns conversion of latitude and longitude to device's local coordinates and vice versa.
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
 * @returns bearing degree from p1 to p2
 *
 * @link
 * http://www.movable-type.co.uk/scripts/latlong.html?from=48.9613600,-122.0413400&to=48.965496,-122.072989.
 */
export const bearingBetweenTwoPoints = (p1: LatLng | undefined, p2: LatLng | undefined) => {
  if (!p1 || !p2) return 0;

  const y = Math.sin(p2.longitude - p1.longitude) * Math.cos(p2.latitude);
  const x = Math.cos(p1.latitude) * Math.sin(p2.latitude) - Math.sin(p1.latitude) * Math.cos(p2.latitude) * Math.cos(p2.longitude - p1.longitude);
  const theta = Math.atan2(y, x);
  const bearing = ((theta * 180) / Math.PI + 360) % 360; // in degrees

  return bearing;
};

/**
 *
 * @param deviceLoc the latitude and longitude of user's device.
 * @param objLoc the latitude and longitude of target object.
 * @returns local coordinates {x, z} of `objLoc` in viro AR spaces
 */
export const transformGpsToAR = (deviceLoc: LatLng | undefined, objLoc: LatLng | undefined) => {
  if (!deviceLoc || !objLoc) return undefined;

  const objPoint = latLongToMerc(objLoc.latitude, objLoc.longitude);
  const devicePoint = latLongToMerc(deviceLoc.latitude, deviceLoc.longitude);
  var objDeltaX = objPoint.x - devicePoint.x;
  var objDeltaY = devicePoint.y - objPoint.y;

  return { x: objDeltaX, z: objDeltaY };
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

  if (points.length > 1) {
    for (let i = 0; i < points.length - 1; i++) {
      const p = getClosestPointOnPath(location, points[i], points[i + 1]);
      const d = distanceFromLatLonInKm(p, location);
      if (closestDistance == -1 || closestDistance > d) {
        closestDistance = d;

        if (d > threshold) closestPoint = p;
        else
          closestPoint =
            distanceFromLatLonInKm(points[i], points[targetIndex]) < distanceFromLatLonInKm(points[i + 1], points[targetIndex])
              ? points[i]
              : points[i + 1];
      }
    }
  }

  return closestPoint;
};

export const isNear = (location: LatLng, target: LatLng, threshold: number = 0.001) => {
  return distanceFromLatLonInKm(location, target) <= threshold;
};
