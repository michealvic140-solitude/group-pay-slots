import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { HeadphonesIcon, Plus, Upload, X, Send, Lock, Unlock, RefreshCw } from "lucide-react";

interface TicketReply {
  id: string;
  message: string;
  is_admin: boolean;
  attachment_url?: string;
  created_at: string;
}

export default function Support() {
  const { isLoggedIn, currentUser, supportTickets, refreshSupportTickets } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [replying, setReplying] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const loadReplies = async (ticketId: string) => {
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticketId).order("created_at");
    if (data) setReplies(data as TicketReply[]);
    setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  const openTicket = (ticketId: string) => {
    setOpenTicketId(ticketId);
    loadReplies(ticketId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      let attachmentUrl: string | undefined;
      if (file) {
        const path = `${currentUser.id}/${Date.now()}_${file.name}`;
        const { data: uploadData } = await supabase.storage.from("support-attachments").upload(path, file);
        if (uploadData) {
          const { data: urlData } = supabase.storage.from("support-attachments").getPublicUrl(uploadData.path);
          attachmentUrl = urlData.publicUrl;
        }
      }
      await supabase.from("support_tickets").insert({
        user_id: currentUser.id, subject, message, attachment_url: attachmentUrl || null,
      });
      await supabase.from("audit_logs").insert({ user_id: currentUser.id, action: `Submitted support ticket: ${subject}`, type: "support" });
      setSuccess(true); setShowForm(false); setSubject(""); setMessage(""); setFile(null);
      await refreshSupportTickets();
    } catch {}
    setLoading(false);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !currentUser || !openTicketId) return;
    setReplying(true);
    try {
      let attachmentUrl: string | undefined;
      if (replyFile) {
        const path = `${currentUser.id}/reply_${Date.now()}_${replyFile.name}`;
        const { data: up } = await supabase.storage.from("support-attachments").upload(path, replyFile);
        if (up) { const { data: u } = supabase.storage.from("support-attachments").getPublicUrl(up.path); attachmentUrl = u.publicUrl; }
      }
      await supabase.from("ticket_replies").insert({
        ticket_id: openTicketId, user_id: currentUser.id, message: replyText,
        attachment_url: attachmentUrl || null, is_admin: false,
      });
      setReplyText(""); setReplyFile(null);
      await loadReplies(openTicketId);
    } catch {}
    setReplying(false);
  };

  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="gold-gradient-text text-3xl font-cinzel font-bold">Support</h1>
            <p className="text-muted-foreground text-sm mt-1">Get help from our support team</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus size={14} /> New Ticket
          </button>
        </div>
        {success && <div className="mb-4 p-3 rounded-xl bg-emerald-900/20 border border-emerald-600/30 text-emerald-400 text-sm animate-fade-up">Your ticket has been submitted successfully!</div>}
        {showForm && (
          <div className="glass-card-static rounded-2xl p-6 mb-8 border border-gold/20 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="gold-text font-cinzel font-bold">Create Support Ticket</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="luxury-label">Subject *</label><input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Describe your issue briefly" className="luxury-input" required /></div>
              <div><label className="luxury-label">Message *</label><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail..." className="luxury-input resize-none h-32" required /></div>
              <div>
                <label className="luxury-label">Attachment (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="btn-glass px-4 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2">
                    <Upload size={14} /> {file ? file.name : "Choose File"}
                    <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} accept="image/*,.pdf,.doc,.docx" />
                  </label>
                  {file && <button type="button" onClick={() => setFile(null)} className="text-red-400 hover:text-red-300"><X size={14} /></button>}
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-gold px-6 py-3 rounded-xl text-sm font-bold w-full disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>
        )}

        {/* Ticket conversation view */}
        {openTicketId && (() => {
          const ticket = supportTickets.find(t => t.id === openTicketId);
          if (!ticket) return null;
          return (
            <div className="glass-card-static rounded-2xl border border-gold/20 mb-8 animate-fade-up">
              <div className="p-4 border-b border-gold/10 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-semibold">{ticket.subject}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${ticket.status === "open" ? "text-blue-400 border-blue-600/30 bg-blue-900/20" : ticket.status === "replied" ? "text-emerald-400 border-emerald-600/30 bg-emerald-900/20" : "text-muted-foreground border-muted/30 bg-muted/20"}`}>{ticket.status}</span>
                </div>
                <button onClick={() => setOpenTicketId(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              {/* Original message */}
              <div className="p-4 border-b border-white/5">
                <p className="text-foreground text-xs">{ticket.message}</p>
                {ticket.attachmentUrl && <a href={ticket.attachmentUrl} target="_blank" rel="noreferrer" className="text-gold text-xs underline mt-1 block">View Attachment</a>}
                <p className="text-muted-foreground/40 text-[9px] mt-1">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              {/* Admin reply (legacy) */}
              {ticket.adminReply && (
                <div className="p-4 border-b border-white/5 bg-gold/5">
                  <p className="text-gold text-[9px] font-bold uppercase mb-1">Admin Reply</p>
                  <p className="text-foreground text-xs">{ticket.adminReply}</p>
                  {ticket.adminReplyAttachment && <a href={ticket.adminReplyAttachment} target="_blank" rel="noreferrer" className="text-gold text-xs underline mt-1 block">View Admin Attachment</a>}
                </div>
              )}
              {/* Thread replies */}
              <div ref={chatRef} className="p-4 space-y-3 max-h-64 overflow-y-auto scrollbar-gold">
                {replies.map(r => (
                  <div key={r.id} className={`text-xs ${r.is_admin ? "" : "text-right"}`}>
                    <span className={`inline-block px-3 py-2 rounded-xl max-w-[80%] ${r.is_admin ? "bg-gold/10 text-foreground border border-gold/20" : "bg-white/5 text-foreground"}`}>
                      {r.is_admin && <span className="text-gold text-[9px] font-bold block mb-0.5">Admin</span>}
                      {r.message}
                      {r.attachment_url && <a href={r.attachment_url} target="_blank" rel="noreferrer" className="text-gold underline block mt-1 text-[10px]">View Attachment</a>}
                    </span>
                    <p className="text-muted-foreground/40 text-[9px] mt-0.5">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {/* Reply input - only for open tickets */}
              {ticket.status !== "closed" && (
                <div className="p-4 border-t border-gold/10 space-y-2">
                  <div className="flex gap-2">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendReply()} placeholder="Type your reply..." className="luxury-input flex-1 py-2 text-xs" />
                    <label className="btn-glass px-2 py-2 rounded-lg cursor-pointer shrink-0"><Upload size={12} /><input type="file" className="hidden" onChange={e => setReplyFile(e.target.files?.[0] || null)} accept="image/*,.pdf" /></label>
                    <button onClick={sendReply} disabled={replying} className="btn-gold px-3 py-2 rounded-lg shrink-0"><Send size={13} /></button>
                  </div>
                  {replyFile && <p className="text-muted-foreground text-[10px]">📎 {replyFile.name} <button onClick={() => setReplyFile(null)} className="text-red-400">×</button></p>}
                </div>
              )}
            </div>
          );
        })()}

        <div className="space-y-4">
          {supportTickets.length === 0 && !openTicketId && (
            <div className="glass-card-static rounded-2xl p-12 text-center">
              <HeadphonesIcon size={40} className="mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No support tickets yet. Click "New Ticket" to create one.</p>
            </div>
          )}
          {supportTickets.map(t => (
            <div key={t.id} className="glass-card-static rounded-2xl p-5 border border-gold/10 cursor-pointer hover:border-gold/25 transition-all" onClick={() => openTicket(t.id)}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-foreground font-semibold">{t.subject}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0 ${t.status === "open" ? "text-blue-400 border-blue-600/30 bg-blue-900/20" : t.status === "replied" ? "text-emerald-400 border-emerald-600/30 bg-emerald-900/20" : "text-muted-foreground border-muted/30 bg-muted/20"}`}>{t.status}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">{t.message}</p>
              {t.adminReply && <p className="text-gold text-xs mb-1">✓ Admin replied</p>}
              <p className="text-muted-foreground/50 text-[10px]">{new Date(t.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
