"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  color: string | null;
  msrp: number;
  status: string;
  mileage: number;
  features: string[];
  imageUrls: string[];
}

export default function CustomerInventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    setLoading(true);
    const params = new URLSearchParams({ status: "AVAILABLE" });
    if (maxPrice) params.set("maxPrice", maxPrice);

    const res = await fetch(`/api/inventory?${params}`);
    const data = await res.json();
    setVehicles(data.vehicles ?? []);
    setLoading(false);
  }

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      String(v.year).includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F0F4FB]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
          <Link href="/customer/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-[0.08em] transition-colors">
            ← Dashboard
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <h1 className="font-semibold text-slate-900 tracking-tight">Available Inventory</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            placeholder="Search by make, model, or year…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-36 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
            />
            <button
              onClick={fetchVehicles}
              className="bg-navy text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-navy-hover transition-colors tracking-wide"
            >
              Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">No vehicles match your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((vehicle) => (
              <div key={vehicle.id} className="bg-white border border-slate-200 rounded-md overflow-hidden hover:border-slate-400 hover:shadow-sm transition-all">
                {/* Image */}
                <div className="h-40 bg-slate-100 flex items-center justify-center">
                  {vehicle.imageUrls.length > 0 ? (
                    <img src={vehicle.imageUrls[0]} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5m-7 7a2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2 2 2 0 01-2 2zm7 0a2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2 2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 tracking-tight">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.trim && (
                    <p className="text-xs text-slate-500 mt-0.5">{vehicle.trim}{vehicle.color ? ` · ${vehicle.color}` : ""}</p>
                  )}
                  <p className="text-lg font-bold text-slate-900 mt-2 font-mono">
                    ${vehicle.msrp.toLocaleString()}
                  </p>
                  {vehicle.mileage > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">{vehicle.mileage.toLocaleString()} mi</p>
                  )}
                  {vehicle.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 mb-3">
                      {vehicle.features.slice(0, 3).map((f) => (
                        <span key={f} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 font-medium uppercase tracking-[0.05em]">{f}</span>
                      ))}
                      {vehicle.features.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{vehicle.features.length - 3}</span>
                      )}
                    </div>
                  )}
                  <Link href="/customer/chat">
                    <button className="w-full bg-navy text-white rounded-md py-2 text-sm font-semibold hover:bg-navy-hover transition-colors mt-1">
                      Ask About This Car
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
