let serverClockOffsetMs: number | null = null;

export function synchronizeServerClock(
  serverTimeMs: number,
  clientTimeMs = Date.now(),
): void {
  if (!Number.isFinite(serverTimeMs) || !Number.isFinite(clientTimeMs)) return;
  serverClockOffsetMs = clientTimeMs - serverTimeMs;
}

export function getClientReferenceTimeMs(
  serverTimeMs: number,
  receivedAt = Date.now(),
): number {
  if (serverClockOffsetMs === null) {
    synchronizeServerClock(serverTimeMs, receivedAt);
  }
  return serverTimeMs + (serverClockOffsetMs ?? 0);
}

export function getEstimatedServerTimeMs(clientTimeMs = Date.now()): number {
  return clientTimeMs - (serverClockOffsetMs ?? 0);
}
