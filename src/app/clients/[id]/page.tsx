import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

type Categorized<T> = {
  active: T[];
  past: T[];
  archived: T[];
};

function categorizeByLifecycle<T extends { archivedAt: Date | null; endDate?: Date | null }>(
  items: T[],
  now: Date
): Categorized<T> {
  return items.reduce<Categorized<T>>(
    (acc, item) => {
      if (item.archivedAt) {
        acc.archived.push(item);
        return acc;
      }

      const endDate = item.endDate ?? null;
      if (endDate && endDate < now) {
        acc.past.push(item);
      } else {
        acc.active.push(item);
      }
      return acc;
    },
    { active: [], past: [], archived: [] }
  );
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const now = new Date();

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      campaigns: {
        include: {
          distributionList: true,
        },
        orderBy: { startDate: "desc" },
      },
      distributionLists: {
        include: {
          client: true,
          items: {
            include: {
              city: true,
            },
          },
          campaign: true,
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const categorizedCampaigns = categorizeByLifecycle(client.campaigns, now);
  const categorizedDistributionLists = categorizeByLifecycle(client.distributionLists, now);

  const renderCampaignCard = (campaign: typeof client.campaigns[number]) => {
    const isArchived = !!campaign.archivedAt;
    return (
      <div key={campaign.id} className="card border border-gray-200">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg flex-1">
            {campaign.eventName}
          </h3>
          <span className={`badge ${isArchived ? "badge-gray" : "badge-blue"}`}>
            {campaign.status}
          </span>
        </div>
        {campaign.eventAddress && (
          <p className="text-sm text-gray-600 mb-2">📍 {campaign.eventAddress}</p>
        )}
        <p className="text-xs text-gray-500 mb-2">
          📅 {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
        </p>
        {campaign.distributionList && (
          <p className="text-sm text-gray-600">
            Verknüpfte Verteilerliste:{" "}
            <Link
              href={`/distribution-lists/${campaign.distributionList.id}`}
              className="text-blue-600 hover:text-blue-700"
            >
              {campaign.distributionList.eventName}
            </Link>
          </p>
        )}
        {campaign.notes && (
          <p className="text-sm text-gray-600 border-t border-gray-100 mt-3 pt-3">
            {campaign.notes}
          </p>
        )}
        {isArchived && campaign.archivedAt && (
          <p className="text-xs text-gray-500 border-t border-gray-100 mt-3 pt-3">
            🗃️ Archiviert am {formatDate(campaign.archivedAt)}
          </p>
        )}
      </div>
    );
  };

  const renderDistributionListCard = (list: typeof client.distributionLists[number]) => {
    const statusConfig = {
      draft: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", label: "Entwurf" },
      sent: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "Versendet" },
      accepted: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Angenommen" },
      rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Abgelehnt" },
      revised: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Überarbeitet" },
    } as const;

    const config = statusConfig[list.status as keyof typeof statusConfig] ?? statusConfig.draft;
    const totalFees = list.items.reduce((sum, item) => sum + (item.fee || 0), 0);
    const quantityA1 = list.items.filter((i) => i.posterSize === "A1").reduce((sum, i) => sum + i.quantity, 0);
    const quantityA0 = list.items.filter((i) => i.posterSize === "A0").reduce((sum, i) => sum + i.quantity, 0);
    const isArchived = !!list.archivedAt;

    return (
      <Link key={list.id} href={`/distribution-lists/${list.id}`} className="card card-hover block border border-gray-200">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg flex-1">
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
          {isArchived && <span className="badge badge-gray">Archiviert</span>}
        </div>
        <p className="text-sm text-gray-600 mb-2">📍 {list.eventAddress}</p>
        <p className="text-xs text-gray-500 mb-2">
          📅 {formatDate(list.startDate)} – {formatDate(list.endDate)}
        </p>
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
        {isArchived && list.archivedAt && (
          <p className="text-xs text-gray-500 border-t border-gray-100 mt-3 pt-3">
            🗃️ Archiviert am {formatDate(list.archivedAt)}
          </p>
        )}
      </Link>
    );
  };

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {client.name}
            </h1>
            <p className="text-sm text-gray-600">
              Historie der Kampagnen und Verteilerlisten
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/distribution-lists/new?clientId=${client.id}`}
              className="btn-secondary"
            >
              ➕ Verteilerliste
            </Link>
            <Link
              href={`/campaigns/new?clientId=${client.id}`}
              className="btn-primary"
            >
              ➕ Kampagne
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex items-center gap-2 hover:text-blue-600">
              <span>📧</span>
              <span>{client.email}</span>
            </a>
          )}
          {client.phone && (
            <a href={`tel:${client.phone}`} className="flex items-center gap-2 hover:text-blue-600">
              <span>📞</span>
              <span>{client.phone}</span>
            </a>
          )}
          {client.address && (
            <span className="flex items-center gap-2">
              <span>📍</span>
              <span>{client.address}</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-8 space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Übersicht</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50 border-blue-200 text-center">
              <div className="text-sm text-blue-600 font-medium uppercase tracking-wide">
                Aktive Kampagnen
              </div>
              <div className="text-3xl font-bold text-blue-700 mt-2">
                {categorizedCampaigns.active.length}
              </div>
            </div>
            <div className="card bg-green-50 border-green-200 text-center">
              <div className="text-sm text-green-600 font-medium uppercase tracking-wide">
                Aktive Verteilerlisten
              </div>
              <div className="text-3xl font-bold text-green-700 mt-2">
                {categorizedDistributionLists.active.length}
              </div>
            </div>
            <div className="card bg-gray-50 border-gray-200 text-center">
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                Archivierte Projekte
              </div>
              <div className="text-3xl font-bold text-gray-800 mt-2">
                {categorizedCampaigns.archived.length + categorizedDistributionLists.archived.length}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              🎯 Kampagnen
            </h2>
          </div>

          <div className="space-y-6">
            {categorizedCampaigns.active.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Aktuell
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedCampaigns.active.map(renderCampaignCard)}
                </div>
              </div>
            )}

            {categorizedCampaigns.past.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Abgeschlossen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedCampaigns.past.map(renderCampaignCard)}
                </div>
              </div>
            )}

            {categorizedCampaigns.archived.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Archiv
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedCampaigns.archived.map(renderCampaignCard)}
                </div>
              </div>
            )}

            {categorizedCampaigns.active.length === 0 &&
              categorizedCampaigns.past.length === 0 &&
              categorizedCampaigns.archived.length === 0 && (
                <div className="card text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Noch keine Kampagnen
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Legen Sie eine neue Kampagne für diesen Kunden an.
                  </p>
                  <Link href={`/campaigns/new?clientId=${client.id}`} className="btn-primary inline-flex">
                    ➕ Kampagne erstellen
                  </Link>
                </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              🗂️ Verteilerlisten
            </h2>
          </div>

          <div className="space-y-6">
            {categorizedDistributionLists.active.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Aktuell
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorizedDistributionLists.active.map(renderDistributionListCard)}
                </div>
              </div>
            )}

            {categorizedDistributionLists.past.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Abgeschlossen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorizedDistributionLists.past.map(renderDistributionListCard)}
                </div>
              </div>
            )}

            {categorizedDistributionLists.archived.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Archiv
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorizedDistributionLists.archived.map(renderDistributionListCard)}
                </div>
              </div>
            )}

            {categorizedDistributionLists.active.length === 0 &&
              categorizedDistributionLists.past.length === 0 &&
              categorizedDistributionLists.archived.length === 0 && (
                <div className="card text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Noch keine Verteilerlisten
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Legen Sie eine neue Verteilerliste für diesen Kunden an.
                  </p>
                  <Link href={`/distribution-lists/new?clientId=${client.id}`} className="btn-secondary inline-flex">
                    ➕ Verteilerliste erstellen
                  </Link>
                </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}


