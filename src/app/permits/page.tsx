import { prisma } from "@/lib/prisma";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Zurück zum Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            📋 Genehmigungen
          </h1>
          <p className="text-gray-600 text-sm">
            Übersicht aller Plakat-Genehmigungen
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-500">Gesamt</div>
          </div>
          
          <div className="card text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.requested}</div>
            <div className="text-sm text-gray-600">Beantragt</div>
          </div>
          
          <div className="card text-center bg-amber-50 border-amber-200">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Info nötig</div>
          </div>
          
          <div className="card text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Genehmigt</div>
          </div>
          
          <div className="card text-center bg-red-50 border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Abgelehnt</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Link href="/permits/new" className="btn-primary">
            ➕ Neue Genehmigung beantragen
          </Link>
          <button className="btn-secondary">
            📧 E-Mails nachhaken
          </button>
        </div>

        {/* Permits Liste */}
        <div className="space-y-3">
          {permits.map((permit) => {
            const statusConfig = {
              requested: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "Beantragt" },
              info_needed: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Info nötig" },
              approved: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Genehmigt" },
              approved_with_conditions: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Genehmigt (mit Auflagen)" },
              rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Abgelehnt" },
            };

            const config = statusConfig[permit.status];

            return (
              <div key={permit.id} className="card hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {permit.city.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}>
                        {config.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Kampagne: <span className="font-medium">{permit.campaign.eventName}</span>
                    </p>

                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>📅 Beantragt: {formatDate(permit.requestedAt)}</span>
                      {permit.decidedAt && (
                        <span>✓ Entschieden: {formatDate(permit.decidedAt)}</span>
                      )}
                      {permit.fee && (
                        <span>💰 Gebühr: {permit.fee.toFixed(2)} €</span>
                      )}
                    </div>

                    {permit.notes && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                        📝 {permit.notes}
                      </p>
                    )}
                  </div>

                  {permit.city.email && (
                    <a
                      href={`mailto:${permit.city.email}`}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      📧 Kontakt
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {permits.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-lg mb-2">Keine Genehmigungen vorhanden</p>
              <p className="text-sm text-gray-500">
                Erstelle eine Kampagne und beantrage Genehmigungen bei den Kommunen
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

