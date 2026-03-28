import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ParticleBackground from "@/components/ParticleBackground";
import { Receipt } from "lucide-react";

export default function Transactions() {
  const { isLoggedIn, transactions } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10">
        <div className="mb-8 animate-fade-up">
          <h1 className="gold-gradient-text text-3xl font-cinzel font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">All your payment history</p>
        </div>
        <div className="glass-card-static rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gold/15 bg-gold/5">
                {["Code","Group","Amount","Seats","Status","Date","Proof"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground"><Receipt size={32} className="mx-auto mb-2 opacity-30" /><p>No transactions yet.</p></td></tr>
                )}
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-gold text-[10px]">{tx.code}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{tx.groupName}</td>
                    <td className="px-4 py-3 font-bold text-foreground">₦{tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tx.seatNumbers || "-"}</td>
                    <td className="px-4 py-3"><span className={`status-${tx.status}`}>{tx.status}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{tx.screenshotUrl ? <a href={tx.screenshotUrl} target="_blank" rel="noreferrer" className="text-gold underline text-[10px]">View</a> : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
