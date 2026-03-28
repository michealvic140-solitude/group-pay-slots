import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from "@/components/ParticleBackground";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) setError(err.message);
    else setSent(true);
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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-600/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="gold-gradient-text font-cinzel font-bold text-xl mb-3">Email Sent!</h2>
              <p className="text-muted-foreground text-sm mb-6">We've sent a password reset link to <span className="text-gold">{email}</span>. Check your inbox and follow the instructions.</p>
              <Link to="/login" className="btn-gold w-full py-3 rounded-xl font-bold text-sm block text-center">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="gold-gradient-text font-cinzel font-black text-2xl mb-2">Forgot Password?</h1>
              <p className="text-muted-foreground text-xs mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
                  className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "hsl(45,100%,90%)", outline: "none" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(234,179,8,0.5)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  required />
                {error && <div className="py-2 px-3 rounded-lg bg-red-900/20 border border-red-600/30 text-red-400 text-xs">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 transition-all"
                  style={{ background: "linear-gradient(135deg, hsl(45,93%,47%), hsl(38,92%,42%))", color: "#0a0a0a", boxShadow: "0 4px 20px rgba(234,179,8,0.4)" }}>
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />Sending...</span> : "Send Reset Link"}
                </button>
              </form>
              <div className="mt-5 text-center text-xs text-muted-foreground">
                <Link to="/login" className="hover:text-gold transition-colors">← Back to Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
