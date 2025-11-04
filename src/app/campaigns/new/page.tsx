"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    eventName: "",
    locationName: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der Kampagne");
      }

      const campaign = await response.json();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert("Fehler beim Erstellen der Kampagne");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Neue Kampagne erstellen
        </h1>
        <p className="text-sm text-gray-600">
          Füllen Sie die Informationen für Ihre neue Plakat-Kampagne aus
        </p>
      </div>

      {/* Form */}
      <div className="p-8">
        <div className="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basis-Informationen */}
          <div className="card">
            <h2 className="text-base font-semibold mb-6 text-gray-900">
              Basis-Informationen
            </h2>

            <div className="space-y-5">
              <div>
                <label className="label">
                  Event-Name *
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  required
                  placeholder="z.B. Sommerfest 2025"
                  className="input"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Der Name der Veranstaltung oder des Events
                </p>
              </div>

              <div>
                <label className="label">
                  Kampagnen-Titel *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="z.B. Großes Stadtfest München"
                  className="input"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Beschreibender Titel für die interne Verwaltung
                </p>
              </div>

              <div>
                <label className="label">
                  Ort
                </label>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleChange}
                  placeholder="z.B. München"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Zeitraum */}
          <div className="card">
            <h2 className="text-base font-semibold mb-6 text-gray-900">
              Kampagnen-Zeitraum
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">
                  Start-Datum *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  End-Datum *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div className="card">
            <h2 className="text-base font-semibold mb-6 text-gray-900">
              Zusätzliche Informationen
            </h2>

            <div>
              <label className="label">
                Notizen
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Besonderheiten, Anforderungen, Kontaktpersonen..."
                className="input resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "Wird erstellt..." : "Kampagne erstellen"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
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

