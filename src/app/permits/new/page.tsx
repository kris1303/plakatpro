"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

interface Campaign {
  id: string;
  eventName: string;
  eventAddress: string | null;
  startDate: string;
  endDate: string;
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
  const [searchTerm, setSearchTerm] = useState("");
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
      
      // Nur zukünftige Kampagnen (endDate >= heute)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureCampaigns = campaignsData.filter((campaign: Campaign) => {
        const endDate = new Date(campaign.endDate);
        return endDate >= today;
      });
      
      setCampaigns(futureCampaigns);

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

  const addCity = (cityId: string) => {
    if (!selectedCityIds.includes(cityId)) {
      setSelectedCityIds([...selectedCityIds, cityId]);
    }
    setSearchTerm(""); // Suchfeld leeren nach Auswahl
  };

  const removeCity = (cityId: string) => {
    setSelectedCityIds(selectedCityIds.filter((id) => id !== cityId));
  };

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCities = cities.filter((c) => selectedCityIds.includes(c.id));
  const totalFees = selectedCities.reduce((sum, city) => sum + (city.fee || 0), 0);

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
                  {campaign.eventName}
                  {campaign.eventAddress && ` · ${campaign.eventAddress}`}
                  {` (${new Date(campaign.startDate).toLocaleDateString("de-DE")} - ${new Date(campaign.endDate).toLocaleDateString("de-DE")})`}
                </option>
              ))}
            </select>

            {campaigns.length === 0 && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700 font-medium mb-1">
                  ⚠️ Keine zukünftigen Kampagnen vorhanden
                </p>
                <p className="text-xs text-amber-600">
                  Es werden nur Kampagnen angezeigt, deren End-Datum in der Zukunft liegt.
                </p>
              </div>
            )}
          </div>

          {/* Kommunen auswählen */}
          <div className="card">
            <h2 className="text-base font-semibold mb-6 text-gray-900">
              Kommunen auswählen *
            </h2>

            {cities.length === 0 && (
              <p className="text-sm text-amber-600 p-4 bg-amber-50 rounded-lg">
                ⚠️ Keine Kommunen angelegt. Legen Sie zuerst Kommunen an!
              </p>
            )}

            {cities.length > 0 && (
              <div className="space-y-4">
                {/* Suchfeld */}
                <div>
                  <label className="label">
                    Kommune suchen und hinzufügen
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Namen der Kommune eingeben..."
                    className="input"
                  />
                </div>

                {/* Suchergebnisse */}
                {searchTerm && (
                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {filteredCities.map((city) => {
                          const alreadySelected = selectedCityIds.includes(city.id);
                          
                          return (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => addCity(city.id)}
                              disabled={alreadySelected}
                              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                alreadySelected ? "bg-gray-50" : ""
                              }`}
                            >
                              <div className="font-medium text-gray-900 mb-1">
                                {city.name} {alreadySelected && "✓"}
                              </div>
                              <div className="flex gap-3 text-xs text-gray-600">
                                {city.fee && <span>💵 {city.fee.toFixed(2)} €</span>}
                                {city.feeModel && <span>{city.feeModel}</span>}
                                {city.maxQty && <span>Max. {city.maxQty}</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Keine Kommune gefunden
                      </div>
                    )}
                  </div>
                )}

                {/* Ausgewählte Kommunen (Chips) */}
                {selectedCities.length > 0 && (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">
                        Ausgewählte Kommunen ({selectedCities.length})
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        Gesamt: {totalFees.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCities.map((city) => (
                        <div
                          key={city.id}
                          className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-full pl-3 pr-2 py-1.5 text-sm"
                        >
                          <span className="font-medium text-gray-900">
                            {city.name}
                          </span>
                          {city.fee && (
                            <span className="text-xs text-gray-600">
                              {city.fee.toFixed(2)} €
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeCity(city.id)}
                            className="ml-1 w-5 h-5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

