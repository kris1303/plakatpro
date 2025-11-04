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
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    campaignId: "",
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
    
    if (!formData.campaignId || selectedCityIds.length === 0) {
      alert("Bitte wähle eine Kampagne und mindestens eine Kommune aus");
      return;
    }

    setLoading(true);

    try {
      // Erstelle Genehmigung für jede ausgewählte Kommune
      const promises = selectedCityIds.map((cityId) =>
        fetch("/api/permits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            campaignId: formData.campaignId,
            cityId,
            notes: formData.notes,
          }),
        })
      );

      const responses = await Promise.all(promises);
      
      const failedCount = responses.filter((r) => !r.ok).length;
      
      if (failedCount > 0) {
        alert(`${failedCount} von ${selectedCityIds.length} Genehmigungen konnten nicht erstellt werden`);
      }

      router.push("/permits");
    } catch (error) {
      console.error("Error:", error);
      alert("Fehler beim Erstellen der Genehmigungen");
    } finally {
      setLoading(false);
    }
  };

  const toggleCity = (cityId: string) => {
    setSelectedCityIds((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  const selectAllCities = () => {
    setSelectedCityIds(cities.map((c) => c.id));
  };

  const deselectAllCities = () => {
    setSelectedCityIds([]);
  };

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

          {/* Kommunen auswählen (Mehrfachauswahl) */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Kommunen auswählen * ({selectedCityIds.length} ausgewählt)
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllCities}
                  className="btn-ghost text-xs px-3 py-1"
                >
                  Alle auswählen
                </button>
                <button
                  type="button"
                  onClick={deselectAllCities}
                  className="btn-ghost text-xs px-3 py-1"
                >
                  Alle abwählen
                </button>
              </div>
            </div>

            {cities.length === 0 && (
              <p className="text-sm text-amber-600 p-4 bg-amber-50 rounded-lg">
                ⚠️ Keine Kommunen angelegt. Legen Sie zuerst Kommunen an!
              </p>
            )}

            {/* Kommunen-Liste mit Checkboxen */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cities.map((city) => {
                const isSelected = selectedCityIds.includes(city.id);
                
                return (
                  <label
                    key={city.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCity(city.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {city.name}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                        {city.feeModel && (
                          <span>💰 {city.feeModel}</span>
                        )}
                        {city.fee && (
                          <span className="font-medium">💵 {city.fee.toFixed(2)} €</span>
                        )}
                        {city.maxQty && (
                          <span>🔢 Max. {city.maxQty} Plakate</span>
                        )}
                        {city.maxSize && (
                          <span>📐 {city.maxSize}</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
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
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || campaigns.length === 0 || selectedCityIds.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {loading 
                ? `Erstelle ${selectedCityIds.length} Genehmigung(en)...` 
                : `${selectedCityIds.length} Genehmigung(en) beantragen`
              }
            </button>
            <button
              type="button"
              onClick={() => router.push("/permits")}
              className="btn-secondary"
            >
              Abbrechen
            </button>
          </div>
        </form>
        </div>
      </div>
    </AppLayout>
  );
}

