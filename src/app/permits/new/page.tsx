"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

interface Campaign {
  id: string;
  eventName: string;
  title: string;
}

interface City {
  id: string;
  name: string;
  feeModel: string | null;
  fee: number | null;
  maxQty: number | null;
  maxSize: string | null;
}

export default function NewPermitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [formData, setFormData] = useState({
    campaignId: "",
    cityId: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Kampagnen laden
      const campaignsRes = await fetch("/api/campaigns");
      const campaignsData = await campaignsRes.json();
      setCampaigns(campaignsData);

      // Kommunen laden
      const citiesRes = await fetch("/api/cities");
      const citiesData = await citiesRes.json();
      setCities(citiesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.campaignId || !formData.cityId) {
      alert("Bitte wähle eine Kampagne und eine Kommune aus");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/permits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der Genehmigung");
      }

      router.push("/permits");
    } catch (error) {
      console.error("Error:", error);
      alert("Fehler beim Erstellen der Genehmigung");
    } finally {
      setLoading(false);
    }
  };

  const selectedCity = cities.find((c) => c.id === formData.cityId);

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Genehmigung beantragen
        </h1>
        <p className="text-sm text-gray-600">
          Beantragen Sie eine Plakat-Genehmigung bei einer Kommune
        </p>
      </div>

      {/* Form */}
      <div className="p-8">
        <div className="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kampagne auswählen */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Kampagne auswählen *
            </h2>

            <select
              value={formData.campaignId}
              onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
              required
              className="input w-full"
            >
              <option value="">-- Bitte wählen --</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.eventName} - {campaign.title}
                </option>
              ))}
            </select>

            {campaigns.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Keine Kampagnen vorhanden. Erstelle zuerst eine Kampagne!
              </p>
            )}
          </div>

          {/* Kommune auswählen */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Kommune auswählen *
            </h2>

            <select
              value={formData.cityId}
              onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
              required
              className="input w-full"
            >
              <option value="">-- Bitte wählen --</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                  {city.fee && ` - ${city.fee.toFixed(2)} € (${city.feeModel})`}
                </option>
              ))}
            </select>

            {cities.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Keine Kommunen angelegt. Erstelle zuerst Kommunen über Prisma Studio!
              </p>
            )}

            {/* Stadt-Infos anzeigen */}
            {selectedCity && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  📍 {selectedCity.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  {selectedCity.feeModel && (
                    <p>💰 Gebührenmodell: <span className="font-medium">{selectedCity.feeModel}</span></p>
                  )}
                  {selectedCity.fee && (
                    <p>💵 Gebühr: <span className="font-medium">{selectedCity.fee.toFixed(2)} €</span></p>
                  )}
                  {selectedCity.maxQty && (
                    <p>🔢 Max. Anzahl: <span className="font-medium">{selectedCity.maxQty} Plakate</span></p>
                  )}
                  {selectedCity.maxSize && (
                    <p>📐 Max. Größe: <span className="font-medium">{selectedCity.maxSize}</span></p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notizen */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Notizen / Besonderheiten
            </h2>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="z.B. Spezielle Anforderungen, gewünschte Standorte, Rückfragen..."
              className="input w-full resize-none"
            />
          </div>

          {/* Hinweis */}
          <div className="card bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-gray-800 mb-2">💡 Hinweis</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ Die Genehmigung wird als "Beantragt" gespeichert</li>
              <li>✓ Du kannst später E-Mails an die Kommune senden</li>
              <li>✓ Status kann manuell auf "Genehmigt" / "Abgelehnt" gesetzt werden</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/permits" className="btn-secondary">
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={loading || campaigns.length === 0 || cities.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "Erstelle..." : "Genehmigung beantragen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

