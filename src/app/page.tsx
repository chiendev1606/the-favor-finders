import { CreateRoomForm } from "@/components/create-room-form";
import { JoinRoomForm } from "@/components/join-room-form";

export default function Home() {
  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">
          The Flavor Finders
        </h1>
        <p className="text-gray-500">Vote on what to eat together</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Create a Room
          </h2>
          <CreateRoomForm />
        </div>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-orange-200" />
          <span className="mx-4 text-orange-300 text-sm">or</span>
          <div className="flex-grow border-t border-orange-200" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Join a Room
          </h2>
          <JoinRoomForm />
        </div>
      </div>
    </main>
  );
}
