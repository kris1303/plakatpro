import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface CampaignsPageProps {
  searchParams?: { scope?: string; clientId?: string };
}

const SCOPE_OPTIONS = [
  { key: "active", label: "Aktiv" },
  { key: "past", label: "Abgeschlossen" },
  { key: "archived", label: "Archiv" },
  { key: "all", label: "Alle" },
];

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
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

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      client: true,
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Kampagnen
            </h1>
            <p className="text-sm text-gray-600">
              Aktive, abgeschlossene und archivierte Kampagnen pro Kunde
            </p>
          </div>
          <Link href="/campaigns/new" className="btn-primary">
            ➕ Neue Kampagne
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
                href={`/campaigns?${query.toString()}`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const isArchived = !!campaign.archivedAt;

            return (
              <div key={campaign.id} className="card card-hover border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg flex-1">
                    {campaign.eventName}
                  </h3>
                  <span className={`badge ${isArchived ? "badge-gray" : "badge-blue"}`}>
                    {campaign.status}
                  </span>
                </div>

                {campaign.client && (
                  <p className="text-sm text-gray-600 mb-2">
                    👤 {campaign.client.name}
                  </p>
                )}

                {campaign.eventAddress && (
                  <p className="text-sm text-gray-600 mb-3">
                    📍 {campaign.eventAddress}
                  </p>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  📅 {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
                </div>

                {isArchived && (
                  <div className="text-xs text-gray-500 mb-4">
                    🗃️ Archiviert am {formatDate(campaign.archivedAt!)}
                  </div>
                )}

                {campaign.notes && (
                  <p className="text-sm text-gray-600 border-t border-gray-100 pt-3 mt-3">
                    {campaign.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4 opacity-30">🎯</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Keine Kampagnen in dieser Ansicht
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Passen Sie den Filter an oder legen Sie eine neue Kampagne an.
            </p>
            <Link href="/campaigns/new" className="btn-primary">
              ➕ Kampagne erstellen
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

