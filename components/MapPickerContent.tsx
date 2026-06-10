"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Create custom leaflet marker icon using CDN to avoid import loader errors in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerContentProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  editable?: boolean;
}

// Sub-component to handle map clicks
function ClickHandler({ onChange, editable }: { onChange: (lat: number, lng: number) => void; editable: boolean }) {
  useMapEvents({
    click(e) {
      if (editable) {
        onChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Sub-component to recenter map when external coordinates change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function MapPickerContent({ lat, lng, onChange, editable = true }: MapPickerContentProps) {
  // Validate coordinates or fall back to center of Surabaya
  const validLat = isNaN(lat) || lat === 0 ? -7.2572 : lat;
  const validLng = isNaN(lng) || lng === 0 ? 112.7388 : lng;

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border shadow-xs">
      <MapContainer
        center={[validLat, validLng]}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[validLat, validLng]} icon={customIcon} />
        <ClickHandler onChange={onChange} editable={editable} />
        <RecenterMap lat={validLat} lng={validLng} />
      </MapContainer>
      {editable && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-white px-2 py-1 text-[10px] text-zinc-500 rounded-sm border shadow-xs pointer-events-none">
          Click map to relocate marker
        </div>
      )}
    </div>
  );
}
