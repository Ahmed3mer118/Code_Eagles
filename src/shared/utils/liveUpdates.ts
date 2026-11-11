// src/shared/utils/liveUpdates.ts
const CHANNEL_NAME = 'ce-live-updates';

type MessageType =
  | 'site-content-updated'
  | 'faqs-updated'
  | 'testimonials-updated'
  | 'emergency-updated'
  | 'plans-updated'
  | 'academies-updated';

interface LiveMessage {
  type: MessageType;
  key?: string;
  id?: string;
  at: number;
}

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function broadcastUpdate(
  type: MessageType,
  extra?: { key?: string; id?: string },
) {
  const ch = getChannel();
  if (!ch) return;
  const msg: LiveMessage = { type, at: Date.now(), ...extra };
  ch.postMessage(msg);
}

export function onLiveUpdate(handler: (msg: LiveMessage) => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};

  const listener = (e: MessageEvent<LiveMessage>) => {
    if (e.data && typeof e.data.type === 'string') {
      handler(e.data);
    }
  };
  ch.addEventListener('message', listener);

  return () => {
    ch.removeEventListener('message', listener);
  };
}

export type { LiveMessage, MessageType };
