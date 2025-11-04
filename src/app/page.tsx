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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Dashboard</h2>
            <p className="text-gray-600">Kanban-Board im MeisterTask-Stil</p>
          </div>
          
          <div className="card">
            <div className="text-4xl mb-3">📱</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Plakatierer-App</h2>
            <p className="text-gray-600">Mobile PWA für Touren mit GPS-Fotos</p>
          </div>
          
          <div className="card">
            <div className="text-4xl mb-3">🗺️</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Google Integration</h2>
            <p className="text-gray-600">Maps & Photos nahtlos integriert</p>
          </div>
        </div>

        <div className="flex gap-4 mb-16">
          <Link href="/dashboard" className="btn-primary text-lg">
            📊 Zum Dashboard
          </Link>
          <Link href="/m/tours" className="btn-secondary text-lg">
            📱 Mobile App öffnen
          </Link>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">✅ Setup abgeschlossen!</h2>
          <div className="space-y-3 text-gray-700">
            <p>✅ Datenbank erstellt und migriert</p>
            <p>✅ Vercel Deployment erfolgreich</p>
            <p>✅ 13 Datenbank-Tabellen angelegt</p>
            <p>✅ 16 API-Routen verfügbar</p>
            <p className="font-semibold text-blue-700 mt-4">🎉 Deine App ist bereit!</p>
          </div>
        </div>
      </div>
    </main>
  );
}

