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
  { id: "backlog", title: "Backlog/Setup", color: "bg-slate-100" },
  { id: "permits", title: "Genehmigungen", color: "bg-blue-100" },
  { id: "print", title: "Druck/Material", color: "bg-purple-100" },
  { id: "planning", title: "Tourplanung", color: "bg-indigo-100" },
  { id: "hanging", title: "Aushang", color: "bg-amber-100" },
  { id: "control", title: "Kontrolle", color: "bg-green-100" },
  { id: "removal_plan", title: "Abhängen - Planung", color: "bg-orange-100" },
  { id: "removal_live", title: "Abhängen - Live", color: "bg-red-100" },
  { id: "report", title: "Report", color: "bg-teal-100" },
  { id: "archive", title: "Archiv", color: "bg-gray-100" },
];

interface CampaignCardProps {
  campaign: Campaign & {
    client?: { name: string } | null;
    _count?: { permits: number; routes: number; photos: number };
  };
}

function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 text-sm">{campaign.eventName}</h3>
        <span className="text-xs text-gray-500">
          {formatDate(campaign.startDate)}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{campaign.title}</p>
      
      {campaign.client && (
        <p className="text-xs text-gray-500 mb-3">
          👤 {campaign.client.name}
        </p>
      )}

      <div className="flex gap-2 flex-wrap text-xs">
        {campaign._count && (
          <>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
              📋 {campaign._count.permits}
            </span>
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
              🚗 {campaign._count.routes}
            </span>
            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
              📸 {campaign._count.photos}
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
                className={`${column.color} px-4 py-3 rounded-t-lg font-semibold text-gray-700 flex items-center justify-between border border-b-0 border-gray-200`}
              >
                <span className="text-sm">{column.title}</span>
                <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-medium">
                  {columnCampaigns.length}
                </span>
              </div>
              
              <div className="bg-gray-50/50 rounded-b-lg border border-gray-200 border-t-0 p-3 min-h-[500px] space-y-3">
                {columnCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
                
                {columnCampaigns.length === 0 && (
                  <div className="text-center text-gray-400 py-12 text-sm">
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

