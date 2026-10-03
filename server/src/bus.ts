// Server-Sent Events fan-out, one channel per merchant.
import type { Response } from "express";

const channels = new Map<number, Set<Response>>();
const listeners = new Set<(mid: number, count: number) => void>();

export function subscribe(mid: number, res: Response) {
  let set = channels.get(mid);
  if (!set) channels.set(mid, (set = new Set()));
  set.add(res);
  listeners.forEach(l => l(mid, set!.size));
}
export function unsubscribe(mid: number, res: Response) {
  const set = channels.get(mid);
  if (!set) return;
  set.delete(res);
  listeners.forEach(l => l(mid, set.size));
}
export const subscriberCount = (mid: number) => channels.get(mid)?.size ?? 0;
export const onSubscribersChange = (fn: (mid: number, count: number) => void) => listeners.add(fn);

export function send(res: Response, msg: unknown) {
  res.write(`data: ${JSON.stringify(msg)}\n\n`);
}
export function publish(mid: number, msg: unknown) {
  const set = channels.get(mid);
  if (!set) return;
  const line = `data: ${JSON.stringify(msg)}\n\n`;
  for (const res of set) res.write(line);
}

// keep proxies from closing idle streams
setInterval(() => { for (const set of channels.values()) for (const res of set) res.write(": ping\n\n"); }, 20_000).unref();
