import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus, Edit, Trash2, Upload, X, Save } from "lucide-react";

interface GuideTip {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  sort_order?: number;
}

export default function GuideTips() {
  const { isLoggedIn, currentUser } = useApp();
  const [tips, setTips] = useState<GuideTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTip, setEditingTip] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tipTitle, setTipTitle] = useState("");
  const [tipContent, setTipContent] = useState("");
  const [tipFile, setTipFile] = useState<File | null>(null);
  const [tipOrder, setTipOrder] = useState(0);
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "moderator";

  const loadTips = async () => {
    const { data } = await supabase.from("guide_tips").select("*").order("created_at");
    if (data) setTips(data as unknown as GuideTip[]);
    setLoading(false);
  };

  useEffect(() => { loadTips(); }, []);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const saveTip = async () => {
    if (!tipTitle || !tipContent) return;
    let imageUrl: string | undefined;
    if (tipFile) {
      const path = `tips/${Date.now()}_${tipFile.name}`;
      const { data: up } = await supabase.storage.from("announcements").upload(path, tipFile);
      if (up) { const { data: u } = supabase.storage.from("announcements").getPublicUrl(up.path); imageUrl = u.publicUrl; }
    }
    if (editingTip) {
      await supabase.from("guide_tips").update({ title: tipTitle, content: tipContent,  ...(imageUrl ? { image_url: imageUrl } : {}) }).eq("id", editingTip);
    } else {
      await supabase.from("guide_tips").insert({ title: tipTitle, content: tipContent,  image_url: imageUrl || null });
    }
    setShowForm(false); setEditingTip(null); setTipTitle(""); setTipContent(""); setTipFile(null); setTipOrder(0);
    await loadTips();
  };

  const deleteTip = async (id: string) => {
    if (!confirm("Delete this tip?")) return;
    await supabase.from("guide_tips").delete().eq("id", id);
    await loadTips();
  };

  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="gold-gradient-text text-3xl font-cinzel font-bold flex items-center gap-3"><BookOpen size={28} /> Guide Tips</h1>
            <p className="text-muted-foreground text-sm mt-1">Learn how to use the platform</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setShowForm(true); setEditingTip(null); setTipTitle(""); setTipContent(""); setTipOrder(tips.length + 1); }}
              className="btn-gold px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={14} /> Add Tip</button>
          )}
        </div>

        {isAdmin && showForm && (
          <div className="glass-card-static rounded-2xl p-6 mb-8 border border-gold/20 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="gold-text font-cinzel font-bold">{editingTip ? "Edit Tip" : "New Tip"}</h2>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3"><label className="luxury-label">Title *</label><input value={tipTitle} onChange={e => setTipTitle(e.target.value)} className="luxury-input" /></div>
                <div><label className="luxury-label">Order</label><input type="number" value={tipOrder} onChange={e => setTipOrder(parseInt(e.target.value) || 0)} className="luxury-input" /></div>
              </div>
              <div><label className="luxury-label">Content *</label><textarea value={tipContent} onChange={e => setTipContent(e.target.value)} className="luxury-input resize-none h-32" /></div>
              <div>
                <label className="luxury-label">Image (Optional)</label>
                <label className="btn-glass px-4 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2 w-fit">
                  <Upload size={14} />{tipFile ? tipFile.name : "Choose Image"}
                  <input type="file" className="hidden" onChange={e => setTipFile(e.target.files?.[0] || null)} accept="image/*" />
                </label>
              </div>
              <button onClick={saveTip} className="btn-gold w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Save size={14} />{editingTip ? "Update Tip" : "Add Tip"}</button>
            </div>
          </div>
        )}

        {loading ? <div className="text-center py-12 text-muted-foreground">Loading tips...</div> : (
          <div className="space-y-4">
            {tips.map((tip, i) => (
              <div key={tip.id} className="glass-card-static rounded-2xl p-6 border border-gold/15 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                      <span className="text-gold font-cinzel font-black text-sm">{String(0).padStart(2, "0")}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="gold-text font-cinzel font-bold text-base mb-2">{tip.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{tip.content}</p>
                      {tip.image_url && <img src={tip.image_url} alt="" className="mt-3 rounded-xl max-h-48 object-cover border border-white/10" />}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditingTip(tip.id); setTipTitle(tip.title); setTipContent(tip.content); setTipOrder(0); setShowForm(true); }}
                        className="p-1.5 rounded-lg hover:bg-gold/10 text-muted-foreground hover:text-gold"><Edit size={14} /></button>
                      <button onClick={() => deleteTip(tip.id)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-muted-foreground hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {tips.length === 0 && <div className="text-center py-12 text-muted-foreground">No guide tips yet.</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
