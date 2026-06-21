"use client";

import Pusher from "pusher-js";

const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy_key";
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

// Only instantiate Pusher on the browser (client-side) to prevent Next.js SSR crashes
export const pusherClient = 
  typeof window !== "undefined" 
    ? new Pusher(key, { cluster }) 
    : (null as any);
