"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null } | null;

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
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (isEdit) {
      await fetch(`/api/rooms/${roomCode}/meals/${meal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameVi, nameEn, image: imageUrl }),
      });
    } else {
      await fetch(`/api/rooms/${roomCode}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameVi, nameEn, image: imageUrl }),
      });
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? "Edit Meal" : "Add New Meal"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Vietnamese Name</label>
            <input
              type="text"
              placeholder="e.g. Phở"
              value={nameVi}
              onChange={(e) => setNameVi(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">English Name</label>
            <input
              type="text"
              placeholder="e.g. Pho noodle soup"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Image</label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <Image src={imageUrl} alt="" width={64} height={64} className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-sm text-blue-500 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : imageUrl ? "Change image" : "Upload image"}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="text-sm text-red-400 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium cursor-pointer"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Meal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
