import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function PermitsPage() {
  const permits = await prisma.permit.findMany({
    include: {
      campaign: true,
      city: true,
    },
    orderBy: { requestedAt: "desc" },
  });

  const stats = {
    total: permits.length,
    requested: permits.filter((p) => p.status === "requested").length,
    approved: permits.filter((p) => p.status === "approved" || p.status === "approved_with_conditions").length,
    rejected: permits.filter((p) => p.status === "rejected").length,
    pending: permits.filter((p) => p.status === "info_needed").length,
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Genehmigungen
            </h1>
            <p className="text-sm text-gray-600">
              Übersicht aller Plakat-Genehmigungen bei Kommunen
            </p>
          </div>
          <Link href="/permits/new" className="btn-primary">
            ➕ Genehmigung beantragen
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-xs font-medium text-gray-600">Gesamt</div>
          </div>
          
          <div className="card text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.requested}</div>
            <div className="text-xs font-medium text-blue-700">Beantragt</div>
          </div>
          
          <div className="card text-center bg-amber-50 border-amber-200">
            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.pending}</div>
            <div className="text-xs font-medium text-amber-700">Info nötig</div>
          </div>
          
          <div className="card text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.approved}</div>
            <div className="text-xs font-medium text-green-700">Genehmigt</div>
          </div>
          
          <div className="card text-center bg-red-50 border-red-200">
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
            <div className="text-xs font-medium text-red-700">Abgelehnt</div>
          </div>
        </div>

        {/* Permits Liste */}
        <div className="space-y-4">
          {permits.map((permit) => {
            const statusConfig = {
              draft: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", label: "Entwurf" },
              sent: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "Versendet" },
              requested: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "Beantragt" },
              info_needed: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Info nötig" },
              approved: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Genehmigt" },
              approved_with_conditions: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Genehmigt (mit Auflagen)" },
              rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Abgelehnt" },
            };

            const config = statusConfig[permit.status as keyof typeof statusConfig];

            return (
              <div key={permit.id} className="card card-hover transition-all">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {permit.city.name}
                      </h3>
                      <span className={`badge ${config.bg} ${config.text} ${config.border} border`}>
                        {config.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {permit.campaign.eventName}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">📅</span>
                        Beantragt: {formatDate(permit.requestedAt)}
                      </span>
                      {permit.decidedAt && (
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">✓</span>
                          Entschieden: {formatDate(permit.decidedAt)}
                        </span>
                      )}
                      {permit.fee && (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <span className="text-gray-400">💰</span>
                          {permit.fee.toFixed(2)} €
                        </span>
                      )}
                    </div>

                    {permit.notes && (
                      <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {permit.notes}
                      </p>
                    )}
                  </div>

                  {permit.city.email && (
                    <a
                      href={`mailto:${permit.city.email}`}
                      className="btn-secondary flex-shrink-0"
                    >
                      📧 E-Mail
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {permits.length === 0 && (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4 opacity-30">📭</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Keine Genehmigungen vorhanden
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Erstellen Sie eine Kampagne und beantragen Sie Genehmigungen bei den Kommunen
              </p>
              <Link href="/permits/new" className="btn-primary inline-flex">
                ➕ Erste Genehmigung beantragen
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

