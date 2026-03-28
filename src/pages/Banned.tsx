import { Shield, AlertTriangle, MessageSquare } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ParticleBackground from "@/components/ParticleBackground";

export default function Banned() {
  const { contactInfo } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #1a0000 0%, #0a0a0a 60%, #000 100%)" }}>
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md mx-4 text-center animate-scale-in">
        <div className="rounded-2xl p-8 border border-red-600/30"
          style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(32px)" }}>
          <div className="w-20 h-20 rounded-full bg-red-900/30 border border-red-600/40 flex items-center justify-center mx-auto mb-6">
            <Shield size={36} className="text-red-400" />
          </div>
          <h1 className="font-cinzel font-black text-2xl text-red-400 mb-3">Account Banned</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Your account has been banned from the Rejoice Trust Ajo platform. You cannot access your account until an administrator unbans you.
          </p>
          <div className="glass-card-static rounded-xl p-4 mb-6 border border-red-600/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-400" />
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">How to Get Unbanned</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Contact the platform administrator through one of the channels below to appeal your ban.
              Ensure you have not violated any platform terms before requesting an unban.
            </p>
          </div>
          <div className="space-y-2">
            {contactInfo.whatsapp && (
              <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-900/20 border border-emerald-600/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-900/40 transition-all">
                <MessageSquare size={14} /> Contact on WhatsApp
              </a>
            )}
            {contactInfo.email && (
              <a href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-900/20 border border-blue-600/30 text-blue-400 text-sm font-semibold hover:bg-blue-900/40 transition-all">
                <MessageSquare size={14} /> Email Support: {contactInfo.email}
              </a>
            )}
          </div>
          <p className="text-muted-foreground/40 text-xs mt-6">
            Rejoice Trust Ajo Platform
          </p>
        </div>
      </div>
    </div>
  );
}
