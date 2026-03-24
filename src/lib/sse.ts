type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const rooms = new Map<string, Set<SSEClient>>();

export function addClient(roomCode: string, client: SSEClient): void {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, new Set());
  }
  rooms.get(roomCode)!.add(client);
}

export function removeClient(roomCode: string, client: SSEClient): void {
  const clients = rooms.get(roomCode);
  if (clients) {
    clients.delete(client);
    if (clients.size === 0) {
      rooms.delete(roomCode);
    }
  }
}

export function broadcast(roomCode: string, event: string, data: unknown): void {
  const clients = rooms.get(roomCode);
  if (!clients) return;

  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();

  for (const client of clients) {
    try {
      client.controller.enqueue(encoder.encode(message));
    } catch {
      removeClient(roomCode, client);
    }
  }
}
