const EARTH_RADIUS_M = 6371000;

export function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function distanceToSegmentMeters(point, segStart, segEnd) {
  const px = point[0];
  const py = point[1];
  const ax = segStart[0];
  const ay = segStart[1];
  const bx = segEnd[0];
  const by = segEnd[1];

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return haversineMeters(px, py, ax, ay);
  }

  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));

  const projLat = ax + t * dx;
  const projLon = ay + t * dy;
  return haversineMeters(px, py, projLat, projLon);
}

/** @param {[number, number][]} routeCoords [lat, lng] */
export function minDistanceToRouteMeters(lat, lon, routeCoords) {
  if (!routeCoords?.length) return Infinity;
  if (routeCoords.length === 1) {
    return haversineMeters(lat, lon, routeCoords[0][0], routeCoords[0][1]);
  }

  let min = Infinity;
  const point = [lat, lon];
  for (let i = 0; i < routeCoords.length - 1; i += 1) {
    const d = distanceToSegmentMeters(point, routeCoords[i], routeCoords[i + 1]);
    min = Math.min(min, d);
  }
  return min;
}

/** @param {[number, number][]} routeCoords [lat, lng] */
export function getRouteBoundingBox(routeCoords, paddingDeg = 0.04) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  routeCoords.forEach(([lat, lon]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  });

  return {
    south: minLat - paddingDeg,
    north: maxLat + paddingDeg,
    west: minLon - paddingDeg,
    east: maxLon + paddingDeg,
  };
}
