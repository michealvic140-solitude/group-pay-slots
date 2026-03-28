import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, User, LayoutDashboard, Shield, Menu, X, BookOpen, Banknote } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import rtaspLogo from "@/assets/rtrasp-logo.png";

export default function Navbar() {
  const { currentUser, isLoggedIn, notifications, markNotificationsRead, setCurrentUser, refreshNotifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Realtime notifications subscription
  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = supabase.channel(`notif-${currentUser.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` }, () => {
        refreshNotifications();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id, refreshNotifications]);

  const unread = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    navigate("/");
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const navLinks = [
    { to: "/", label: "Home", exact: true },
    { to: "/groups", label: "Groups" },
    ...(isLoggedIn ? [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/disbursements", label: "Payouts", icon: Banknote },
      { to: "/guide", label: "Guide", icon: BookOpen },
      { to: "/profile", label: "Profile", icon: User },
    ] : []),
    ...(currentUser?.role === "admin" || currentUser?.role === "moderator" ? [
      { to: "/admin", label: "Admin", icon: Shield }
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 border-b border-gold/15"
      style={{ background: "rgba(10,10,10,0.82)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img src={rtaspLogo} alt="RTRASP" className="w-10 h-10 rounded-full object-contain" />
          <div className="hidden md:block">
            <span className="font-cinzel font-black text-sm tracking-wide leading-none block"
              style={{ background: "linear-gradient(135deg, #d4a017, #f5d060, #c8860a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              RTRASP
            </span>
            <span className="text-muted-foreground text-[8px] tracking-widest uppercase leading-tight block">Rejoice Trust Rotation Ajo</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-wrap">
          {navLinks.map(link => {
            const active = link.exact ? location.pathname === link.to : isActive(link.to);
            return (
              <Link key={link.to} to={link.to}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 ${
                  active ? "bg-gold/15 border-gold/40 text-gold" : "bg-transparent border-transparent text-muted-foreground hover:text-gold hover:border-gold/20 hover:bg-gold/5"
                }`}>
                {link.icon && <link.icon size={11} />}{link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <>
              {/* Bell with red badge */}
              <div className="relative">
                <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markNotificationsRead(); }}
                  className="relative p-2 rounded-lg border border-gold/20 bg-gold/5 hover:bg-gold/10 transition-all">
                  <Bell size={15} className="text-gold" />
                  {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-pulse shadow-lg shadow-red-500/30">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 border border-gold/20 rounded-xl p-2 animate-scale-in z-50 shadow-2xl max-h-96 overflow-y-auto scrollbar-gold"
                    style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)" }}>
                    <p className="gold-text text-xs font-cinzel px-3 py-2 border-b border-gold/10 mb-1">NOTIFICATIONS</p>
                    {notifications.length === 0 ? (
                      <p className="text-muted-foreground text-sm p-3">No notifications yet</p>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`px-3 py-2 rounded-lg mb-1 text-xs ${n.read ? "text-muted-foreground" : "text-foreground bg-gold/5 border border-gold/10"}`}>
                        <p>{n.message}</p>
                        <p className="text-muted-foreground/50 text-[9px] mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg border border-gold/20 bg-gold/5 hover:bg-gold/10 transition-all text-gold">
                {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
              </button>

              {/* Sign out */}
              <button onClick={handleLogout}
                className="hidden md:flex px-4 py-1.5 rounded-lg text-xs font-bold border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 transition-all items-center gap-1.5">
                <LogOut size={11} /><span>SIGN OUT</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-1.5 rounded-lg text-xs font-bold border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 transition-all">SIGN IN</Link>
              <Link to="/register" className="btn-gold px-4 py-1.5 rounded-lg text-xs font-bold">SIGN UP</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && isLoggedIn && (
        <div className="md:hidden mt-3 pb-3 border-t border-gold/10 pt-3 animate-fade-up">
          <div className="flex flex-col gap-1 px-2">
            {navLinks.map(link => {
              const active = link.exact ? location.pathname === link.to : isActive(link.to);
              return (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    active ? "bg-gold/15 border border-gold/40 text-gold" : "text-muted-foreground hover:text-gold hover:bg-gold/5"
                  }`}>
                  {link.icon && <link.icon size={14} />}{link.label}
                </Link>
              );
            })}
            <button onClick={handleLogout}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-900/20 transition-all flex items-center gap-2 mt-2">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
