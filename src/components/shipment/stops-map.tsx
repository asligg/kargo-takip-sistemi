"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

export interface MapStop {
  lat: number;
  lng: number;
  label: string;
  detail: string;
}

function numberIcon(text: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:${color};color:white;font:700 12px/1 Inter,sans-serif;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)">${text}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

/** Kuryenin günlük rotası: şube (Ş) ve sıra numaralı teslimat durakları */
export default function StopsMap({ start, stops }: { start: { lat: number; lng: number; label: string }; stops: MapStop[] }) {
  const all = [start, ...stops].map((p) => [p.lat, p.lng] as [number, number]);
  return (
    <MapContainer bounds={L.latLngBounds(all).pad(0.15)} scrollWheelZoom={false} className="h-80 w-full" aria-label="Kurye rota haritası">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={all} pathOptions={{ color: "#1b7d4e", weight: 4, opacity: 0.8 }} />
      <Marker position={[start.lat, start.lng]} icon={numberIcon("Ş", "#12402d")}>
        <Popup>
          <strong>{start.label}</strong>
          <br />
          Çıkış noktası
        </Popup>
      </Marker>
      {stops.map((s, i) => (
        <Marker key={`${i}-${s.label}`} position={[s.lat, s.lng]} icon={numberIcon(String(i + 1), i === 0 ? "#d97706" : "#1b7d4e")}>
          <Popup>
            <strong>
              {i + 1}. {s.label}
            </strong>
            <br />
            {s.detail}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
