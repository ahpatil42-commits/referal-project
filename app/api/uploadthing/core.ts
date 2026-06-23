import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const f = createUploadthing();

// Reusable middleware to ensure only logged-in users can upload files
const authMiddleware = async () => {
  const session = await auth();
  if (!session?.user?.id) throw new UploadThingError("Unauthorized");
  return { userId: session.user.id };
};

export const ourFileRouter = {
  // 1. Resume Uploader (PDFs only, max 8MB)
  resumeUploader: f({ pdf: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[Uploadthing] Resume uploaded by:", metadata.userId);
      console.log("[Uploadthing] File URL:", file.url);
      
      try {
        await db.seekerProfile.update({
          where: { userId: metadata.userId },
          data: { resumeUrl: file.url }
        });
        console.log("[Uploadthing] Updated SeekerProfile with resumeUrl");
      } catch (err) {
        console.error("[Uploadthing] Failed to update SeekerProfile:", err);
      }
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // 2. Profile Picture Uploader (Images only, max 4MB)
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[Uploadthing] Image uploaded by:", metadata.userId);
      console.log("[Uploadthing] File URL:", file.url);

      try {
        await db.user.update({
          where: { id: metadata.userId },
          data: { image: file.url }
        });
        console.log("[Uploadthing] Updated User with image URL");
      } catch (err) {
        console.error("[Uploadthing] Failed to update User image:", err);
      }

      return { uploadedBy: metadata.userId, url: file.url };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
