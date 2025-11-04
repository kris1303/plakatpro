import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/KanbanBoard";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      client: true,
      _count: {
        select: {
          permits: true,
          routes: true,
          photos: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(
      (c) => new Date(c.startDate) <= new Date() && new Date(c.endDate) >= new Date()
    ).length,
    totalPermits: campaigns.reduce((sum, c) => sum + c._count.permits, 0),
    totalPhotos: campaigns.reduce((sum, c) => sum + c._count.photos, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[2000px] mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            📊 PlakatPro Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            Kampagnenübersicht & Workflow-Management
          </p>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="text-sm text-gray-500 mb-1">Kampagnen gesamt</div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.totalCampaigns}
            </div>
          </div>
          
          <div className="card">
            <div className="text-sm text-gray-500 mb-1">Aktive Kampagnen</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.activeCampaigns}
            </div>
          </div>
          
          <div className="card">
            <div className="text-sm text-gray-500 mb-1">Genehmigungen</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalPermits}
            </div>
          </div>
          
          <div className="card">
            <div className="text-sm text-gray-500 mb-1">Fotos gesamt</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.totalPhotos}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Link href="/campaigns/new" className="btn-primary">
            ➕ Neue Kampagne
          </Link>
          <Link href="/m/tours" className="btn-secondary">
            🚗 Touren verwalten
          </Link>
          <Link href="/permits" className="btn-secondary">
            📋 Genehmigungen
          </Link>
        </div>

        {/* Kanban Board */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Workflow Board
          </h2>
          <KanbanBoard campaigns={campaigns} />
        </div>
      </div>
    </div>
  );
}

