"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";

interface Client {
  id: string;
  name: string;
}

export default function NewCampaignPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="p-8 text-sm text-gray-500">Lädt…</div>
        </AppLayout>
      }
    >
      <NewCampaignPageContent />
    </Suspense>
  );
}

function NewCampaignPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    eventName: "",
    eventAddress: "",
    eventDate: "",
    startDate: "",
    endDate: "",
    clientId: "",
    notes: "",
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const defaultClientId = searchParams.get("clientId");
    if (defaultClientId) {
      setFormData((prev) => ({ ...prev, clientId: defaultClientId }));
    }
  }, [searchParams]);

  const loadClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error(`Fehlercode ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        console.error("Unerwartetes Antwortformat für /api/clients:", data);
        setClients([]);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.clientId) {
        throw new Error("Bitte wählen Sie einen Kunden aus.");
      }

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          clientId: formData.clientId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message =
          (errorBody && errorBody.error) || "Fehler beim Erstellen der Kampagne";
        throw new Error(message);
      }

      const campaign = await response.json();

      if (posterFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", posterFile);
        uploadFormData.append("campaignId", campaign.id);

        await fetch("/api/campaigns/upload-poster", {
          method: "POST",
          body: uploadFormData,
        });
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      const message =
        error instanceof Error ? error.message : "Fehler beim Erstellen der Kampagne";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
    }
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
            {/* Event-Informationen */}
            <div className="card">
              <h2 className="text-base font-semibold mb-6 text-gray-900">
                Event-Informationen
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="label">
                    Event-Name / Kampagnen-Titel *
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
                    Name der Veranstaltung
                  </p>
                </div>

                <div>
                  <label className="label">
                    Adresse der Event-Location *
                  </label>
                  <input
                    type="text"
                    name="eventAddress"
                    value={formData.eventAddress}
                    onChange={handleChange}
                    required
                    placeholder="z.B. Seestraße 1, 88045 Friedrichshafen"
                    className="input"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Vollständige Adresse des Veranstaltungsortes
                  </p>
                </div>

                <div>
                  <label className="label">
                    Event-Datum
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="input"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Datum der Veranstaltung (optional)
                  </p>
                </div>

                <div>
                  <label className="label">
                    Kunde
                  </label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">-- Kein Kunde ausgewählt --</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {clients.length === 0 && (
                    <p className="mt-1.5 text-xs text-amber-600">
                      ⚠️ Keine Kunden vorhanden. Legen Sie zuerst Kunden an.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Werbezeitraum */}
            <div className="card">
              <h2 className="text-base font-semibold mb-6 text-gray-900">
                Werbezeitraum (Kampagnen-Zeitraum)
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
                  <p className="mt-1.5 text-xs text-gray-500">
                    Ab wann sollen Plakate hängen
                  </p>
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
                  <p className="mt-1.5 text-xs text-gray-500">
                    Bis wann sollen Plakate hängen
                  </p>
                </div>
              </div>
            </div>

            {/* Plakatvorlage */}
            <div className="card">
              <h2 className="text-base font-semibold mb-6 text-gray-900">
                Plakatvorlage
              </h2>

              <div>
                <label className="label">
                  Plakatvorlage hochladen
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.ai,.psd"
                  onChange={handleFileChange}
                  className="input cursor-pointer"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Akzeptiert: PDF, JPG, PNG, AI, PSD (max. 25MB)
                </p>
                {posterFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <span>✓</span>
                    <span>{posterFile.name}</span>
                    <span className="text-gray-500">
                      ({(posterFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
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


