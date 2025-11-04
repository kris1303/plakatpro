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
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          
          <div>
            <h3 className="font-bold text-gray-800">
              {stop.city?.name || "Stopp"}
            </h3>
            {stop.notes && (
              <p className="text-sm text-gray-500 mt-1">{stop.notes}</p>
            )}
          </div>
        </div>

        {stop.lat && stop.lng && (
          <button
            onClick={onNavigate}
            className="btn-primary text-sm px-3 py-1"
          >
            🧭 Nav
          </button>
        )}
      </div>

      {/* Fortschrittsbalken */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1 text-gray-600">
          <span>
            {totalHung} / {totalPlanned} Plakate
          </span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
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
              className="bg-gray-50 border border-gray-200 rounded p-3 text-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-800">
                    {planItem.campaign.eventName}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {planItem.format.name}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    hung === planItem.plannedQty
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : hung > 0
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
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

