import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function DistributionListsPage() {
  const distributionLists = await prisma.distributionList.findMany({
    include: {
      client: true,
      items: {
        include: {
          city: true,
        },
      },
      campaign: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: distributionLists.length,
    draft: distributionLists.filter((d) => d.status === "draft").length,
    sent: distributionLists.filter((d) => d.status === "sent").length,
    accepted: distributionLists.filter((d) => d.status === "accepted").length,
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Verteilerlisten
            </h1>
            <p className="text-sm text-gray-600">
              Angebote für Kunden - vor der Kampagnen-Erstellung
            </p>
          </div>
          <Link href="/distribution-lists/new" className="btn-primary">
            ➕ Neue Verteilerliste
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-xs font-medium text-gray-600">Gesamt</div>
          </div>
          
          <div className="card text-center bg-gray-50">
            <div className="text-2xl font-bold text-gray-600 mb-1">{stats.draft}</div>
            <div className="text-xs font-medium text-gray-600">Entwurf</div>
          </div>
          
          <div className="card text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.sent}</div>
            <div className="text-xs font-medium text-blue-700">Versendet</div>
          </div>
          
          <div className="card text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.accepted}</div>
            <div className="text-xs font-medium text-green-700">Angenommen</div>
          </div>
        </div>

        {/* Distribution Lists */}
        <div className="space-y-4">
          {distributionLists.map((list) => {
            const statusConfig = {
              draft: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", label: "Entwurf" },
              sent: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "Versendet" },
              accepted: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Angenommen" },
              rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Abgelehnt" },
              revised: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Überarbeitet" },
            };

            const config = statusConfig[list.status];
            const totalFees = list.items.reduce((sum, item) => sum + (item.fee || 0), 0);
            const totalQuantity = list.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <Link
                key={list.id}
                href={`/distribution-lists/${list.id}`}
                className="card card-hover block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {list.eventName}
                      </h3>
                      <span className={`badge ${config.bg} ${config.text} ${config.border} border`}>
                        {config.label}
                      </span>
                      {list.campaign && (
                        <span className="badge badge-green">
                          → Kampagne erstellt
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {list.eventAddress}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>👤 {list.client.name}</span>
                      <span>·</span>
                      <span>📅 {formatDate(list.startDate)} - {formatDate(list.endDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{list.items.length}</div>
                    <div className="text-xs text-gray-600">Kommunen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{totalQuantity}</div>
                    <div className="text-xs text-gray-600">Plakate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{totalFees.toFixed(2)} €</div>
                    <div className="text-xs text-gray-600">Gesamt-Gebühren</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {distributionLists.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4 opacity-30">📄</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Noch keine Verteilerlisten
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Erstellen Sie eine Verteilerliste als Angebot für Ihren Kunden
            </p>
            <Link href="/distribution-lists/new" className="btn-primary inline-flex">
              ➕ Erste Verteilerliste erstellen
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

