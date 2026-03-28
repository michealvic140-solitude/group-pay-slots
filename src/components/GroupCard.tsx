import { Group } from "@/context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { Users, Calendar } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const { isLoggedIn } = useApp();
  const navigate = useNavigate();
  const remaining = group.totalSlots - group.filledSlots;
  const fillPercent = (group.filledSlots / group.totalSlots) * 100;

  const cycleColors: Record<string, string> = {
    daily: "text-emerald-400",
    weekly: "text-sky-400",
    biweekly: "text-indigo-400",
    monthly: "text-purple-400",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate("/login", { state: { message: "Please sign in to view group details", redirect: `/groups/${group.id}` } });
    }
  };

  return (
    <div className="glass-card p-6 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="gold-gradient-text text-lg font-cinzel font-bold leading-tight">{group.name}</h3>
          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{group.description}</p>
        </div>
        {group.isLive && <span className="live-badge ml-3 shrink-0">● LIVE</span>}
      </div>
      <div className="mb-3 p-3 rounded-xl bg-gold/5 border border-gold/15">
        <p className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1">Deposit to Receive</p>
        <p className="text-foreground font-bold">
          <span className="text-gold">₦{group.contributionAmount.toLocaleString()}</span>
          {group.payoutAmount > 0 && <span className="text-muted-foreground"> → </span>}
          {group.payoutAmount > 0 && <span className="text-emerald-400">₦{group.payoutAmount.toLocaleString()}</span>}
        </p>
        <p className="text-muted-foreground text-[10px] capitalize mt-1">
          <Calendar size={10} className="inline mr-1" />{group.cycleType}
          {group.disbursementDays > 0 && ` · ${group.disbursementDays} days`}
        </p>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground flex items-center gap-1"><Users size={11} /> {group.filledSlots} / {group.totalSlots} slots</span>
          <span className="text-gold">{remaining} remaining</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${fillPercent}%`, background: fillPercent > 80 ? "linear-gradient(90deg,#ef4444,#dc2626)" : "linear-gradient(90deg,hsl(45,93%,47%),hsl(45,100%,60%))" }} />
        </div>
      </div>
      <Link to={`/groups/${group.id}`} onClick={handleClick} className="btn-gold w-full block text-center py-2.5 rounded-lg text-sm font-semibold">
        View Group
      </Link>
    </div>
  );
}
