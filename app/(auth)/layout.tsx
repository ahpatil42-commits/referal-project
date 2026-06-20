export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-space" style={{ minHeight: "100vh" }}>
      {children}
    </div>
  );
}
