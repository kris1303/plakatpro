import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: {
          campaigns: true,
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
              Kunden
            </h1>
            <p className="text-sm text-gray-600">
              Verwaltung aller Kunden und Auftraggeber
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="card card-hover">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                {client.name}
              </h3>

              <div className="space-y-2 text-sm mb-4">
                {client.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400">📧</span>
                    <a href={`mailto:${client.email}`} className="hover:text-blue-600">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400">📞</span>
                    <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <span className="text-gray-400">📍</span>
                    <span>{client.address}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <span className="badge badge-blue">
                  🎯 {client._count.campaigns} Kampagnen
                </span>
              </div>
            </div>
          ))}
        </div>

        {clients.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4 opacity-30">👥</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Noch keine Kunden angelegt
            </h3>
            <p className="text-sm text-gray-500">
              Legen Sie Kunden über Prisma Studio an
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

