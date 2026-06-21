"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Subscribe to a private channel unique to the user
    const channelName = `user-${session.user.id}`;
    const channel = pusherClient.subscribe(channelName);

    // Listen for new notifications
    channel.bind("new-notification", (data: { title: string; message: string; link?: string }) => {
      toast.success(data.title, {
        description: data.message,
        action: data.link ? {
          label: "View",
          onClick: () => router.push(data.link!)
        } : undefined,
      });
      // Optionally refresh the router to get latest data on the current page
      router.refresh();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [session, toast, router]);

  return <>{children}</>;
}
