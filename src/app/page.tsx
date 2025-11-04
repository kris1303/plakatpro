import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">
          🚀 PlakatPro
        </h1>
        <p className="text-xl mb-12 text-gray-600">
          Professionelles Kampagnenmanagement für Plakatkampagnen
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-2 text-brand-yellow">Dashboard</h2>
            <p className="text-gray-300">Kanban-Board für Kampagnenübersicht</p>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-bold mb-2 text-brand-yellow">Plakatierer-App</h2>
            <p className="text-gray-300">Mobile PWA für Touren und GPS-Fotos</p>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-bold mb-2 text-brand-yellow">Google Integration</h2>
            <p className="text-gray-300">Maps & Photos nahtlos integriert</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/dashboard" className="btn-primary">
            Zum Dashboard
          </Link>
          <Link href="/m/tours" className="btn-secondary">
            Mobile App öffnen
          </Link>
        </div>

        <div className="mt-12 card">
          <h2 className="text-2xl font-bold mb-4 text-brand-yellow">⚙️ Setup erforderlich</h2>
          <div className="space-y-3 text-gray-300">
            <p>✅ 1. <code className="bg-zinc-800 px-2 py-1 rounded">.env</code> Datei erstellen (siehe <code className="bg-zinc-800 px-2 py-1 rounded">.env.example</code>)</p>
            <p>✅ 2. Neon PostgreSQL Datenbank erstellen und DATABASE_URL eintragen</p>
            <p>✅ 3. <code className="bg-zinc-800 px-2 py-1 rounded">pnpm prisma:generate</code> ausführen</p>
            <p>✅ 4. <code className="bg-zinc-800 px-2 py-1 rounded">pnpm prisma:migrate</code> ausführen</p>
            <p>✅ 5. Google Cloud APIs aktivieren und Keys eintragen</p>
          </div>
        </div>
      </div>
    </main>
  );
}

