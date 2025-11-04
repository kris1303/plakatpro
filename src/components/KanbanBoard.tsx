"use client";

import { useState } from "react";
import { Campaign, CampaignStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

type KanbanColumn = {
  id: CampaignStatus;
  title: string;
  bgColor: string;
  textColor: string;
};

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", bgColor: "bg-gray-50", textColor: "text-gray-700" },
  { id: "permits", title: "Genehmigungen", bgColor: "bg-blue-50", textColor: "text-blue-700" },
  { id: "print", title: "Druck", bgColor: "bg-purple-50", textColor: "text-purple-700" },
  { id: "planning", title: "Planung", bgColor: "bg-indigo-50", textColor: "text-indigo-700" },
  { id: "hanging", title: "Aushang", bgColor: "bg-amber-50", textColor: "text-amber-700" },
  { id: "control", title: "Kontrolle", bgColor: "bg-green-50", textColor: "text-green-700" },
  { id: "removal_plan", title: "Abhängen (Plan)", bgColor: "bg-orange-50", textColor: "text-orange-700" },
  { id: "removal_live", title: "Abhängen (Live)", bgColor: "bg-red-50", textColor: "text-red-700" },
  { id: "report", title: "Report", bgColor: "bg-teal-50", textColor: "text-teal-700" },
  { id: "archive", title: "Archiv", bgColor: "bg-gray-100", textColor: "text-gray-600" },
];

interface CampaignCardProps {
  campaign: Campaign & {
    client?: { name: string } | null;
    _count?: { permits: number; routes: number; photos: number };
  };
  onDragStart?: (e: React.DragEvent) => void;
}

function CampaignCard({ campaign, onDragStart }: CampaignCardProps) {
  return (
    <div 
      draggable
      onDragStart={onDragStart}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-move transition-all hover:shadow-md hover:border-blue-300 group active:opacity-50"
    >
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
          {campaign.eventName}
        </h3>
        <p className="text-xs text-gray-500">
          {campaign.title}
        </p>
      </div>
      
      {campaign.client && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-600">
          <span className="text-gray-400">👤</span>
          <span>{campaign.client.name}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {formatDate(campaign.startDate)}
        </span>
        {campaign._count && (
          <div className="flex gap-1.5">
            {campaign._count.permits > 0 && (
              <span className="badge badge-blue" title="Genehmigungen">
                {campaign._count.permits}
              </span>
            )}
            {campaign._count.routes > 0 && (
              <span className="badge badge-green" title="Touren">
                {campaign._count.routes}
              </span>
            )}
            {campaign._count.photos > 0 && (
              <span className="badge badge-gray" title="Fotos">
                {campaign._count.photos}
              </span>
            )}
          </div>
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
  const router = useRouter();
  const [draggedCampaign, setDraggedCampaign] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<CampaignStatus | null>(null);

  const getCampaignsByColumn = (columnId: CampaignStatus) => {
    return campaigns.filter((c) => c.status === columnId);
  };

  const handleDragStart = (campaignId: string) => (e: React.DragEvent) => {
    setDraggedCampaign(campaignId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (columnId: CampaignStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (columnId: CampaignStatus) => {
    if (!draggedCampaign) return;

    const campaign = campaigns.find((c) => c.id === draggedCampaign);
    if (!campaign || campaign.status === columnId) {
      setDraggedCampaign(null);
      setDragOverColumn(null);
      return;
    }

    try {
      // Update Campaign Status via API
      const response = await fetch(`/api/campaigns/${draggedCampaign}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: columnId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update campaign status");
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error updating campaign:", error);
      alert("Fehler beim Aktualisieren der Kampagne");
    } finally {
      setDraggedCampaign(null);
      setDragOverColumn(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-max">
        {KANBAN_COLUMNS.map((column) => {
          const columnCampaigns = getCampaignsByColumn(column.id);
          const isDragOver = dragOverColumn === column.id;
          
          return (
            <div
              key={column.id}
              className="w-72 flex-shrink-0"
              onDragOver={handleDragOver(column.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className={`${column.bgColor} px-4 py-3 rounded-t-xl border border-gray-200 ${
                isDragOver ? "ring-2 ring-blue-400" : ""
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-sm ${column.textColor}`}>
                    {column.title}
                  </h3>
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-semibold text-gray-600 bg-white rounded-full">
                    {columnCampaigns.length}
                  </span>
                </div>
              </div>
              
              {/* Column Content */}
              <div className={`bg-gray-50 rounded-b-xl border-x border-b border-gray-200 p-3 min-h-[600px] space-y-3 transition-colors ${
                isDragOver ? "bg-blue-50" : ""
              }`}>
                {columnCampaigns.map((campaign) => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign}
                    onDragStart={handleDragStart(campaign.id)}
                  />
                ))}
                
                {columnCampaigns.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <div className="text-3xl mb-2 opacity-30">📭</div>
                    <p className="text-xs">Keine Kampagnen</p>
                    {isDragOver && (
                      <p className="text-xs mt-2 text-blue-600 font-medium">
                        Hier ablegen
                      </p>
                    )}
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

