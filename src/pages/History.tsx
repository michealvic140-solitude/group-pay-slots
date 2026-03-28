import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ParticleBackground from "@/components/ParticleBackground";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { History as HistoryIcon } from "lucide-react";

export default function History() {
  const { isLoggedIn, currentUser } = useApp();
  const [logs, setLogs] = useState<{id: string; action: string; type: string; created_at: string}[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from("audit_logs").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setLogs(data as typeof logs);
    });
  }, [currentUser?.id]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10">
        <div className="mb-8 animate-fade-up">
          <h1 className="gold-gradient-text text-3xl font-cinzel font-bold">Activity History</h1>
          <p className="text-muted-foreground text-sm mt-1">Your full activity audit log</p>
        </div>
        <div className="glass-card-static rounded-2xl overflow-hidden">
          <div className="divide-y divide-gold/5">
            {logs.length === 0 && (
              <div className="py-12 text-center">
                <HistoryIcon size={32} className="mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No activity history yet.</p>
              </div>
            )}
            {logs.map(log => (
              <div key={log.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-foreground text-sm">{log.action}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{log.type}</p>
                  </div>
                  <p className="text-muted-foreground text-xs shrink-0">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
