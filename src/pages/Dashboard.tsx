import { useApp } from "@/context/AppContext";
import { Navigate, Link } from "react-router-dom";
import { Star, Users, Calendar, Wallet, Receipt, Settings, ChevronRight, User } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { currentUser, isLoggedIn, transactions, groups } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const activeGroups = groups.filter(g => g.isLive).length;
  const totalPaid = currentUser?.totalPaid || 0;
  const recentTx = transactions.slice(0, 5);

  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10">
        {/* Profile badge */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 hover:bg-gold/10 transition-all text-sm">
            <Settings size={13} className="text-muted-foreground" />
            <span className="text-foreground font-medium text-xs">{currentUser?.username}</span>
            <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
              {currentUser?.profilePicture ? <img src={currentUser.profilePicture} className="w-7 h-7 rounded-full object-cover" alt="" /> : <User size={12} className="text-obsidian" />}
            </div>
            <ChevronRight size={12} className="text-muted-foreground" />
          </Link>
        </div>

        {/* Welcome heading */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-cinzel font-black text-3xl md:text-4xl mb-1"
            style={{ background: "linear-gradient(135deg, hsl(45,93%,47%), hsl(45,100%,65%), hsl(38,92%,50%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            WELCOME BACK,
          </h1>
          <h2 className="font-cinzel font-black text-3xl md:text-4xl"
            style={{ background: "linear-gradient(135deg, hsl(45,93%,47%), hsl(45,100%,65%), hsl(38,92%,50%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {currentUser?.firstName?.toUpperCase() || "USER"}
            {currentUser?.isVip && <span className="vip-badge ml-3 align-middle text-base">✦ VIP</span>}
          </h2>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Star, label: "Trust Score", value: `${currentUser?.trustScore || 50}%`, sub: "★", color: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.25)" },
            { icon: Users, label: "Active Groups", value: String(activeGroups), sub: "groups", color: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.25)" },
            { icon: Wallet, label: "Total Paid", value: `₦${totalPaid.toLocaleString()}`, sub: "cumulative", color: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.25)" },
          ].map((s, i) => (
            <div key={s.label} className="rounded-2xl p-6 flex flex-col gap-3 animate-fade-up"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${s.border}`, backdropFilter: "blur(16px)", animationDelay: `${i * 0.1}s` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: s.color, border: `1px solid ${s.border}` }}>
                <s.icon size={22} className="text-gold" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">{s.label}</p>
                <p className="font-cinzel font-black text-3xl text-foreground mt-1">{s.value}<span className="text-gold text-lg ml-1">{s.sub}</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* My Groups + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden animate-fade-up delay-300"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(234,179,8,0.15)", backdropFilter: "blur(16px)" }}>
            <div className="px-5 py-4 border-b border-gold/10 flex items-center justify-between">
              <h2 className="gold-gradient-text font-cinzel font-bold text-base">Your Circles</h2>
              <Link to="/groups" className="text-gold text-xs hover:underline">View All</Link>
            </div>
            <div className="p-4 space-y-2">
              {groups.slice(0, 4).map(g => (
                <Link key={g.id} to={`/groups/${g.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/5 hover:border-gold/20 border border-transparent transition-all group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(234,179,8,0.2),rgba(234,179,8,0.08))", border: "1px solid rgba(234,179,8,0.2)" }}>
                    <Users size={14} className="text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-semibold truncate">{g.name}</p>
                    <p className="text-muted-foreground text-[10px]">₦{g.contributionAmount.toLocaleString()} / {g.cycleType}</p>
                  </div>
                  {g.isLive && <span className="live-badge text-[8px] px-1.5">● LIVE</span>}
                  <ChevronRight size={12} className="text-muted-foreground group-hover:text-gold transition-colors" />
                </Link>
              ))}
              {groups.length === 0 && <p className="text-muted-foreground text-xs p-3 text-center">No groups yet. <Link to="/groups" className="text-gold underline">Join one!</Link></p>}
            </div>
          </div>

          <div className="lg:col-span-3 rounded-2xl overflow-hidden animate-fade-up delay-300"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(234,179,8,0.15)", backdropFilter: "blur(16px)" }}>
            <div className="px-5 py-4 border-b border-gold/10 flex items-center justify-between">
              <h2 className="gold-gradient-text font-cinzel font-bold text-base">Recent Transactions</h2>
              <Link to="/transactions" className="text-gold text-xs hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gold/5">
              {recentTx.length === 0 && <p className="text-muted-foreground text-xs p-5 text-center">No transactions yet.</p>}
              {recentTx.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(234,179,8,0.1)" }}>
                    <Receipt size={14} className="text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-semibold truncate">{tx.groupName}</p>
                    <p className="text-muted-foreground text-[10px]">{tx.code} · {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-xs font-bold">₦{tx.amount.toLocaleString()}</p>
                    <span className={`status-${tx.status}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
