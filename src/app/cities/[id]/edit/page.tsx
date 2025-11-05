"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";

export default function EditCityPage() {
  const router = useRouter();
  const params = useParams();
  const cityId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    postalCode: "",
    population: "",
    email: "",
    feeModel: "",
    fee: "",
    maxQty: "",
    maxSize: "",
  });

  useEffect(() => {
    const loadCity = async () => {
      try {
        const res = await fetch(`/api/cities/${cityId}`);
        if (!res.ok) throw new Error("Stadt nicht gefunden");
        
        const city = await res.json();
        setFormData({
          name: city.name || "",
          postalCode: city.postalCode || "",
          population: city.population?.toString() || "",
          email: city.email || "",
          feeModel: city.feeModel || "",
          fee: city.fee?.toString() || "",
          maxQty: city.maxQty?.toString() || "",
          maxSize: city.maxSize || "",
        });
      } catch (error) {
        console.error("Fehler beim Laden:", error);
        alert("Fehler beim Laden der Kommune");
        router.push("/cities");
      } finally {
        setLoadingData(false);
      }
    };

    loadCity();
  }, [cityId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/cities/${cityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          postalCode: formData.postalCode || null,
          population: formData.population ? parseInt(formData.population) : null,
          email: formData.email || null,
          feeModel: formData.feeModel || null,
          fee: formData.fee ? parseFloat(formData.fee) : null,
          maxQty: formData.maxQty ? parseInt(formData.maxQty) : null,
          maxSize: formData.maxSize || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Fehler beim Aktualisieren der Kommune");
      }

      router.push("/cities");
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Aktualisieren der Kommune");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="card text-center py-16">
            <div className="text-2xl mb-4">⏳</div>
            <p className="text-gray-600">Lade Kommune...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Kommune bearbeiten
        </h1>
        <p className="text-sm text-gray-600">
          Ändern Sie die Details der Kommune
        </p>
      </div>

      <div className="p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📍 Grunddaten
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="input-label">Stadt/Kommune *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="z.B. Köln"
                />
              </div>

              <div>
                <label className="input-label">Postleitzahl (PLZ)</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="input-field"
                  placeholder="z.B. 50667"
                />
              </div>

              <div>
                <label className="input-label">Einwohnerzahl</label>
                <input
                  type="number"
                  value={formData.population}
                  onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                  className="input-field"
                  placeholder="z.B. 1085664"
                />
              </div>

              <div className="md:col-span-2">
                <label className="input-label">E-Mail Kontakt</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="z.B. ordnungsamt@stadt.de"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              💶 Gebühren & Richtlinien
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Gebührenmodell</label>
                <select
                  value={formData.feeModel}
                  onChange={(e) => setFormData({ ...formData, feeModel: e.target.value })}
                  className="input-field"
                >
                  <option value="">Bitte wählen...</option>
                  <option value="pauschal">Pauschal</option>
                  <option value="proPlakat">Pro Plakat</option>
                  <option value="proZeitraum">Pro Zeitraum</option>
                </select>
              </div>

              <div>
                <label className="input-label">Gebühr (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  className="input-field"
                  placeholder="z.B. 50.00"
                />
              </div>

              <div>
                <label className="input-label">Max. Anzahl Plakate</label>
                <input
                  type="number"
                  value={formData.maxQty}
                  onChange={(e) => setFormData({ ...formData, maxQty: e.target.value })}
                  className="input-field"
                  placeholder="z.B. 10"
                />
              </div>

              <div>
                <label className="input-label">Max. Plakatgröße</label>
                <select
                  value={formData.maxSize}
                  onChange={(e) => setFormData({ ...formData, maxSize: e.target.value })}
                  className="input-field"
                >
                  <option value="">Bitte wählen...</option>
                  <option value="A1">A1</option>
                  <option value="A0">A0</option>
                  <option value="120x180">120x180 cm</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Abbrechen
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Speichern..." : "Änderungen speichern"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

