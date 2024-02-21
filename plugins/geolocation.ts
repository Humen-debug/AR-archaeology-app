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

/*
 * stackoverflow.com/questions/47419496/augmented-reality-with-react-native-points-of-interest-over-the-camera
 * Solution to convert latitude and longitude to device's local coordinates and vice versa
 * https://github.com/ViroCommunity/geoar/blob/master/App.js for coding
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

/*
 * From http://www.movable-type.co.uk/scripts/latlong.html?from=48.9613600,-122.0413400&to=48.965496,-122.072989
 * Given two points, return the bearing degree from p1 to p2
 */
export const bearingBetweenTwoPoints = (p1: LatLng | undefined, p2: LatLng | undefined) => {
  if (!p1 || !p2) return 0;

  const y = Math.sin(p2.longitude - p1.longitude) * Math.cos(p2.latitude);
  const x = Math.cos(p1.latitude) * Math.sin(p2.latitude) - Math.sin(p1.latitude) * Math.cos(p2.latitude) * Math.cos(p2.longitude - p1.longitude);
  const theta = Math.atan2(y, x);
  const bearing = ((theta * 180) / Math.PI + 360) % 360; // in degrees

  return bearing;
};

export const transformGpsToAR = (deviceLoc: LatLng | undefined, objLoc: LatLng | undefined) => {
  if (!deviceLoc || !objLoc) return undefined;

  const objPoint = latLongToMerc(objLoc.latitude, objLoc.longitude);
  const devicePoint = latLongToMerc(deviceLoc.latitude, deviceLoc.longitude);
  var objDeltaX = objPoint.x - devicePoint.x;
  var objDeltaY = devicePoint.y - objPoint.y;
  // testing the render with heading
  // if (deviceLoc.heading) {
  //   const angleRadian = (deviceLoc.heading * Math.PI) / 180;
  //   objDeltaX = objDeltaX * Math.cos(angleRadian) - objDeltaY * Math.sin(angleRadian);
  //   objDeltaY = objDeltaX * Math.sin(angleRadian) + objDeltaY * Math.cos(angleRadian);
  // }

  return { x: objDeltaX, z: objDeltaY };
};

export const getClosestPointOnPath = (path: LatLng[], point: LatLng) => {
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

export const getNextPoint = (targetPoint: LatLng, points: LatLng[], location: LatLng) => {
  let closestPoint = points[0];
  let closestDistance = -1;

  if (points.length > 1) {
    for (let i = 0; i < points.length - 1; i++) {
      const p = getClosestPointOnPath([points[i], points[i + 1]], location);
      const d = distanceFromLatLonInKm(p, location);
      if (closestDistance == -1 || closestDistance > d) {
        closestDistance = d;

        if (d > 0.025) closestPoint = p;
        else
          closestPoint =
            distanceFromLatLonInKm(points[i], targetPoint) < distanceFromLatLonInKm(points[i + 1], targetPoint) ? points[i] : points[i + 1];
      }
    }
  }

  return closestPoint;
};
