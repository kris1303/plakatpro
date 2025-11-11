"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  feeModel: string | null;
};

type DistributionItem = {
  cityId: string;
  cityName: string;
  postalCode: string;
  quantity: number;
  posterSize: string;
  fee: number;
  distanceKm: number;
};

export default function NewDistributionListPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="p-8 text-sm text-gray-500">Lädt…</div>
        </AppLayout>
      }
    >
      <NewDistributionListPageContent />
    </Suspense>
  );
}

function NewDistributionListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchClients();
    fetchCities();
  }, []);

  useEffect(() => {
    const defaultClientId = searchParams.get("clientId");
    if (defaultClientId) {
      setFormData((prev) => ({ ...prev, clientId: defaultClientId }));
    }
  }, [searchParams]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) {
        throw new Error(`Fehlercode ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        console.error("Unerwartetes Antwortformat für /api/clients:", data);
        setClients([]);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Kunden:", error);
      setClients([]);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities");
      if (!res.ok) {
        throw new Error(`Fehlercode ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCities(data);
      } else {
        console.error("Unerwartetes Antwortformat für /api/cities:", data);
        setCities([]);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Kommunen:", error);
      setCities([]);
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

    let calculatedDistance = itemForm.distanceKm;
    if (formData.eventAddress && calculatedDistance === 0) {
      calculatedDistance = await calculateDistanceForCity(city.name, city.postalCode);
    }

    const newItem: DistributionItem = {
      cityId: city.id,
      cityName: city.name,
      postalCode: city.postalCode || "",
      quantity: itemForm.quantity,
      posterSize: itemForm.posterSize,
      fee: itemForm.fee || city.fee || 0,
      distanceKm: calculatedDistance,
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
    setLoading(true);

    try {
      const res = await fetch("/api/distribution-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          items: items,
        }),
      });

      if (!res.ok) {
        throw new Error("Fehler beim Erstellen der Verteilerliste");
      }

      const data = await res.json();
      router.push(`/distribution-lists/${data.id}`);
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Erstellen der Verteilerliste");
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalFees = items.reduce((sum, item) => sum + item.fee, 0);

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Neue Verteilerliste erstellen
        </h1>
        <p className="text-sm text-gray-600">
          Erstellen Sie ein Angebot für Ihren Kunden
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

