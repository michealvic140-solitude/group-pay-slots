import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from "@/components/ParticleBackground";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setValidToken(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => navigate("/login"), 3000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #1a1200 0%, #0a0a0a 60%, #000 100%)" }}>
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="rounded-2xl p-8 border border-white/10"
          style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(32px)", boxShadow: "0 0 60px rgba(234,179,8,0.08), 0 32px 80px rgba(0,0,0,0.7)" }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center">
              <span className="text-obsidian font-cinzel font-black text-xs">RA</span>
            </div>
            <span className="gold-gradient-text font-cinzel font-bold text-sm tracking-widest">REJOICE TRUST AJO</span>
          </div>
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-600/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="gold-gradient-text font-cinzel font-bold text-xl mb-3">Password Updated!</h2>
              <p className="text-muted-foreground text-sm mb-2">Your password has been changed successfully.</p>
              <p className="text-muted-foreground text-xs">Redirecting to login...</p>
            </div>
          ) : !validToken ? (
            <div className="text-center">
              <h2 className="gold-gradient-text font-cinzel font-bold text-xl mb-3">Invalid Link</h2>
              <p className="text-muted-foreground text-sm mb-6">This reset link is invalid or has expired. Please request a new one.</p>
              <Link to="/forgot-password" className="btn-gold w-full py-3 rounded-xl font-bold text-sm block text-center">Request New Link</Link>
            </div>
          ) : (
            <>
              <h1 className="gold-gradient-text font-cinzel font-black text-2xl mb-2">Reset Password</h1>
              <p className="text-muted-foreground text-xs mb-6">Enter your new password below.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 8 chars)"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "hsl(45,100%,90%)", outline: "none" }}
                    onFocus={e => { e.target.style.borderColor = "rgba(234,179,8,0.5)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                    required minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold p-1">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password"
                  className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "hsl(45,100%,90%)", outline: "none" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(234,179,8,0.5)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  required />
                {error && <div className="py-2 px-3 rounded-lg bg-red-900/20 border border-red-600/30 text-red-400 text-xs">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 transition-all"
                  style={{ background: "linear-gradient(135deg, hsl(45,93%,47%), hsl(38,92%,42%))", color: "#0a0a0a", boxShadow: "0 4px 20px rgba(234,179,8,0.4)" }}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
