"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

export interface RoutePoint {
  name: string;
  lat: number;
  lng: number;
  reached: boolean;
}

function dot(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 0 0 2px ${color}55"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

/** Gönderinin geçtiği şubeleri OpenStreetMap üzerinde gösterir (FR-09) */
export default function RouteMap({ points }: { points: RoutePoint[] }) {
  if (points.length === 0) return null;
  const reached = points.filter((p) => p.reached);
  const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])).pad(0.25);
  const last = reached.at(-1);

  return (
    <MapContainer bounds={bounds} scrollWheelZoom={false} className="h-72 w-full sm:h-80" aria-label="Gönderi rotası haritası">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={points.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#94a3b8", dashArray: "6 8", weight: 3 }} />
      {reached.length > 1 && <Polyline positions={reached.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#1b7d4e", weight: 4 }} />}
      {points.map((p, i) => (
        <Marker key={`${p.name}-${i}`} position={[p.lat, p.lng]} icon={dot(p === last ? "#f59e0b" : p.reached ? "#1b7d4e" : "#94a3b8")}>
          <Popup>
            <strong>{p.name}</strong>
            <br />
            {p === last ? "Gönderinin son konumu" : p.reached ? "Geçildi" : "Varış noktası"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
