import PusherClient from "pusher-js";

const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy_key";
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

export const pusherClient = new PusherClient(key, {
  cluster,
});
