type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const rooms = new Map<string, Set<SSEClient>>();
const deadlineTimers = new Map<string, NodeJS.Timeout>();

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

export function scheduleRoomFinish(roomCode: string, deadlineUtc: Date, finishFn: () => Promise<void>): void {
  // Clear any existing timer for this room
  clearRoomTimer(roomCode);

  const now = Date.now();
  const deadlineMs = new Date(deadlineUtc).getTime();
  const delay = deadlineMs - now;

  if (delay <= 0) {
    // Deadline already passed, finish immediately
    finishFn().catch(console.error);
    return;
  }

  const timer = setTimeout(() => {
    deadlineTimers.delete(roomCode);
    finishFn().catch(console.error);
  }, delay);

  deadlineTimers.set(roomCode, timer);
}

export function clearRoomTimer(roomCode: string): void {
  const existing = deadlineTimers.get(roomCode);
  if (existing) {
    clearTimeout(existing);
    deadlineTimers.delete(roomCode);
  }
}
