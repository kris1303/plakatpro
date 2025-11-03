import { prisma } from "@/lib/prisma";
import TourList from "@/components/Mobile/TourList";
import Link from "next/link";

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
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-brand-yellow mb-4 inline-block">
          ← Zurück
        </Link>
        <h1 className="text-3xl font-bold text-brand-yellow mb-2">
          🚗 Meine Touren
        </h1>
        <p className="text-gray-400">
          Plakatierer-App - Übersicht aller Touren
        </p>
      </div>

      {/* Filter Tabs (TODO: Implementieren) */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button className="btn-primary px-4 py-2 text-sm whitespace-nowrap">
          Alle
        </button>
        <button className="bg-zinc-800 px-4 py-2 rounded-lg text-sm whitespace-nowrap">
          Geplant
        </button>
        <button className="bg-zinc-800 px-4 py-2 rounded-lg text-sm whitespace-nowrap">
          Unterwegs
        </button>
        <button className="bg-zinc-800 px-4 py-2 rounded-lg text-sm whitespace-nowrap">
          Fertig
        </button>
      </div>

      {/* Tour List */}
      <TourList tours={tours} />
    </div>
  );
}

