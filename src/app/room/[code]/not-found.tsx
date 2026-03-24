import Link from "next/link";

export default function RoomNotFound() {
  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-700 mb-2">Room Not Found</h1>
      <p className="text-gray-500 mb-6">
        This room code doesn&apos;t exist. Check the code and try again.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
      >
        Back to Home
      </Link>
    </main>
  );
}
