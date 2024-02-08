import { LatLng } from "react-native-maps";

export function distanceFromLatLonInKm(p1?: LatLng, p2?: LatLng) {
  if (!p1 || !p2) return 0;
  const { latitude: lat1, longitude: lon1 } = p1;
  const { latitude: lat2, longitude: lon2 } = p2;
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
  let north = -Infinity,
    east = -Infinity;
  let west = Infinity,
    south = Infinity;
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
