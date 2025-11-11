"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";

type Client = {
  id: string;
  name: string;
};

type City = {
  id: string;
  name: string;
  postalCode: string | null;
  fee: number | null;
  requiresPermitForm: boolean;
  permitFormAsset?: {
    id: string;
    fileName: string;
  } | null;
};

type DistributionItem = {
  id?: string;
  cityId: string;
  cityName: string;
  postalCode: string;
  quantity: number;
  posterSize: string;
  fee: number;
  distanceKm: number;
  includePosterImage: boolean;
  includePermitForm: boolean;
  cityHasPermitForm: boolean;
};

type DistributionList = {
  id: string;
  eventName: string;
  eventAddress: string;
  eventDate: string | null;
  startDate: string;
  endDate: string;
  clientId: string;
  notes: string | null;
  items: Array<{
    id: string;
    quantity: number;
    posterSize: string;
    distanceKm: number | null;
    fee: number | null;
    includePosterImage: boolean;
    includePermitForm: boolean;
    city: {
      id: string;
      name: string;
      postalCode: string | null;
      requiresPermitForm: boolean;
      permitFormAsset?: {
        id: string;
        fileName: string;
      } | null;
    };
  }>;
  posterImageAsset?: {
    id: string;
    fileName: string;
    contentType: string;
    size: number;
  } | null;
};

