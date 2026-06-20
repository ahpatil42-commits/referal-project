// This page is never actually rendered — middleware.ts
// will always redirect /dashboard → /dashboard/seeker or /dashboard/referrer
// based on the user's role.
export default function DashboardPage() {
  return null;
}
