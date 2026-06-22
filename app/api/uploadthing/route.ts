import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

const getAppUrl = () => {
  if (process.env.UPLOADTHING_URL) return process.env.UPLOADTHING_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "https://referal-project.vercel.app";
};

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
    callbackUrl: `${getAppUrl()}/api/uploadthing`,
  },
});
