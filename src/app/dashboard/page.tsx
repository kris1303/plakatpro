import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/KanbanBoard";
import AppLayout from "@/components/AppLayout";
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
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Übersicht aller Kampagnen und Workflows
            </p>
          </div>
          <Link href="/campaigns/new" className="btn-primary">
            ➕ Neue Kampagne
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Kampagnen gesamt
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalCampaigns}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Aktive Kampagnen
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeCampaigns}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Genehmigungen
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalPermits}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Fotos
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalPhotos}
                </p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Workflow Board
            </h2>
            <p className="text-sm text-gray-600">
              Ziehen Sie Kampagnen zwischen den Spalten, um den Status zu ändern
            </p>
          </div>
          <KanbanBoard campaigns={campaigns} />
        </div>
      </div>
    </AppLayout>
  );
}

