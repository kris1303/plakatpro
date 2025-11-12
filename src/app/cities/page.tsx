import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CitiesPage() {
  const cities = await prisma.city.findMany({
    include: {
      _count: {
        select: {
          permits: true,
          routeStops: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Kommunen
            </h1>
            <p className="text-sm text-gray-600">
              Verwaltung aller Kommunen und deren Genehmigungsrichtlinien
            </p>
          </div>
          <Link href="/cities/new" className="btn-primary">
            ➕ Neue Kommune
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Cities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div key={city.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {city.name}
                </h3>
                <div className="flex items-center gap-2">
                  {city.postalCode && (
                    <span className="badge badge-gray text-xs">{city.postalCode}</span>
                  )}
                  <Link 
                    href={`/cities/${city.id}/edit`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ✏️
                  </Link>
                </div>
              </div>

              {city.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="text-gray-400">📧</span>
                  <a href={`mailto:${city.email}`} className="hover:text-blue-600">
                    {city.email}
                  </a>
                </div>
              )}

              {(city.requiresPosterImage || city.requiresPermitForm) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {city.requiresPosterImage && (
                    <span className="badge badge-blue text-xs">🖼️ Plakatmotiv erforderlich</span>
                  )}
                  {city.requiresPermitForm && (
                    <span className="badge badge-gray text-xs">📄 Formular erforderlich</span>
                  )}
                </div>
              )}

              <div className="space-y-2 text-sm mb-4">
                {city.feeModel && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gebührenmodell:</span>
                    <span className="font-medium text-gray-900">{city.feeModel}</span>
                  </div>
                )}
                {city.fee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gebühr:</span>
                    <span className="font-medium text-gray-900">{city.fee.toFixed(2)} €</span>
                  </div>
                )}
                {city.maxQty && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max. Anzahl:</span>
                    <span className="font-medium text-gray-900">{city.maxQty}</span>
                  </div>
                )}
                {city.maxSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max. Größe:</span>
                    <span className="font-medium text-gray-900">{city.maxSize}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <span className="badge badge-blue">
                  📋 {city._count.permits} Genehmigungen
                </span>
                <span className="badge badge-gray">
                  📍 {city._count.routeStops} Stopps
                </span>
              </div>
            </div>
          ))}
        </div>

        {cities.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4 opacity-30">🏛️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Noch keine Kommunen angelegt
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Legen Sie Kommunen über Prisma Studio an
            </p>
            <button className="btn-primary inline-flex">
              📊 Prisma Studio öffnen
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

