"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Kampagnen", href: "/campaigns", icon: "🎯" },
  { name: "Genehmigungen", href: "/permits", icon: "📋" },
  { name: "Touren", href: "/tours", icon: "🚗" },
  { name: "Kommunen", href: "/cities", icon: "🏛️" },
  { name: "Kunden", href: "/clients", icon: "👥" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 flex flex-col z-10">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">PlakatPro</div>
            <div className="text-xs text-gray-500">Kampagnen-Manager</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="font-medium mb-1">Version 1.0.0</div>
          <div>© 2025 Werbeinsel</div>
        </div>
      </div>
    </aside>
  );
}

