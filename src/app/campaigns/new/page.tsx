"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Zurück zum Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            ➕ Neue Kampagne erstellen
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basis-Informationen */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Basis-Informationen
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event-Name *
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  required
                  placeholder="z.B. Sommerfest 2025"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kampagnen-Titel *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="z.B. Großes Stadtfest München"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ort
                </label>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleChange}
                  placeholder="z.B. München"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Zeitraum */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Zeitraum
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start-Datum *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End-Datum *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Notizen (optional)
            </h2>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Zusätzliche Informationen zur Kampagne..."
              className="input w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/dashboard" className="btn-secondary">
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "Erstelle..." : "Kampagne erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

