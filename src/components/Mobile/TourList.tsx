"use client";

import { Route, RouteStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface TourWithDetails extends Route {
  installer?: { name: string } | null;
  campaign?: { eventName: string } | null;
  _count?: { stops: number };
}

interface TourListProps {
  tours: TourWithDetails[];
}

const STATUS_COLORS: Record<RouteStatus, string> = {
  planned: "bg-blue-600",
  in_progress: "bg-brand-yellow text-brand-black",
  done: "bg-green-600",
};

const STATUS_LABELS: Record<RouteStatus, string> = {
  planned: "Geplant",
  in_progress: "Unterwegs",
  done: "Fertig",
};

export default function TourList({ tours }: TourListProps) {
  return (
    <div className="space-y-4">
      {tours.map((tour) => (
        <Link
          key={tour.id}
          href={`/m/tours/${tour.id}`}
          className="card hover:border-brand-yellow/50 transition-all block"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-brand-yellow">
                {tour.campaign?.eventName || "Tour"}
              </h3>
              <p className="text-sm text-gray-400">
                {formatDate(tour.plannedDate)}
              </p>
            </div>
            
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                STATUS_COLORS[tour.status]
              }`}
            >
              {STATUS_LABELS[tour.status]}
            </span>
          </div>

          {tour.installer && (
            <p className="text-sm mb-2">
              🚗 {tour.installer.name}
            </p>
          )}

          <div className="flex gap-4 text-sm text-gray-300">
            <span>📍 {tour._count?.stops || 0} Stopps</span>
          </div>
        </Link>
      ))}

      {tours.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-2">📭</p>
          <p>Keine Touren verfügbar</p>
        </div>
      )}
    </div>
  );
}

