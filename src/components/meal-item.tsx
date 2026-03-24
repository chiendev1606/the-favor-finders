"use client";

import Image from "next/image";

type Meal = { id: number; nameVi: string; nameEn: string; image: string | null };

export function MealItem({
  meal,
  roomCode,
  onEdit,
}: {
  meal: Meal;
  roomCode: string;
  onEdit: () => void;
}) {
  async function handleDelete() {
    await fetch(`/api/rooms/${roomCode}/meals/${meal.id}`, {
      method: "DELETE",
    });
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-orange-50 group">
      <div className="flex items-center gap-3 min-w-0">
        {meal.image ? (
          <Image src={meal.image} alt={meal.nameVi} width={40} height={40} className="w-10 h-10 object-cover rounded shrink-0" />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs shrink-0">
            ?
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-gray-800 text-sm truncate">{meal.nameVi}</div>
          <div className="text-gray-400 text-xs truncate">{meal.nameEn}</div>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity shrink-0 ml-2">
        <button
          onClick={onEdit}
          className="text-blue-500 text-xs hover:underline cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 text-xs hover:underline cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
