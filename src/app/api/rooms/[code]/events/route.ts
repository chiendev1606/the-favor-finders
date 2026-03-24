import { addClient, removeClient } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const client = {
        id: crypto.randomUUID(),
        controller,
      };

      addClient(code, client);

      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(": connected\n\n"));

      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(interval);
          removeClient(code, client);
        }
      }, 30000);

      (controller as unknown as Record<string, unknown>).__cleanup = () => {
        clearInterval(interval);
        removeClient(code, client);
      };
    },
    cancel(controller) {
      const cleanup = (controller as unknown as Record<string, unknown>)
        .__cleanup as (() => void) | undefined;
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
