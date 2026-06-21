import PusherServer from "pusher";

// Create a dummy pusher instance if env vars are missing so build doesn't crash
const appId = process.env.PUSHER_APP_ID || "dummy_app_id";
const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy_key";
const secret = process.env.PUSHER_SECRET || "dummy_secret";
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

export const pusherServer = new PusherServer({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
});
