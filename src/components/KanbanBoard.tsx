"use client";

import { useState } from "react";
import { Campaign, CampaignStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

type KanbanColumn = {
  id: CampaignStatus;
  title: string;
  color: string;
};

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "Backlog/Setup", color: "bg-gray-700" },
  { id: "permits", title: "Genehmigungen", color: "bg-blue-700" },
  { id: "print", title: "Druck/Material", color: "bg-purple-700" },
  { id: "planning", title: "Tourplanung", color: "bg-indigo-700" },
  { id: "hanging", title: "Aushang", color: "bg-brand-yellow/20" },
  { id: "control", title: "Kontrolle", color: "bg-green-700" },
  { id: "removal_plan", title: "Abhängen - Planung", color: "bg-orange-700" },
  { id: "removal_live", title: "Abhängen - Live", color: "bg-red-700" },
  { id: "report", title: "Report", color: "bg-teal-700" },
  { id: "archive", title: "Archiv", color: "bg-gray-800" },
];

interface CampaignCardProps {
  campaign: Campaign & {
    client?: { name: string } | null;
    _count?: { permits: number; routes: number; photos: number };
  };
}

function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div className="card hover:border-brand-yellow/50 cursor-pointer transition-all">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-brand-yellow">{campaign.eventName}</h3>
        <span className="text-xs text-gray-400">
          {formatDate(campaign.startDate)}
        </span>
      </div>
      
      <p className="text-sm mb-2">{campaign.title}</p>
      
      {campaign.client && (
        <p className="text-xs text-gray-400 mb-2">
          Kunde: {campaign.client.name}
        </p>
      )}

      <div className="flex gap-2 text-xs mt-3">
        {campaign._count && (
          <>
            <span className="px-2 py-1 bg-zinc-800 rounded">
              📋 {campaign._count.permits} Anträge
            </span>
            <span className="px-2 py-1 bg-zinc-800 rounded">
              🚗 {campaign._count.routes} Touren
            </span>
            <span className="px-2 py-1 bg-zinc-800 rounded">
              📸 {campaign._count.photos} Fotos
            </span>
          </>
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  campaigns: Array<
    Campaign & {
      client?: { name: string } | null;
      _count?: { permits: number; routes: number; photos: number };
    }
  >;
}

export default function KanbanBoard({ campaigns }: KanbanBoardProps) {
  const [selectedColumn, setSelectedColumn] = useState<CampaignStatus | null>(null);

  const getCampaignsByColumn = (columnId: CampaignStatus) => {
    return campaigns.filter((c) => c.status === columnId);
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {KANBAN_COLUMNS.map((column) => {
          const columnCampaigns = getCampaignsByColumn(column.id);
          
          return (
            <div
              key={column.id}
              className="w-80 flex-shrink-0"
            >
              <div
                className={`${column.color} px-4 py-2 rounded-t-lg font-bold flex items-center justify-between`}
              >
                <span>{column.title}</span>
                <span className="text-sm bg-black/30 px-2 py-1 rounded">
                  {columnCampaigns.length}
                </span>
              </div>
              
              <div className="bg-zinc-900/50 rounded-b-lg p-2 min-h-[400px] space-y-3">
                {columnCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
                
                {columnCampaigns.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Keine Kampagnen
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

