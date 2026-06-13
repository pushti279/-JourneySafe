import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildPoiPopupHtml } from '../utils/poiPopup';

const ROUTE_COLOR = '#2563eb';
const START_COLOR = '#0f766e';
const END_COLOR = '#b45309';

const POI_STYLES = {
  washrooms: { color: '#0284c7', emoji: '🚻' },
  fuel: { color: '#d97706', emoji: '⛽' },
  restaurants: { color: '#7c3aed', emoji: '🍽' },
  restStops: { color: '#059669', emoji: '🛑' },
};

function createPoiIcon(emoji, color) {
  return L.divIcon({
    className: 'poi-marker-icon',
    html: `<div style="
      background:${color};
      width:24px;height:24px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;border:2px solid white;
      box-shadow:0 1px 3px rgba(0,0,0,.2);
    ">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

function createEndpointMarker(lat, lng, label, color) {
  return L.circleMarker([lat, lng], {
    radius: 8,
    fillColor: color,
    color: '#fff',
    weight: 2,
    fillOpacity: 1,
  }).bindPopup(`<strong>${label}</strong>`);
}

export default function RouteMap({
  routeData,
  visiblePois,
  focusPoi,
  highlightedPoiId,
  className = '',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const poiLayerRef = useRef(null);
  const highlightLayerRef = useRef(null);
  const markerIndexRef = useRef({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    routeLayerRef.current = L.layerGroup().addTo(map);
    poiLayerRef.current = L.layerGroup().addTo(map);
    highlightLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      routeLayerRef.current = null;
      poiLayerRef.current = null;
      highlightLayerRef.current = null;
      markerIndexRef.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    if (!routeData) {
      map.setView([20.5937, 78.9629], 5);
      return;
    }

    const { from, to, route } = routeData;
    const polyline = L.polyline(route.coordinates, {
      color: ROUTE_COLOR,
      weight: 4,
      opacity: 0.85,
    }).addTo(routeLayer);

    createEndpointMarker(from.lat, from.lon, from.name, START_COLOR).addTo(
      routeLayer,
    );
    createEndpointMarker(to.lat, to.lon, to.name, END_COLOR).addTo(routeLayer);

    map.fitBounds(polyline.getBounds(), { padding: [32, 32], maxZoom: 12 });
  }, [routeData]);

  useEffect(() => {
    const poiLayer = poiLayerRef.current;
    if (!poiLayer) return;

    poiLayer.clearLayers();
    markerIndexRef.current = {};
    if (!visiblePois) return;

    Object.entries(visiblePois).forEach(([category, items]) => {
      const style = POI_STYLES[category] ?? POI_STYLES.restaurants;

      items.forEach((poi) => {
        const marker = L.marker([poi.lat, poi.lon], {
          icon: createPoiIcon(style.emoji, style.color),
        })
          .bindPopup(buildPoiPopupHtml(poi))
          .addTo(poiLayer);
        markerIndexRef.current[poi.id] = marker;
      });
    });
  }, [visiblePois]);

  useEffect(() => {
    const highlightLayer = highlightLayerRef.current;
    if (!highlightLayer) return;
    highlightLayer.clearLayers();

    if (!highlightedPoiId || !visiblePois) return;

    let target = null;
    Object.values(visiblePois).some((list) => {
      target = list.find((p) => p.id === highlightedPoiId);
      return target;
    });

    if (!target) return;

    L.circleMarker([target.lat, target.lon], {
      radius: 14,
      fillColor: '#2563eb',
      color: '#fff',
      weight: 2,
      fillOpacity: 0.25,
    }).addTo(highlightLayer);

    markerIndexRef.current[target.id]?.openPopup();
  }, [highlightedPoiId, visiblePois]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusPoi) return;
    map.setView([focusPoi.lat, focusPoi.lon], 15, { animate: true });
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [focusPoi]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [routeData, visiblePois]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-50 ${className}`}
    >
      <div ref={containerRef} className="h-full min-h-[280px] w-full" />
      <p className="pointer-events-none absolute bottom-2 right-2 rounded bg-white/90 px-2 py-0.5 text-[10px] text-neutral-500 shadow-sm">
        © OpenStreetMap
      </p>
    </div>
  );
}
