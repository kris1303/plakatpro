"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";

type Permit = {
  id: string;
  status: string;
  quantity: number;
  posterSize: string;
  fee: number;
  city: {
    id: string;
    name: string;
    postalCode: string | null;
    email: string | null;
  };
};

type Campaign = {
  id: string;
  eventName: string;
  eventAddress: string | null;
  startDate: string;
  endDate: string;
  client: {
    name: string;
  };
  permits: Permit[];
};

export default function CampaignPermitsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();
      setCampaign(data);
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAll = async () => {
    const draftPermits = campaign?.permits.filter((p) => p.status === "draft") || [];
    
    if (draftPermits.length === 0) {
      alert("Keine offenen Genehmigungen zum Beantragen");
      return;
    }

    if (!confirm(`${draftPermits.length} Genehmigungen jetzt beantragen?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/permits/submit-all`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Fehler beim Beantragen");

      alert(`${draftPermits.length} Genehmigungen erfolgreich beantragt!`);
      await fetchCampaign();
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Beantragen der Genehmigungen");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-center">Laden...</div>
      </AppLayout>
    );
  }

  if (!campaign) {
    return (
      <AppLayout>
        <div className="p-8 text-center">Kampagne nicht gefunden</div>
      </AppLayout>
    );
  }

  const draftPermits = campaign.permits.filter((p) => p.status === "draft");
  const sentPermits = campaign.permits.filter((p) => p.status === "sent");
  const approvedPermits = campaign.permits.filter((p) => p.status === "approved");

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Zurück
          </button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Genehmigungen für: {campaign.eventName}
            </h1>
            <p className="text-sm text-gray-600">
              📍 {campaign.eventAddress || "Keine Adresse"}
            </p>
            <p className="text-sm text-gray-600">
              👤 {campaign.client.name}
            </p>
          </div>

          {draftPermits.length > 0 && (
            <button
              onClick={handleSubmitAll}
              disabled={submitting}
              className="btn-success"
            >
              {submitting ? "Beantrage..." : `✓ Alle ${draftPermits.length} Genehmigungen beantragen`}
            </button>
          )}
        </div>
      </div>

      <div className="p-8 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center bg-gray-50">
            <div className="text-2xl font-bold text-gray-600 mb-1">{draftPermits.length}</div>
            <div className="text-xs font-medium text-gray-600">Entwurf</div>
          </div>
          
          <div className="card text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">{sentPermits.length}</div>
            <div className="text-xs font-medium text-blue-700">Beantragt</div>
          </div>
          
          <div className="card text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{approvedPermits.length}</div>
            <div className="text-xs font-medium text-green-700">Genehmigt</div>
          </div>
        </div>

        {/* Permits List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alle Genehmigungen ({campaign.permits.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PLZ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Kommune</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">E-Mail</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Anzahl</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Größe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Gebühr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaign.permits.map((permit) => {
                  const statusConfig = {
                    draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Entwurf" },
                    sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Beantragt" },
                    approved: { bg: "bg-green-100", text: "text-green-700", label: "Genehmigt" },
                    rejected: { bg: "bg-red-100", text: "text-red-700", label: "Abgelehnt" },
                  };

                  const config = statusConfig[permit.status as keyof typeof statusConfig] || statusConfig.draft;

                  return (
                    <tr key={permit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`badge ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{permit.city.postalCode || "-"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{permit.city.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{permit.city.email || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{permit.quantity}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{permit.posterSize}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{permit.fee.toFixed(2)} €</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {draftPermits.length === 0 && campaign.permits.length > 0 && (
          <div className="card bg-green-50 border-green-200 text-center mt-6">
            <div className="text-green-700 font-medium">
              ✓ Alle Genehmigungen wurden bereits beantragt
            </div>
          </div>
        )}

        {campaign.permits.length === 0 && (
          <div className="card text-center">
            <div className="text-5xl mb-4 opacity-30">📋</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Noch keine Genehmigungen
            </h3>
            <p className="text-sm text-gray-500">
              Diese Kampagne hat noch keine Genehmigungen
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

