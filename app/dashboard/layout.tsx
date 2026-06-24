import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { db } from "@/lib/db";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { TermsPopup } from "@/components/dashboard/terms-popup";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, emailVerified: true, termsAcceptedAt: true }
  });

  if (!user?.emailVerified) {
    redirect("/pending-verification");
  }

  return (
    <>
      {!user?.termsAcceptedAt && <TermsPopup />}
      <DashboardLayoutClient sidebar={<Sidebar role={session.user.role} email={session.user.email ?? ""} image={user?.image ?? null} />}>
        {children}
      </DashboardLayoutClient>
    </>
  );
}
