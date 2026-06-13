import { POI_CATEGORIES } from '../constants/api';

const TYPE_LABELS = {
  washrooms: 'Clean washroom',
  fuel: 'Fuel station',
  restaurants: 'Restaurant / dhaba',
  restStops: 'Highway rest area',
};

export function buildPoiPopupHtml(poi) {
  const layer = POI_CATEGORIES[poi.category];
  const tags = poi.tags ?? {};
  const lines = [
    `<strong>${layer?.emoji ?? ''} ${poi.name}</strong>`,
    `<span style="font-size:12px;color:#525252">${TYPE_LABELS[poi.category] ?? poi.category}</span>`,
  ];

  if (tags.cuisine) {
    lines.push(`<span style="font-size:12px">Cuisine: ${tags.cuisine}</span>`);
  }
  if (tags.brand || tags.operator) {
    lines.push(
      `<span style="font-size:12px">${tags.brand ?? tags.operator}</span>`,
    );
  }
  if (tags.ref && /^NH/i.test(tags.ref)) {
    lines.push(`<span style="font-size:12px">Highway: ${tags.ref}</span>`);
  }
  if (tags.opening_hours) {
    lines.push(`<span style="font-size:12px">Hours: ${tags.opening_hours}</span>`);
  }
  if (tags.phone) {
    lines.push(`<span style="font-size:12px">Phone: ${tags.phone}</span>`);
  }

  lines.push(
    `<span style="font-size:11px;color:#737373">${poi.distanceMeters} m from route</span>`,
  );

  return lines.join('<br/>');
}
