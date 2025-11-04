import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main style={{ marginLeft: '256px' }} className="min-h-screen">
        {children}
      </main>
    </div>
  );
}

