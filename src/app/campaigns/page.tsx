import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      client: true,
      _count: {
        select: {
          permits: true,
          routes: true,
          photos: true,
          tasks: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Kampagnen
            </h1>
            <p className="text-sm text-gray-600">
              Alle Plakat-Kampagnen in der Übersicht
            </p>
          </div>
          <Link href="/campaigns/new" className="btn-primary">
            ➕ Neue Kampagne
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const isActive = 
              new Date(campaign.startDate) <= new Date() && 
              new Date(campaign.endDate) >= new Date();

            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="card card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {campaign.eventName}
                </h3>
                  {isActive && (
                    <span className="badge badge-green">
                      Aktiv
                    </span>
                  )}
                </div>

                {campaign.eventAddress && (
                  <p className="text-sm text-gray-600 mb-4">
                    📍 {campaign.eventAddress}
                  </p>
                )}

                {campaign.client && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span className="text-gray-400">👤</span>
                    <span>{campaign.client.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span>📅 {formatDate(campaign.startDate)}</span>
                  <span>→</span>
                  <span>{formatDate(campaign.endDate)}</span>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <span className="badge badge-blue">
                      📋 {campaign._count.permits}
                    </span>
                    <span className="badge badge-green">
                      🚗 {campaign._count.routes}
                    </span>
                    <span className="badge badge-gray">
                      📸 {campaign._count.photos}
                    </span>
                  </div>
                  
                  {campaign._count.permits > 0 && (
                    <Link
                      href={`/campaigns/${campaign.id}/permits`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      → Genehmigungen verwalten
                    </Link>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4 opacity-30">🎯</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Noch keine Kampagnen
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Erstellen Sie Ihre erste Plakat-Kampagne
            </p>
            <Link href="/campaigns/new" className="btn-primary inline-flex">
              ➕ Erste Kampagne erstellen
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

