import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from "@/components/ParticleBackground";
import rtaspLogo from "@/assets/rtrasp-logo.png";

const Coin = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute rounded-full flex items-center justify-center font-black select-none pointer-events-none"
    style={{ width: 56, height: 56, background: "radial-gradient(circle at 35% 35%, hsl(45,100%,72%), hsl(38,92%,40%), hsl(30,85%,25%))", boxShadow: "0 4px 20px rgba(234,179,8,0.5), inset 0 1px 2px rgba(255,255,255,0.3)", color: "hsl(45,93%,30%)", fontSize: 22, ...style }}>₦</div>
);

const COINS = [
  { top: "4%", left: "2%", animDelay: "0s", scale: 1.1 }, { top: "12%", left: "10%", animDelay: "0.4s", scale: 0.85 },
  { top: "25%", left: "3%", animDelay: "0.8s", scale: 1.2 }, { top: "55%", left: "1%", animDelay: "1.2s", scale: 0.9 },
  { top: "72%", left: "6%", animDelay: "0.2s", scale: 1.0 }, { top: "85%", left: "2%", animDelay: "1.5s", scale: 1.15 },
  { top: "5%", right: "3%", animDelay: "0.6s", scale: 1.05 }, { top: "18%", right: "8%", animDelay: "1.0s", scale: 0.8 },
  { top: "35%", right: "2%", animDelay: "0.3s", scale: 1.3 }, { top: "60%", right: "5%", animDelay: "0.9s", scale: 0.95 },
  { top: "78%", right: "2%", animDelay: "1.4s", scale: 1.1 }, { top: "40%", left: "14%", animDelay: "0.7s", scale: 0.75 },
  { top: "48%", right: "14%", animDelay: "1.1s", scale: 0.85 }, { top: "90%", left: "20%", animDelay: "0.5s", scale: 1.0 },
  { top: "88%", right: "15%", animDelay: "1.3s", scale: 0.9 },
];

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, currentUser, maintenanceMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { redirect?: string })?.redirect || null;
  const message = (location.state as { message?: string })?.message || null;

  // Already logged in
  if (isLoggedIn && currentUser) {
    const dest = redirectTo || (currentUser.role === "admin" || currentUser.role === "moderator" ? "/admin" : "/dashboard");
    navigate(dest, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Check maintenance mode first
      if (maintenanceMode) {
        // Check if the user is admin before blocking
        let loginEmail = identifier;
        if (!identifier.includes("@")) {
          const { data: profile } = await supabase.from("profiles").select("email, role").eq("username", identifier).single();
          if (!profile) { setError("Invalid credentials."); setLoading(false); return; }
          if ((profile as Record<string, unknown>).role !== "admin") {
            setError("The platform is currently under maintenance. Please try again later.");
            setLoading(false);
            return;
          }
          loginEmail = (profile as Record<string, unknown>).email as string;
        } else {
          const { data: profile } = await supabase.from("profiles").select("role").eq("email", identifier).single();
          if (profile && (profile as Record<string, unknown>).role !== "admin") {
            setError("The platform is currently under maintenance. Please try again later.");
            setLoading(false);
            return;
          }
        }
        // Proceed with admin login
        const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (authErr) { setError("Invalid credentials."); setLoading(false); return; }
        if (data.user) {
          navigate("/admin", { replace: true });
        }
        setLoading(false);
        return;
      }

      // Normal login flow
      let loginEmail = identifier;
      if (!identifier.includes("@")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, is_banned, is_frozen, is_restricted")
          .eq("username", identifier)
          .single();
        if (!profile) { setError("Invalid credentials. Please try again."); setLoading(false); return; }
        if ((profile as Record<string, unknown>).is_banned) { navigate("/banned"); return; }
        if ((profile as Record<string, unknown>).is_frozen) { setError("Your account is temporarily frozen. Contact support."); setLoading(false); return; }
        loginEmail = (profile as Record<string, unknown>).email as string;
      }
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (authErr) { setError("Invalid credentials. Please try again."); setLoading(false); return; }
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("is_banned, is_frozen, role").eq("id", data.user.id).single();
        if ((profile as Record<string, unknown>)?.is_banned) { await supabase.auth.signOut(); navigate("/banned"); return; }
        if ((profile as Record<string, unknown>)?.is_frozen) { await supabase.auth.signOut(); setError("Your account is temporarily frozen. Contact support."); setLoading(false); return; }
        const role = (profile as Record<string, unknown>)?.role as string;
        // Log audit
        await supabase.from("audit_logs").insert({ user_id: data.user.id, action: "Logged in", type: "auth" });
        if (redirectTo) navigate(redirectTo, { replace: true });
        else if (role === "admin" || role === "moderator") navigate("/admin", { replace: true });
        else navigate("/dashboard", { replace: true });
      }
    } catch {
      setError("Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #1a1200 0%, #0a0a0a 60%, #000 100%)" }}>
      <ParticleBackground />
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: "linear-gradient(rgba(234,179,8,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.08) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      {COINS.map((c, i) => (
        <Coin key={i} style={{ top: c.top, left: (c as unknown as { left?: string }).left, right: (c as unknown as { right?: string }).right, transform: `scale(${c.scale})`, animationDelay: c.animDelay, zIndex: 1, animation: "float-coin 4s ease-in-out infinite" }} />
      ))}
      <div className="absolute bottom-6 left-6 z-10"><span className="text-muted-foreground/60 text-xs font-mono tracking-wider">V2.0 • Cloud</span></div>
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="rounded-2xl p-8 md:p-10 border border-white/10"
          style={{ background: "rgba(10,10,10,0.80)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", boxShadow: "0 0 60px rgba(234,179,8,0.08), 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <img src={rtaspLogo} alt="RTRASP" className="w-8 h-8 rounded-full object-contain" />
            <span className="gold-gradient-text font-cinzel font-bold text-sm tracking-widest">RTRASP</span>
          </div>
          {maintenanceMode && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-600/30 text-amber-400 text-xs">
              ⚠️ Platform is under maintenance. Only admins can sign in.
            </div>
          )}
          {message && <div className="mb-4 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-600/30 text-amber-400 text-xs">{message}</div>}
          <div className="text-center mb-8 mt-4">
            <h1 className="font-cinzel font-black text-2xl md:text-3xl leading-tight mb-1"
              style={{ background: "linear-gradient(135deg, #d4a017, #f0c040, #c8860a, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "0.05em" }}>REJOICE TRUST ROTATION</h1>
            <h2 className="font-cinzel font-black text-2xl md:text-3xl leading-tight"
              style={{ background: "linear-gradient(135deg, #d4a017, #f0c040, #c8860a, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "0.05em" }}>AJO SAVINGS PLATFORM</h2>
            <p className="text-muted-foreground text-xs mt-3 tracking-widest uppercase">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Email or Username"
              className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "hsl(45,100%,90%)", outline: "none" }}
              onFocus={e => { e.target.style.borderColor = "rgba(234,179,8,0.5)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              required />
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "hsl(45,100%,90%)", outline: "none" }}
                onFocus={e => { e.target.style.borderColor = "rgba(234,179,8,0.5)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors p-1">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <div className="text-center py-2 px-3 rounded-lg bg-red-900/20 border border-red-600/30 text-red-400 text-xs">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-widest disabled:opacity-60 transition-all mt-2"
              style={{ background: loading ? "rgba(234,179,8,0.5)" : "linear-gradient(135deg, hsl(45,93%,47%), hsl(38,92%,42%))", color: "#0a0a0a", boxShadow: loading ? "none" : "0 4px 20px rgba(234,179,8,0.4)" }}>
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />Signing in...</span> : "SIGN IN"}
            </button>
          </form>
          <div className="flex flex-col items-center gap-3 mt-5 text-xs text-muted-foreground">
            {!maintenanceMode && <Link to="/register" className="hover:text-gold transition-colors">New here? <span className="text-gold font-semibold">Create Account</span></Link>}
            <Link to="/forgot-password" className="hover:text-gold transition-colors text-muted-foreground/70">Forgot your password? <span className="text-gold/80 font-semibold">Reset it</span></Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes float-coin{0%{transform:translateY(0) rotate(0deg);opacity:.9}25%{transform:translateY(-18px) rotate(8deg)}50%{transform:translateY(-6px) rotate(-4deg);opacity:1}75%{transform:translateY(-22px) rotate(10deg)}100%{transform:translateY(0) rotate(0deg);opacity:.9}}`}</style>
    </div>
  );
}
