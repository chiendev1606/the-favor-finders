import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RoomNotFound() {
  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h1 className="text-2xl font-bold">Room Not Found</h1>
          <p className="text-muted-foreground">
            This room code doesn&apos;t exist. Check the code and try again.
          </p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
