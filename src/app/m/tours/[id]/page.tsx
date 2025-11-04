import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StopItem from "@/components/Mobile/StopItem";
import { formatDate } from "@/lib/utils";
import { createNavigationSegments, createNavigationUrl } from "@/lib/maps";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface TourDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { id } = await params;

  const tour = await prisma.route.findUnique({
    where: { id },
    include: {
      installer: true,
      campaign: true,
      stops: {
        include: {
          city: true,
          planItems: {
            include: {
              campaign: true,
              format: true,
              placements: {
                include: {
                  photo: true,
                },
              },
            },
          },
        },
        orderBy: { seq: "asc" },
      },
    },
  });

  if (!tour) {
    notFound();
  }

  // Fortschritt berechnen
  const totalPlanItems = tour.stops.reduce(
    (sum, stop) => sum + stop.planItems.reduce((s, pi) => s + pi.plannedQty, 0),
    0
  );
  const totalHung = tour.stops.reduce(
    (sum, stop) =>
      sum +
      stop.planItems.reduce(
        (s, pi) => s + pi.placements.filter((p) => p.status === "hung").length,
        0
      ),
    0
  );
  const progress = totalPlanItems > 0 ? (totalHung / totalPlanItems) * 100 : 0;

  // Navigation Segments erstellen
  const stopsWithCoords = tour.stops.filter((s) => s.lat && s.lng);
  const navSegments =
    stopsWithCoords.length > 1
      ? createNavigationSegments(
          stopsWithCoords.map((s) => ({ lat: s.lat!, lng: s.lng! }))
        )
      : [];

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <Link href="/m/tours" className="text-brand-yellow mb-4 inline-block">
          ← Zurück zu Touren
        </Link>
        
        <h1 className="text-3xl font-bold text-brand-yellow mb-2">
          {tour.campaign?.eventName || "Tour Details"}
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>📅 {formatDate(tour.plannedDate)}</span>
          {tour.installer && <span>🚗 {tour.installer.name}</span>}
          <span>📍 {tour.stops.length} Stopps</span>
        </div>
      </div>

      {/* Fortschritt */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">Gesamt-Fortschritt</h2>
          <span className="text-2xl font-bold text-brand-yellow">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="w-full bg-zinc-800 rounded-full h-4 mb-2">
          <div
            className="bg-brand-yellow h-4 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-400">
          {totalHung} von {totalPlanItems} Plakaten aufgehängt
        </p>
      </div>

      {/* Navigation Segments */}
      {navSegments.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-3">🧭 Navigation</h2>
          <p className="text-sm text-gray-400 mb-3">
            Tour ist in {navSegments.length} Segment(e) aufgeteilt (max. 23
            Waypoints pro Segment)
          </p>
          
          <div className="space-y-2">
            {navSegments.map((segment, idx) => {
              const url = createNavigationUrl(
                segment.origin,
                segment.destination,
                segment.waypoints
              );
              
              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary block text-center"
                >
                  Segment {idx + 1} starten ({segment.waypoints.length + 2}{" "}
                  Stopps)
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Stopps */}
      <div className="space-y-4">
        <h2 className="font-bold text-xl text-brand-yellow">Stopps</h2>
        
        {tour.stops.map((stop, idx) => {
          const handleNavigate = () => {
            if (stop.lat && stop.lng) {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=driving`;
              window.open(url, "_blank");
            }
          };

          return (
            <StopItem
              key={stop.id}
              stop={stop}
              index={idx}
              onNavigate={handleNavigate}
            />
          );
        })}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-16 h-16 rounded-full bg-brand-yellow text-brand-black text-3xl shadow-lg hover:scale-110 transition-transform">
          📷
        </button>
      </div>
    </div>
  );
}

