"use client";

import { RouteStop, PlanItem, Campaign, PosterFormat, Placement } from "@prisma/client";

interface StopItemProps {
  stop: RouteStop & {
    city?: { name: string } | null;
    planItems: Array<
      PlanItem & {
        campaign: Campaign;
        format: PosterFormat;
        placements: Placement[];
      }
    >;
  };
  index: number;
  onNavigate?: () => void;
}

export default function StopItem({ stop, index, onNavigate }: StopItemProps) {
  const totalPlanned = stop.planItems.reduce((sum, item) => sum + item.plannedQty, 0);
  const totalHung = stop.planItems.reduce(
    (sum, item) =>
      sum + item.placements.filter((p) => p.status === "hung").length,
    0
  );

  const progress = totalPlanned > 0 ? (totalHung / totalPlanned) * 100 : 0;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-yellow text-brand-black flex items-center justify-center font-bold">
            {index + 1}
          </div>
          
          <div>
            <h3 className="font-bold text-brand-yellow">
              {stop.city?.name || "Stopp"}
            </h3>
            {stop.notes && (
              <p className="text-sm text-gray-400 mt-1">{stop.notes}</p>
            )}
          </div>
        </div>

        {stop.lat && stop.lng && (
          <button
            onClick={onNavigate}
            className="btn-primary text-sm px-3 py-1"
          >
            🧭 Navigieren
          </button>
        )}
      </div>

      {/* Fortschrittsbalken */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>
            {totalHung} / {totalPlanned} Plakate
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-brand-yellow h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Plan Items */}
      <div className="space-y-2">
        {stop.planItems.map((planItem) => {
          const hung = planItem.placements.filter(
            (p) => p.status === "hung"
          ).length;

          return (
            <div
              key={planItem.id}
              className="bg-zinc-800 rounded p-2 text-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-brand-yellow">
                    {planItem.campaign.eventName}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {planItem.format.name}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    hung === planItem.plannedQty
                      ? "bg-green-600"
                      : hung > 0
                      ? "bg-yellow-600"
                      : "bg-gray-600"
                  }`}
                >
                  {hung}/{planItem.plannedQty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

