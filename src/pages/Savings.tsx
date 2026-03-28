import { useApp } from "@/context/AppContext";
import { Navigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ParticleBackground from "@/components/ParticleBackground";
import { PiggyBank, Users, ArrowRight } from "lucide-react";

export default function Savings() {
  const { isLoggedIn, groups, transactions } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  const totalSaved = transactions.filter(t => t.status === "approved").reduce((sum, t) => sum + t.amount, 0);
  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10">
        <div className="mb-8 animate-fade-up">
          <h1 className="gold-gradient-text text-3xl font-cinzel font-bold">My Savings</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your savings progress across all groups</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="glass-card-static rounded-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/25 flex items-center justify-center mb-4">
              <PiggyBank size={22} className="text-gold" />
            </div>
            <p className="text-muted-foreground text-sm">Total Saved</p>
            <p className="gold-gradient-text font-cinzel font-black text-3xl mt-1">₦{totalSaved.toLocaleString()}</p>
          </div>
          <div className="glass-card-static rounded-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/25 flex items-center justify-center mb-4">
              <Users size={22} className="text-gold" />
            </div>
            <p className="text-muted-foreground text-sm">Groups Joined</p>
            <p className="gold-gradient-text font-cinzel font-black text-3xl mt-1">{groups.length}</p>
          </div>
        </div>
        <div className="glass-card-static rounded-2xl p-6">
          <h2 className="gold-gradient-text font-cinzel font-bold text-lg mb-4">Available Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.slice(0, 6).map(g => (
              <Link key={g.id} to={`/groups/${g.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/5 border border-gold/10 hover:border-gold/30 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center shrink-0"><Users size={14} className="text-gold" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-xs font-semibold truncate">{g.name}</p>
                  <p className="text-muted-foreground text-[10px]">₦{g.contributionAmount.toLocaleString()} / {g.cycleType}</p>
                </div>
                <ArrowRight size={12} className="text-gold shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
