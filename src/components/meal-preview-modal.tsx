"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

type Meal = {
  id: number;
  nameVi: string;
  nameEn: string;
  image: string | null;
  description: string | null;
  tags: string | null;
  lat: number | null;
  lng: number | null;
};

type NearbyPlace = {
  name: string;
  lat: number;
  lon: number;
  address: string;
};

const TAG_ICONS: Record<string, string> = {
  spicy: "🌶️", vegetarian: "🥬", budget: "💰", soup: "🍜",
  meat: "🥩", seafood: "🦐", grilled: "🔥", steamed: "♨️",
  light: "🍃", classic: "⭐",
};

export function MealPreviewModal({
  meal,
  onClose,
}: {
  meal: Meal | null;
  onClose: () => void;
}) {
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    if (!meal) return;

    // Load Leaflet CSS
    const existing = document.querySelector('link[href*="leaflet"]');
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Fix Leaflet default icons
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setMapReady(true);
    });

    // Use meal coordinates if available, otherwise get user location
    if (meal.lat && meal.lng) {
      setUserLocation({ lat: meal.lat, lon: meal.lng });
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserLocation({ lat: 21.0285, lon: 105.8542 }) // Default: Hanoi
      );
    }
  }, [meal]);

  // Search for nearby restaurants
  useEffect(() => {
    if (!userLocation || !meal) return;
    setLoadingMap(true);

    const query = `${meal.nameVi} OR ${meal.nameEn}`;
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " restaurant")}&format=json&limit=8&viewbox=${userLocation.lon - 0.05},${userLocation.lat + 0.05},${userLocation.lon + 0.05},${userLocation.lat - 0.05}&bounded=1`
    )
      .then((res) => res.json())
      .then((data) => {
        const results: NearbyPlace[] = data.map((d: { display_name: string; lat: string; lon: string }) => ({
          name: d.display_name.split(",")[0],
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          address: d.display_name.split(",").slice(0, 3).join(","),
        }));
        setPlaces(results);
      })
      .catch(() => {})
      .finally(() => setLoadingMap(false));
  }, [userLocation, meal]);

  if (!meal) return null;

  const tagList = meal.tags?.split(",").filter(Boolean) ?? [];

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Hero image */}
        {meal.image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-48 overflow-hidden rounded-t-lg"
          >
            <Image
              src={meal.image}
              alt={meal.nameVi}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white">{meal.nameVi}</h2>
              <p className="text-white/80 text-sm">{meal.nameEn}</p>
            </div>
          </motion.div>
        )}

        {!meal.image && (
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl">{meal.nameVi} — {meal.nameEn}</DialogTitle>
          </DialogHeader>
        )}

        <div className="px-6 py-4 space-y-5">
          {/* Tags */}
          {tagList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2"
            >
              {tagList.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {TAG_ICONS[tag.trim()] || "🏷️"} {tag.trim()}
                </Badge>
              ))}
            </motion.div>
          )}

          {/* Description */}
          {meal.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">About this dish</h3>
              <p className="text-sm leading-relaxed">{meal.description}</p>
            </motion.div>
          )}

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              📍 {meal.lat && meal.lng ? "Location & nearby places" : "Where to eat nearby"}
            </h3>
            {meal.lat && meal.lng && (
              <p className="text-xs text-muted-foreground mb-2">
                Coordinates: {meal.lat.toFixed(4)}, {meal.lng.toFixed(4)}
              </p>
            )}

            {loadingMap && (
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                Searching nearby places...
              </div>
            )}

            {!loadingMap && mapReady && userLocation && (
              <div className="rounded-lg overflow-hidden border h-56">
                <MapContainer
                  center={[userLocation.lat, userLocation.lon]}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Meal pinned location */}
                  {meal.lat && meal.lng && (
                    <Marker position={[meal.lat, meal.lng]}>
                      <Popup>📍 {meal.nameVi} — {meal.nameEn}</Popup>
                    </Marker>
                  )}
                  {/* User location (if different from meal) */}
                  {(!meal.lat || !meal.lng) && (
                    <Marker position={[userLocation.lat, userLocation.lon]}>
                      <Popup>📍 You are here</Popup>
                    </Marker>
                  )}
                  {/* Restaurants */}
                  {places.map((p, i) => (
                    <Marker key={i} position={[p.lat, p.lon]}>
                      <Popup>
                        <div>
                          <strong className="text-sm">{p.name}</strong>
                          <br />
                          <span className="text-xs text-gray-500">{p.address}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {!loadingMap && places.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No nearby restaurants found for this dish. Try searching online!
              </p>
            )}

            {/* Place list */}
            {places.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {places.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1">
                    <span className="text-orange-500 font-bold shrink-0">{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-muted-foreground truncate">{p.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Close button */}
          <div className="pb-2">
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
