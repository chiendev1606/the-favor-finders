"use client";

import { useState } from "react";

type Meal = { id: number; nameVi: string; nameEn: string };

export function MealItem({
  meal,
  roomCode,
}: {
  meal: Meal;
  roomCode: string;
}) {
  const [editing, setEditing] = useState(false);
  const [nameVi, setNameVi] = useState(meal.nameVi);
  const [nameEn, setNameEn] = useState(meal.nameEn);

  async function handleSave() {
    await fetch(`/api/rooms/${roomCode}/meals/${meal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameVi, nameEn }),
    });
    setEditing(false);
  }

  async function handleDelete() {
    await fetch(`/api/rooms/${roomCode}/meals/${meal.id}`, {
      method: "DELETE",
    });
  }

  if (editing) {
    return (
      <div className="flex gap-2 items-center">
        <input
          value={nameVi}
          onChange={(e) => setNameVi(e.target.value)}
          className="flex-1 px-2 py-1 border rounded text-sm"
          placeholder="Vietnamese"
        />
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="flex-1 px-2 py-1 border rounded text-sm"
          placeholder="English"
        />
        <button
          onClick={handleSave}
          className="text-green-600 text-sm font-medium hover:underline cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-gray-400 text-sm hover:underline cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-orange-50 group">
      <div>
        <span className="font-medium text-gray-800">{meal.nameVi}</span>
        <span className="text-gray-400 ml-2 text-sm">({meal.nameEn})</span>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-blue-500 text-sm hover:underline cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 text-sm hover:underline cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
