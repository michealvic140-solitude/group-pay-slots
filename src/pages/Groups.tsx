import { useApp } from "@/context/AppContext";
import GroupCard from "@/components/GroupCard";
import ParticleBackground from "@/components/ParticleBackground";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Groups() {
  const { groups } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "biweekly" | "monthly">("all");

  const filtered = groups.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || g.cycleType === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative">
      <ParticleBackground />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12 animate-fade-up">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Available Circles</p>
          <h1 className="gold-gradient-text text-4xl md:text-5xl font-cinzel font-bold">Savings Groups</h1>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">Browse all savings circles and choose one that matches your financial goals.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-up delay-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..." className="luxury-input pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "daily", "weekly", "biweekly", "monthly"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filter === f ? "btn-gold" : "btn-glass"}`}>{f}</button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20"><p className="text-muted-foreground">No groups found matching your criteria.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(g => <GroupCard key={g.id} group={g} />)}
          </div>
        )}
      </div>
    </div>
  );
}
