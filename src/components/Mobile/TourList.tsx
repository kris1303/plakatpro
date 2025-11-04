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
  planned: "bg-blue-100 text-blue-700 border border-blue-200",
  in_progress: "bg-amber-100 text-amber-800 border border-amber-200",
  done: "bg-green-100 text-green-700 border border-green-200",
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
          className="card hover:shadow-md transition-all block"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {tour.campaign?.eventName || "Tour"}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(tour.plannedDate)}
              </p>
            </div>
            
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                STATUS_COLORS[tour.status]
              }`}
            >
              {STATUS_LABELS[tour.status]}
            </span>
          </div>

          {tour.installer && (
            <p className="text-sm mb-2 text-gray-600">
              🚗 {tour.installer.name}
            </p>
          )}

          <div className="flex gap-4 text-sm text-gray-600">
            <span>📍 {tour._count?.stops || 0} Stopps</span>
          </div>
        </Link>
      ))}

      {tours.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>Keine Touren verfügbar</p>
        </div>
      )}
    </div>
  );
}

