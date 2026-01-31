export default function ValorarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900" style={{ minHeight: '100dvh' }}>
      {children}
    </div>
  );
}
