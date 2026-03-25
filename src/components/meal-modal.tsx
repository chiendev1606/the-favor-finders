"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const MapClickHandler = dynamic(() => import("@/components/map-click-handler").then((m) => m.MapClickHandler), { ssr: false });

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null; description: string | null; tags: string | null; lat: number | null; lng: number | null } | null;

export function MealModal({
  roomCode,
  meal,
  onClose,
}: {
  roomCode: string;
  meal: Meal;
  onClose: () => void;
}) {
  const isEdit = meal !== null;
  const [nameVi, setNameVi] = useState(meal?.nameVi ?? "");
  const [nameEn, setNameEn] = useState(meal?.nameEn ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(meal?.image ?? null);
  const [description, setDescription] = useState(meal?.description ?? "");
  const [tags, setTags] = useState(meal?.tags ?? "");
  const [lat, setLat] = useState<string>(meal?.lat?.toString() ?? "");
  const [lng, setLng] = useState<string>(meal?.lng?.toString() ?? "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init leaflet + get user location when map is toggled
  useEffect(() => {
    if (!showMap) return;
    const existing = document.querySelector('link[href*="leaflet"]');
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setMapReady(true);
    });

    // Get user's current location
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation([21.0285, 105.8542]) // Fallback: Hanoi
      );
    }
  }, [showMap, userLocation]);

  function handleMapClick(clickLat: number, clickLng: number) {
    setLat(clickLat.toFixed(6));
    setLng(clickLng.toFixed(6));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImageUrl(data.url);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameVi.trim() || !nameEn.trim()) return;
    setLoading(true);

    const body = {
      nameVi, nameEn,
      image: imageUrl,
      description: description || null,
      tags: tags || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
    };

    if (isEdit) {
      await fetch(`/api/rooms/${roomCode}/meals/${meal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/rooms/${roomCode}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    onClose();
  }

  const hasCoords = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  // Map center priority: existing coords > user location > Hanoi
  const mapCenter: [number, number] = hasCoords
    ? [parseFloat(lat), parseFloat(lng)]
    : userLocation || [21.0285, 105.8542];

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Meal" : "Add New Meal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nameVi">Vietnamese Name</Label>
            <Input id="nameVi" placeholder="e.g. Phở" value={nameVi} onChange={(e) => setNameVi(e.target.value)} autoFocus required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameEn">English Name</Label>
            <Input id="nameEn" placeholder="e.g. Pho noodle soup" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <Image src={imageUrl} alt="" width={64} height={64} className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">No image</div>
              )}
              <div className="flex flex-col gap-1">
                <Button type="button" variant="link" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="h-auto p-0 text-blue-500">
                  {uploading ? "Uploading..." : imageUrl ? "Change image" : "Upload image"}
                </Button>
                {imageUrl && (
                  <Button type="button" variant="link" size="sm" onClick={() => setImageUrl(null)} className="h-auto p-0 text-destructive">Remove</Button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Tell people about this dish..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" placeholder="e.g. spicy,vegetarian,budget" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          {/* Location section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Location</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-blue-500"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? "Hide map" : "📍 Pick on map"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} className="text-xs" />
              <Input placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} className="text-xs" />
              {hasCoords && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-destructive"
                  onClick={() => { setLat(""); setLng(""); }}
                >
                  ✕
                </Button>
              )}
            </div>

            {showMap && mapReady && (
              <div className="space-y-1">
                <div className="rounded-lg overflow-hidden border h-48">
                  <MapContainer
                    key={`${mapCenter[0]}-${mapCenter[1]}`}
                    center={mapCenter}
                    zoom={hasCoords ? 16 : 15}
                    style={{ height: "100%", width: "100%", cursor: "crosshair" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onClick={handleMapClick} />
                    {hasCoords && (
                      <Marker position={[parseFloat(lat), parseFloat(lng)]} />
                    )}
                  </MapContainer>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Click on the map to set the location
                  {hasCoords && ` • ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`}
                </p>
              </div>
            )}

            {showMap && !mapReady && (
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                Loading map...
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Meal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
