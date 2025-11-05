"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { formatDate } from "@/lib/utils";

type DistributionList = {
  id: string;
  eventName: string;
  eventAddress: string;
  eventDate: string | null;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
  client: {
    id: string;
    name: string;
    email: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    posterSize: string;
    distanceKm: number | null;
    fee: number | null;
    city: {
      id: string;
      name: string;
      postalCode: string | null;
    };
  }>;
  campaign: {
    id: string;
    eventName: string;
  } | null;
  sentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
};

export default function DistributionListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [distributionList, setDistributionList] = useState<DistributionList | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDistributionList();
  }, [id]);

  const fetchDistributionList = async () => {
    try {
      const res = await fetch(`/api/distribution-lists/${id}`);
      const data = await res.json();
      setDistributionList(data);
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Status wirklich auf "${newStatus}" ändern?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/distribution-lists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Fehler beim Aktualisieren");

      await fetchDistributionList();
      alert("Status erfolgreich aktualisiert!");
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Aktualisieren des Status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToCampaign = async () => {
    if (!confirm("Diese Verteilerliste in eine Kampagne umwandeln?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/distribution-lists/${id}/convert`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Fehler beim Umwandeln");

      const data = await res.json();
      router.push(`/campaigns/${data.campaignId}`);
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Umwandeln in Kampagne");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/distribution-lists/${id}/pdf`);
      if (!res.ok) throw new Error("Fehler beim PDF-Export");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Verteilerliste_${distributionList?.eventName}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim PDF-Export");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-center">Laden...</div>
      </AppLayout>
    );
  }

  if (!distributionList) {
    return (
      <AppLayout>
        <div className="p-8 text-center">Verteilerliste nicht gefunden</div>
      </AppLayout>
    );
  }

  const statusConfig = {
    draft: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", label: "Entwurf" },
    sent: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "Versendet" },
    accepted: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Angenommen" },
    rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Abgelehnt" },
    revised: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Überarbeitet" },
  };

  const config = statusConfig[distributionList.status as keyof typeof statusConfig];
  const totalQuantity = distributionList.items.reduce((sum, item) => sum + item.quantity, 0);
  const quantityA1 = distributionList.items.filter(i => i.posterSize === 'A1').reduce((sum, i) => sum + i.quantity, 0);
  const quantityA0 = distributionList.items.filter(i => i.posterSize === 'A0').reduce((sum, i) => sum + i.quantity, 0);
  
  // Preise
  const PRICE_A1 = 3.00;
  const PRICE_A0 = 6.00;
  const PRICE_PER_APPLICATION = 5.00;
  const VAT_RATE = 0.19;
  
  // Kostenberechnung
  const costA1 = quantityA1 * PRICE_A1;
  const costA0 = quantityA0 * PRICE_A0;
  const costApplications = distributionList.items.length * PRICE_PER_APPLICATION;
  const costCityFees = distributionList.items.reduce((sum, item) => sum + (item.fee || 0), 0);
  const subtotal = costA1 + costA0 + costApplications + costCityFees;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {distributionList.eventName}
              </h1>
              <span className={`badge ${config.bg} ${config.text} ${config.border} border`}>
                {config.label}
              </span>
              {distributionList.campaign && (
                <span className="badge badge-green">
                  ✓ Kampagne erstellt
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              📍 {distributionList.eventAddress}
            </p>
            <p className="text-sm text-gray-600">
              👤 {distributionList.client.name}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/distribution-lists/${id}/edit`)}
              disabled={distributionList.status === "accepted" || !!distributionList.campaign}
              className="btn-secondary"
            >
              ✏️ Bearbeiten
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={actionLoading}
              className="btn-secondary"
            >
              📄 PDF Download
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-6xl">
        {/* Info Card */}
        <div className="card mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Kampagnenzeitraum</div>
              <div className="text-sm text-gray-900">
                {formatDate(distributionList.startDate)} - {formatDate(distributionList.endDate)}
              </div>
            </div>
            
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Event-Datum</div>
              <div className="text-sm text-gray-900">
                {distributionList.eventDate ? formatDate(distributionList.eventDate) : "Nicht gesetzt"}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Erstellt am</div>
              <div className="text-sm text-gray-900">{formatDate(distributionList.createdAt)}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Kunde</div>
              <div className="text-sm text-gray-900">{distributionList.client.name}</div>
              {distributionList.client.email && (
                <div className="text-xs text-gray-500">{distributionList.client.email}</div>
              )}
            </div>
          </div>

          {distributionList.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-2">Notizen</div>
              <div className="text-sm text-gray-700">{distributionList.notes}</div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center bg-gray-50">
            <div className="text-2xl font-bold text-gray-900 mb-1">{distributionList.items.length}</div>
            <div className="text-xs font-medium text-gray-600">Kommunen</div>
          </div>
          
          <div className="card text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">{quantityA1}</div>
            <div className="text-xs font-medium text-blue-700">Plakate A1</div>
          </div>

          <div className="card text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">{quantityA0}</div>
            <div className="text-xs font-medium text-blue-700">Plakate A0</div>
          </div>

          <div className="card text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{total.toFixed(2)} €</div>
            <div className="text-xs font-medium text-green-700">Gesamtpreis (Brutto)</div>
          </div>
        </div>

        {/* Table */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Kommunen-Übersicht
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PLZ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Stadt</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Entfernung (km)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Anzahl Plakate</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Größe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Gebühr (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {distributionList.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{item.city.postalCode || "-"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.city.name}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {item.distanceKm?.toFixed(1) || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{item.posterSize}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {item.fee?.toFixed(2) || "0.00"} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Gesamt ({distributionList.items.length} Kommunen)
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    {totalQuantity}
                  </td>
                  <td></td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {totalFees.toFixed(2)} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Kostenübersicht */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            💰 Kostenübersicht
          </h2>

          <div className="space-y-3">
            {/* Plakat-Kosten A1 */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{quantityA1}x A1 Plakate</span>
                <span className="text-gray-500 ml-2">à {PRICE_A1.toFixed(2)} €</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {costA1.toFixed(2)} €
              </div>
            </div>

            {/* Plakat-Kosten A0 */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{quantityA0}x A0 Plakate</span>
                <span className="text-gray-500 ml-2">à {PRICE_A0.toFixed(2)} €</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {costA0.toFixed(2)} €
              </div>
            </div>

            {/* Antragsgebühren */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{distributionList.items.length}x Anträge bei Kommunen</span>
                <span className="text-gray-500 ml-2">à {PRICE_PER_APPLICATION.toFixed(2)} €</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {costApplications.toFixed(2)} €
              </div>
            </div>

            {/* Kommunen-Gebühren */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Gebühren der Kommunen</span>
                <span className="text-gray-500 ml-2">({distributionList.items.length} Kommunen)</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {costCityFees.toFixed(2)} €
              </div>
            </div>

            {/* Zwischensumme */}
            <div className="flex justify-between items-center py-3 bg-gray-50 -mx-4 px-4">
              <div className="text-sm font-semibold text-gray-700">
                Zwischensumme (Netto)
              </div>
              <div className="text-base font-bold text-gray-900">
                {subtotal.toFixed(2)} €
              </div>
            </div>

            {/* MwSt */}
            <div className="flex justify-between items-center py-2">
              <div className="text-sm text-gray-700">
                MwSt. (19%)
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {vat.toFixed(2)} €
              </div>
            </div>

            {/* Gesamtsumme */}
            <div className="flex justify-between items-center py-4 bg-green-50 border-t-2 border-green-200 -mx-4 px-4">
              <div className="text-lg font-bold text-gray-900">
                Gesamtsumme (Brutto)
              </div>
              <div className="text-2xl font-bold text-green-600">
                {total.toFixed(2)} €
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktionen</h2>

          <div className="space-y-3">
            {/* Entwurf -> Versendet */}
            {distributionList.status === "draft" && (
              <button
                onClick={() => handleStatusChange("sent")}
                disabled={actionLoading}
                className="btn-primary w-full"
              >
                📧 An Kunde versenden (Status: Versendet)
              </button>
            )}

            {/* Versendet -> Angenommen/Abgelehnt */}
            {distributionList.status === "sent" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange("accepted")}
                  disabled={actionLoading}
                  className="btn-success flex-1"
                >
                  ✓ Vom Kunden angenommen
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  disabled={actionLoading}
                  className="btn-danger flex-1"
                >
                  ✗ Vom Kunden abgelehnt
                </button>
              </div>
            )}

            {/* Angenommen -> In Kampagne umwandeln */}
            {distributionList.status === "accepted" && !distributionList.campaign && (
              <button
                onClick={handleConvertToCampaign}
                disabled={actionLoading}
                className="btn-success w-full"
              >
                🚀 In Kampagne umwandeln
              </button>
            )}

            {/* Kampagne wurde erstellt */}
            {distributionList.campaign && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-700 font-medium mb-2">
                  ✓ Kampagne wurde erfolgreich erstellt
                </div>
                <button
                  onClick={() => router.push(`/campaigns/${distributionList.campaign!.id}`)}
                  className="btn-primary"
                >
                  Zur Kampagne
                </button>
              </div>
            )}

            {/* Abgelehnt -> Zurück zu Entwurf */}
            {distributionList.status === "rejected" && (
              <button
                onClick={() => handleStatusChange("draft")}
                disabled={actionLoading}
                className="btn-secondary w-full"
              >
                ↩️ Zurück zu Entwurf (zum Überarbeiten)
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