export default function EditDistributionListPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [clients, setClients] = useState<Client[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    eventName: "",
    eventAddress: "",
    eventDate: "",
    startDate: "",
    endDate: "",
    clientId: "",
    notes: "",
  });

  const [items, setItems] = useState<DistributionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [itemForm, setItemForm] = useState({
    quantity: 1,
    posterSize: "A1",
    fee: 0,
    distanceKm: 0,
  });
  const [posterImage, setPosterImage] = useState<{
    id: string;
    fileName: string;
    contentType: string;
    size: number;
  } | null>(null);
  const [uploadingPosterImage, setUploadingPosterImage] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchCities();
    fetchDistributionList();
  }, [id]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Fehler beim Laden der Kunden:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities");
      const data = await res.json();
      setCities(data);
    } catch (error) {
      console.error("Fehler beim Laden der Kommunen:", error);
    }
  };

  const fetchDistributionList = async () => {
    try {
      const res = await fetch(`/api/distribution-lists/${id}`);
      const data: DistributionList = await res.json();

      setFormData({
        eventName: data.eventName,
        eventAddress: data.eventAddress,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString().split("T")[0] : "",
        startDate: new Date(data.startDate).toISOString().split("T")[0],
        endDate: new Date(data.endDate).toISOString().split("T")[0],
        clientId: data.clientId,
        notes: data.notes || "",
      });

      if (data.posterImageAsset) {
        setPosterImage({
          id: data.posterImageAsset.id,
          fileName: data.posterImageAsset.fileName,
          contentType: data.posterImageAsset.contentType,
          size: data.posterImageAsset.size,
        });
      } else {
        setPosterImage(null);
      }

      setItems(
        data.items.map((item) => {
          const hasForm = !!item.city.permitFormAsset;
          return {
            id: item.id,
            cityId: item.city.id,
            cityName: item.city.name,
            postalCode: item.city.postalCode || "",
            quantity: item.quantity,
            posterSize: item.posterSize,
            fee: item.fee || 0,
            distanceKm: item.distanceKm || 0,
            includePosterImage: item.includePosterImage || false,
            includePermitForm: hasForm
              ? item.includePermitForm ?? item.city.requiresPermitForm ?? false
              : false,
            cityHasPermitForm: hasForm,
          };
        })
      );
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter((city) => {
    const searchLower = searchTerm.toLowerCase();
    const alreadyAdded = items.some((item) => item.cityId === city.id);
    return (
      !alreadyAdded &&
      (city.name.toLowerCase().includes(searchLower) ||
        city.postalCode?.includes(searchLower))
    );
  });

  const calculateDistanceForCity = async (cityName: string, postalCode: string | null) => {
    if (!formData.eventAddress) {
      return 0;
    }

    try {
      const destination = postalCode ? `${postalCode} ${cityName}, Deutschland` : `${cityName}, Deutschland`;
      const res = await fetch("/api/calculate-distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: formData.eventAddress,
          destination: destination,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.distanceKm || 0;
      }
    } catch (error) {
      console.error("Fehler bei Entfernungsberechnung:", error);
    }
    return 0;
  };

  const addItem = async () => {
    if (!selectedCityId) return;

    const city = cities.find((c) => c.id === selectedCityId);
    if (!city) return;

    // Automatische Entfernungsberechnung
    let calculatedDistance = itemForm.distanceKm;
    if (formData.eventAddress && calculatedDistance === 0) {
      calculatedDistance = await calculateDistanceForCity(city.name, city.postalCode);
    }

    const newItem: DistributionItem = {
      id: undefined,
      cityId: city.id,
      cityName: city.name,
      postalCode: city.postalCode || "",
      quantity: itemForm.quantity,
      posterSize: itemForm.posterSize,
      fee: itemForm.fee || city.fee || 0,
      distanceKm: calculatedDistance,
      includePosterImage: false,
      includePermitForm: city.permitFormAsset ? city.requiresPermitForm ?? false : false,
      cityHasPermitForm: !!city.permitFormAsset,
    };

    setItems([...items, newItem]);
    setSelectedCityId("");
    setSearchTerm("");
    setItemForm({
      quantity: 1,
      posterSize: "A1",
      fee: 0,
      distanceKm: 0,
    });
  };

  const removeItem = (cityId: string) => {
    setItems(items.filter((item) => item.cityId !== cityId));
  };

  const updateItem = (cityId: string, field: keyof DistributionItem, value: any) => {
    setItems(
      items.map((item) =>
        item.cityId === cityId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/distribution-lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          posterImageAssetId: posterImage?.id || null,
          items: items.map(({ id, ...item }) => item),
        }),
      });

      if (!res.ok) {
        throw new Error("Fehler beim Aktualisieren der Verteilerliste");
      }

      router.push(`/distribution-lists/${id}`);
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Aktualisieren der Verteilerliste");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-center">Laden...</div>
      </AppLayout>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalFees = items.reduce((sum, item) => sum + item.fee, 0);

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Zurück
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Verteilerliste bearbeiten
        </h1>
        <p className="text-sm text-gray-600">
          Ändern Sie die Details der Verteilerliste
        </p>
      </div>

      <div className="p-8 max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event-Daten */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📍 Event-Informationen
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Event-Name *</label>
                <input
                  type="text"
                  required
                  value={formData.eventName}
                  onChange={(e) =>
                    setFormData({ ...formData, eventName: e.target.value })
                  }
                  className="input-field"
                  placeholder="z.B. Sommerfest 2025"
                />
              </div>

              <div>
                <label className="input-label">Event-Datum</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Event-Adresse</label>
                <input
                  type="text"
                  required
                  value={formData.eventAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, eventAddress: e.target.value })
                  }
                  className="input-field"
                  placeholder="z.B. Festplatz, 12345 Musterstadt"
                />
              </div>

              <div>
                <label className="input-label">Kampagnenzeitraum Start *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Kampagnenzeitraum Ende *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Kunde *</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Kunde auswählen...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Notizen</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Zusätzliche Informationen..."
                />
              </div>
            </div>
          </div>

          {/* Posterbild */}
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">🖼️ Plakatbild</h2>
                <p className="text-sm text-gray-600">
                  Optionales Motiv, das auf Wunsch einzelner Kommunen als Anhang mitgeschickt wird.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="btn-secondary cursor-pointer">
                  {uploadingPosterImage ? "Lade hoch..." : posterImage ? "Bild ersetzen" : "Bild hochladen"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (file.size > 6 * 1024 * 1024) {
                        alert("Bitte nur Bilder bis maximal 6 MB hochladen.");
                        return;
                      }
                      setUploadingPosterImage(true);
                      try {
                        const formDataUpload = new FormData();
                        formDataUpload.append("file", file);
                        formDataUpload.append("category", "poster-images");

                        const res = await fetch("/api/uploads", {
                          method: "POST",
                          body: formDataUpload,
                        });

                        if (!res.ok) {
                          throw new Error("Upload fehlgeschlagen");
                        }

                        const data = await res.json();
                        setPosterImage({
                          id: data.id,
                          fileName: data.fileName,
                          contentType: data.contentType,
                          size: data.size,
                        });
                      } catch (error) {
                        console.error("Upload-Fehler:", error);
                        alert("Upload des Plakatbildes fehlgeschlagen.");
                      } finally {
                        setUploadingPosterImage(false);
                      }
                    }}
                    disabled={uploadingPosterImage}
                  />
                </label>
                {posterImage && (
                  <button
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() => {
                      setPosterImage(null);
                      setItems((prev) =>
                        prev.map((entry) => ({
                          ...entry,
                          includePosterImage: false,
                        }))
                      );
                    }}
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>
            {posterImage && (
              <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <div className="font-medium">{posterImage.fileName}</div>
                <div className="text-xs text-gray-500">
                  {(posterImage.size / 1024).toFixed(1)} KB · {posterImage.contentType}
                </div>
              </div>
            )}
          </div>

          {/* Kommunen hinzufügen */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🏛️ Kommunen hinzufügen
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="input-label">Kommune suchen</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  placeholder="PLZ oder Name..."
                />
                {searchTerm && filteredCities.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto">
                    {filteredCities.slice(0, 10).map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          setSelectedCityId(city.id);
                          setSearchTerm(city.name);
                          setItemForm({
                            ...itemForm,
                            fee: city.fee || 0,
                          });
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-900">
                          {city.postalCode && <span className="text-gray-500 mr-2">{city.postalCode}</span>}
                          {city.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Anzahl</label>
                <input
                  type="number"
                  min="1"
                  value={itemForm.quantity}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Größe</label>
                <select
                  value={itemForm.posterSize}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, posterSize: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="A1">A1</option>
                  <option value="A0">A0</option>
                  <option value="120x180">120x180</option>
                </select>
              </div>

              <div>
                <label className="input-label">Gebühr (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.fee}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, fee: parseFloat(e.target.value) || 0 })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Entfernung (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={itemForm.distanceKm}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, distanceKm: parseFloat(e.target.value) || 0 })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={!selectedCityId}
              className="btn-secondary"
            >
              ➕ Kommune hinzufügen {formData.eventAddress && "(mit Entfernungsberechnung)"}
            </button>

            {!formData.eventAddress && (
              <p className="text-xs text-amber-600 mt-2">
                💡 Tipp: Event-Adresse eingeben für automatische Entfernungsberechnung
              </p>
            )}
          </div>

          {/* Ausgewählte Kommunen */}
          {items.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Ausgewählte Kommunen ({items.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PLZ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Stadt</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Entfernung (km)</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Anzahl</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Größe</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Gebühr (€)</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        Posterbild anhängen
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        Formular anhängen
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.cityId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{item.postalCode}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.cityName}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={item.distanceKm}
                            onChange={(e) =>
                              updateItem(item.cityId, "distanceKm", parseFloat(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 text-sm border border-gray-200 rounded text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.cityId, "quantity", parseInt(e.target.value) || 1)
                            }
                            className="w-16 px-2 py-1 text-sm border border-gray-200 rounded text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={item.posterSize}
                            onChange={(e) =>
                              updateItem(item.cityId, "posterSize", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-gray-200 rounded"
                          >
                            <option value="A1">A1</option>
                            <option value="A0">A0</option>
                            <option value="120x180">120x180</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={item.fee}
                            onChange={(e) =>
                              updateItem(item.cityId, "fee", parseFloat(e.target.value) || 0)
                            }
                            className="w-24 px-2 py-1 text-sm border border-gray-200 rounded text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            checked={item.includePosterImage}
                            onChange={(e) => updateItem(item.cityId, "includePosterImage", e.target.checked)}
                            disabled={!posterImage}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            checked={item.includePermitForm && item.cityHasPermitForm}
                            onChange={(e) =>
                              updateItem(
                                item.cityId,
                                "includePermitForm",
                                e.target.checked && item.cityHasPermitForm
                              )
                            }
                            disabled={!item.cityHasPermitForm}
                          />
                          {!item.cityHasPermitForm && (
                            <div className="text-[10px] text-gray-400 mt-1">kein Formular hinterlegt</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.cityId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900">
                        Gesamt
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                        {totalQuantity}
                      </td>
                      <td></td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {totalFees.toFixed(2)} €
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving || items.length === 0}
              className="btn-primary"
            >
              {saving ? "Speichern..." : "Änderungen speichern"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

