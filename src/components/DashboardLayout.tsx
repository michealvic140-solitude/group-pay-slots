import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, PiggyBank, Shield, Receipt, HeadphonesIcon,
  Settings, History, Menu, X
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",    to: "/dashboard" },
  { icon: PiggyBank,       label: "Savings",       to: "/savings" },
  { icon: Shield,          label: "Groups",        to: "/groups" },
  { icon: Receipt,         label: "Transactions",  to: "/transactions" },
  { icon: History,         label: "History",       to: "/history" },
  { icon: HeadphonesIcon,  label: "Support",       to: "/support" },
  { icon: Settings,        label: "Settings",      to: "/profile" },
];

interface Props {
  children: React.ReactNode;
  activeTab?: string;
}

export default function DashboardLayout({ children, activeTab }: Props) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex relative overflow-hidden pt-16">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-gold/10 z-10 pt-6 pb-6 fixed top-16 bottom-0 left-0"
        style={{ background: "rgba(8,8,8,0.90)", backdropFilter: "blur(20px)" }}>
        <div className="px-5 mb-8 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center shadow animate-glow-pulse shrink-0">
            <span className="text-obsidian font-cinzel font-black text-xs">RA</span>
          </div>
          <span className="gold-gradient-text font-cinzel font-bold text-sm tracking-wide">RTA</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(item => {
            const isActive = location.pathname === item.to || activeTab === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-gold/15 border border-gold/25 text-gold" : "text-muted-foreground hover:text-foreground hover:bg-gold/5 border border-transparent"
                }`}>
                <item.icon size={16} className={isActive ? "text-gold" : ""} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-20 left-4 z-50 p-2 rounded-xl border border-gold/30 bg-gold/10 text-gold"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute top-16 left-0 bottom-0 w-64 border-r border-gold/10 pt-6 pb-6 animate-scale-in"
            style={{ background: "rgba(8,8,8,0.97)", backdropFilter: "blur(20px)" }}
            onClick={e => e.stopPropagation()}>
            <div className="px-5 mb-8 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center shadow animate-glow-pulse shrink-0">
                <span className="text-obsidian font-cinzel font-black text-xs">RA</span>
              </div>
              <span className="gold-gradient-text font-cinzel font-bold text-sm tracking-wide">REJOICE AJO</span>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {NAV.map(item => {
                const isActive = location.pathname === item.to || activeTab === item.to;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? "bg-gold/15 border border-gold/25 text-gold" : "text-muted-foreground hover:text-foreground hover:bg-gold/5 border border-transparent"
                    }`}>
                    <item.icon size={16} className={isActive ? "text-gold" : ""} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="md:ml-52 flex-1 min-w-0 relative z-10 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  );
}
