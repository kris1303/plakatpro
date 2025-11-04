"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Kunden");
      }

      router.push("/clients");
    } catch (error) {
      console.error("Error:", error);
      alert("Fehler beim Erstellen des Kunden");
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
          Neuen Kunden anlegen
        </h1>
        <p className="text-sm text-gray-600">
          Fügen Sie einen neuen Auftraggeber hinzu
        </p>
      </div>

      {/* Form */}
      <div className="p-8">
        <div className="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basis-Informationen */}
            <div className="card">
              <h2 className="text-base font-semibold mb-6 text-gray-900">
                Kunden-Informationen
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="label">
                    Firmenname / Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="z.B. Stadtmarketing GmbH"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="kontakt@firma.de"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+49 123 456789"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    Adresse
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Straße, PLZ Ort"
                    className="input resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Wird erstellt..." : "Kunde erstellen"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/clients")}
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

