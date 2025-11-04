import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="px-8 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-white text-4xl font-bold">P</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            PlakatPro
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Professionelles Kampagnenmanagement für Plakatkampagnen
          </p>
        
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link 
              href="/dashboard" 
              className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2"
            >
              <span>📊</span>
              <span>Zum Dashboard</span>
            </Link>
            <Link 
              href="/m/tours" 
              className="btn-secondary text-base px-8 py-3 inline-flex items-center gap-2"
            >
              <span>📱</span>
              <span>Mobile App</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Alles für Ihre Plakatkampagnen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Kanban Dashboard
              </h3>
              <p className="text-gray-600 text-sm">
                Workflow-Management im MeisterTask-Stil mit 10 Status-Spalten
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Mobile Plakatierer-App
              </h3>
              <p className="text-gray-600 text-sm">
                PWA für Touren mit GPS-Fotos und Google Navigation (bis 100 Stopps)
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗺️</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Google Integration
              </h3>
              <p className="text-gray-600 text-sm">
                Maps Distance Matrix, Navigation und Photos Upload
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Setup erfolgreich!
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-2xl text-blue-600 mb-1">13</div>
                  <div className="text-gray-600">Tabellen</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-green-600 mb-1">19</div>
                  <div className="text-gray-600">API-Routen</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-purple-600 mb-1">10</div>
                  <div className="text-gray-600">Workflow-Stufen</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-orange-600 mb-1">100</div>
                  <div className="text-gray-600">Max. Stopps</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

