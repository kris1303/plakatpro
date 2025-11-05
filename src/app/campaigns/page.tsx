import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  // Ganz simple Query - nur die Kampagnen, sonst nichts
  const campaigns = await prisma.campaign.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <AppLayout>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="card">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                {campaign.eventName}
              </h3>

              {campaign.eventAddress && (
                <p className="text-sm text-gray-600 mb-3">
                  📍 {campaign.eventAddress}
                </p>
              )}

              <div className="text-xs text-gray-500 mb-4">
                📅 {new Date(campaign.startDate).toLocaleDateString('de-DE')} - {new Date(campaign.endDate).toLocaleDateString('de-DE')}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <span className="badge badge-blue">
                  {campaign.status}
                </span>
              </div>
            </div>
          ))}
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
            <Link href="/campaigns/new" className="btn-primary">
              ➕ Erste Kampagne erstellen
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

