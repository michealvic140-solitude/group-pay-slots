import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { Banknote, Eye, X } from "lucide-react";

interface Disbursement {
  id: string;
  group_name: string;
  seat_numbers?: string;
  amount: number;
  description?: string;
  image_url?: string;
  code: string;
  created_at: string;
  admin_name: string;
}

export default function Disbursements() {
  const { isLoggedIn, currentUser } = useApp();
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data } = await supabase.from("disbursements").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false });
      if (data) setDisbursements(data as Disbursement[]);
      setLoading(false);
    })();
  }, [currentUser]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10">
        <div className="mb-8 animate-fade-up">
          <h1 className="gold-gradient-text text-3xl font-cinzel font-bold flex items-center gap-3"><Banknote size={28} /> My Disbursements</h1>
          <p className="text-muted-foreground text-sm mt-1">View your payout records</p>
        </div>

        {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : disbursements.length === 0 ? (
          <div className="glass-card-static rounded-2xl p-12 text-center">
            <Banknote size={40} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No disbursements yet. When you receive a payout, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disbursements.map(d => (
              <div key={d.id} className="glass-card-static rounded-2xl p-5 border border-gold/15 animate-fade-up">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold font-mono text-xs font-bold">{d.code}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-600/30 bg-emerald-900/20 text-emerald-400">DISBURSED</span>
                    </div>
                    <h3 className="text-foreground font-semibold">{d.group_name}</h3>
                    {d.seat_numbers && <p className="text-muted-foreground text-xs">Seats: {d.seat_numbers}</p>}
                    <p className="gold-gradient-text font-cinzel font-black text-2xl mt-2">₦{d.amount.toLocaleString()}</p>
                    {d.description && <p className="text-muted-foreground text-xs mt-2">{d.description}</p>}
                    <p className="text-muted-foreground/50 text-[10px] mt-2">By {d.admin_name} · {new Date(d.created_at).toLocaleString()}</p>
                  </div>
                  {d.image_url && (
                    <button onClick={() => setViewImage(d.image_url!)} className="btn-glass px-3 py-2 rounded-xl text-xs flex items-center gap-1">
                      <Eye size={12} />Proof
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image viewer */}
      {viewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setViewImage(null)}>
          <div className="relative max-w-2xl w-full">
            <button onClick={() => setViewImage(null)} className="absolute -top-10 right-0 text-white"><X size={24} /></button>
            <img src={viewImage} alt="Disbursement proof" className="w-full rounded-2xl border border-gold/20" />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
