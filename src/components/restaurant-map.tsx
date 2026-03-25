"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

type Restaurant = {
  name: string;
  lat: number;
  lon: number;
  address?: string;
};

export function RestaurantMap({
  mealName,
  show,
  onClose,
}: {
  mealName: string;
  show: boolean;
  onClose: () => void;
}) {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!show) return;

    // Load leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Fix default marker icons
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setMapReady(true);
    });

    // Get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        // Default to Ho Chi Minh City
        setLocation({ lat: 10.7769, lon: 106.7009 });
      }
    );

    return () => {
      document.head.removeChild(link);
    };
  }, [show]);

  useEffect(() => {
    if (!location || !show) return;

    setLoading(true);
    // Search OpenStreetMap Nominatim for restaurants
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(mealName + " restaurant")}&format=json&limit=10&viewbox=${location.lon - 0.05},${location.lat + 0.05},${location.lon + 0.05},${location.lat - 0.05}&bounded=1`
    )
      .then((res) => res.json())
      .then((data) => {
        const results: Restaurant[] = data.map((d: { display_name: string; lat: string; lon: string }) => ({
          name: d.display_name.split(",")[0],
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          address: d.display_name,
        }));
        setRestaurants(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location, mealName, show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            🗺️ Nearby: {mealName}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              Searching nearby restaurants...
            </div>
          )}
          {!loading && location && mapReady && (
            <div className="h-96">
              <MapContainer
                center={[location.lat, location.lon]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {restaurants.map((r, i) => (
                  <Marker key={i} position={[r.lat, r.lon]}>
                    <Popup>
                      <strong>{r.name}</strong>
                      {r.address && <br />}
                      {r.address && <span className="text-xs">{r.address}</span>}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
          {!loading && restaurants.length === 0 && !loading && (
            <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">
              No restaurants found nearby. Try zooming out.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
