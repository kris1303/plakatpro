import { prisma } from "@/lib/prisma";
import TourList from "@/components/Mobile/TourList";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ToursPage() {
  const tours = await prisma.route.findMany({
    include: {
      installer: true,
      campaign: true,
      _count: {
        select: { stops: true },
      },
    },
    orderBy: { plannedDate: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-blue-600 mb-4 inline-block hover:text-blue-700">
          ← Zurück
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🚗 Meine Touren
        </h1>
        <p className="text-gray-600">
          Plakatierer-App - Übersicht aller Touren
        </p>
      </div>

      {/* Filter Tabs (TODO: Implementieren) */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button className="btn-primary px-4 py-2 text-sm whitespace-nowrap">
          Alle
        </button>
        <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50">
          Geplant
        </button>
        <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50">
          Unterwegs
        </button>
        <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50">
          Fertig
        </button>
      </div>

      {/* Tour List */}
      <TourList tours={tours} />
    </div>
  );
}

