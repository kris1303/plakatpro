import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface DistributionListsPageProps {
  searchParams?: { scope?: string; clientId?: string };
}

const SCOPE_OPTIONS = [
  { key: "active", label: "Aktiv" },
  { key: "past", label: "Abgeschlossen" },
  { key: "archived", label: "Archiv" },
  { key: "all", label: "Alle" },
];

export default async function DistributionListsPage({ searchParams }: DistributionListsPageProps) {
  const scope = searchParams?.scope ?? "active";
  const clientId = searchParams?.clientId;
  const now = new Date();

  const where: any = {};

  if (clientId) {
    where.clientId = clientId;
  }

  switch (scope) {
    case "past":
      where.archivedAt = null;
      where.endDate = { lt: now };
      break;
    case "archived":
      where.archivedAt = { not: null };
      break;
    case "all":
      break;
    case "active":
    default:
      where.archivedAt = null;
      where.endDate = { gte: now };
      break;
  }

  const distributionLists = await prisma.distributionList.findMany({
    where,
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Verteilerlisten
            </h1>
            <p className="text-sm text-gray-600">
              Angebote und Unterlagen je Kunde – nach Status & Zeitraum gefiltert
            </p>
          </div>
          <Link href="/distribution-lists/new" className="btn-primary">
            ➕ Neue Verteilerliste
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {SCOPE_OPTIONS.map((option) => {
            const isActive = scope === option.key;
            const query = new URLSearchParams();
            query.set("scope", option.key);
            if (clientId) {
              query.set("clientId", clientId);
            }

            return (
              <Link
                key={option.key}
                href={`/distribution-lists?${query.toString()}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
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
            } as const;

            const config = statusConfig[list.status as keyof typeof statusConfig] ?? statusConfig.draft;
            const totalFees = list.items.reduce((sum, item) => sum + (item.fee || 0), 0);
            const quantityA1 = list.items.filter((i: any) => i.posterSize === 'A1').reduce((sum: number, i: any) => sum + i.quantity, 0);
            const quantityA0 = list.items.filter((i: any) => i.posterSize === 'A0').reduce((sum: number, i: any) => sum + i.quantity, 0);
            const isArchived = !!list.archivedAt;

            return (
              <Link
                key={list.id}
                href={`/distribution-lists/${list.id}`}
                className="card card-hover block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
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
                      {isArchived && (
                        <span className="badge badge-gray">
                          Archiviert
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {list.eventAddress}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span>👤 {list.client.name}</span>
                      <span>·</span>
                      <span>📅 {formatDate(list.startDate)} - {formatDate(list.endDate)}</span>
                      {isArchived && list.archivedAt && (
                        <>
                          <span>·</span>
                          <span>🗃️ {formatDate(list.archivedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{list.items.length}</div>
                    <div className="text-xs text-gray-600">Kommunen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-blue-600">{quantityA1}</div>
                    <div className="text-xs text-gray-600">A1 Plakate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-blue-600">{quantityA0}</div>
                    <div className="text-xs text-gray-600">A0 Plakate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{totalFees.toFixed(2)} €</div>
                    <div className="text-xs text-gray-600">Gebühren</div>
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
              Keine Verteilerlisten in dieser Ansicht
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Passen Sie den Filter an oder erstellen Sie eine neue Verteilerliste.
            </p>
            <Link href="/distribution-lists/new" className="btn-primary inline-flex">
              ➕ Verteilerliste erstellen
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

