import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Lock, Users, Upload, X, LogOut, Clock, ArrowLeftRight, Megaphone } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import type { Slot } from "@/context/AppContext";

interface ChatMessage { id: string; username: string; text: string; created_at: string; }

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { groups, isLoggedIn, currentUser, refreshGroups, announcements } = useApp();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [payStep, setPayStep] = useState<"idle"|"select"|"confirm"|"payment"|"proof"|"done">("idle");
  const [payProof, setPayProof] = useState<File | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSeatChangeModal, setShowSeatChangeModal] = useState(false);
  const [exitReason, setExitReason] = useState("");
  const [seatChangeFrom, setSeatChangeFrom] = useState("");
  const [seatChangeTo, setSeatChangeTo] = useState("");
  const [seatChangeReason, setSeatChangeReason] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [joinError, setJoinError] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const group = groups.find(g => g.id === id);
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Countdown timer - counts down from live_at using payment_days interval
  useEffect(() => {
    if (!group || !group.isLive || !group.liveAt) return;
    const tick = () => {
      const now = Date.now();
      const liveAt = new Date(group.liveAt!).getTime();
      const cycleDurationMs = (group.paymentDays || 1) * 86400000;

      // Calculate how many full cycles have passed since live_at
      const elapsed = now - liveAt;
      if (elapsed < 0) {
        // Group goes live in the future
        setCountdown({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      const currentCycleElapsed = elapsed % cycleDurationMs;
      const remaining = cycleDurationMs - currentCycleElapsed;

      setCountdown({
        d: Math.floor(remaining / 86400000),
        h: Math.floor((remaining % 86400000) / 3600000),
        m: Math.floor((remaining % 3600000) / 60000),
        s: Math.floor((remaining % 60000) / 1000),
      });
    };
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, [group?.isLive, group?.liveAt, group?.paymentDays]);

  const loadSlots = useCallback(async () => {
    if (!id) return; setSlotsLoading(true);
    const { data } = await supabase.from("slots").select("*, profiles(first_name, nickname, is_vip, profile_picture, trust_score)").eq("group_id", id).order("seat_no");
    if (data) {
      const mapped: Slot[] = data.map((s: Record<string, unknown>) => {
        const profile = s.profiles as Record<string, unknown> | null;
        let status: Slot["status"] = s.status as Slot["status"];
        if (s.user_id === currentUser?.id && (status === "claimed" || status === "reserved")) status = "mine" as unknown as Slot["status"];
        return { id: s.id as number, groupId: s.group_id as string, seatNo: s.seat_no as number, userId: s.user_id as string | undefined, status, isDisbursed: Boolean(s.is_disbursed), nickname: profile?.nickname as string | undefined, fullName: profile?.first_name as string | undefined, isVip: Boolean(profile?.is_vip), profilePicture: profile?.profile_picture as string | undefined };
      });
      setSlots(mapped);
    }
    setSlotsLoading(false);
  }, [id, currentUser?.id]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  // Chat - load initially then realtime
  useEffect(() => {
    if (!id || !isLoggedIn) return;
    const load = () => supabase.from("chat_messages").select("*").eq("group_id", id).order("created_at").limit(100).then(({ data }) => { if (data) setMessages(data as ChatMessage[]); });
    load();

    const channel = supabase.channel(`chat-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `group_id=eq.${id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
        setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }), 50);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, isLoggedIn]);

  if (!isLoggedIn) return <Navigate to="/login" state={{ message: "Please sign in to view group details", redirect: `/groups/${id}` }} replace />;
  
  // Check if user is restricted/frozen
  if (currentUser?.isRestricted) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center relative">
        <ParticleBackground />
        <div className="relative z-10 glass-card-static rounded-2xl p-8 max-w-md mx-4 text-center border border-amber-600/30">
          <div className="w-16 h-16 rounded-full bg-amber-900/30 border border-amber-600/40 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-amber-400" />
          </div>
          <h2 className="text-amber-400 font-cinzel font-bold text-xl mb-3">Account Restricted</h2>
          <p className="text-muted-foreground text-sm mb-4">Your account has been restricted. You cannot view or join groups until the restriction is lifted.</p>
          <p className="text-muted-foreground text-xs">Please contact admin/support to resolve this issue.</p>
        </div>
      </div>
    );
  }
  if (currentUser?.isFrozen) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center relative">
        <ParticleBackground />
        <div className="relative z-10 glass-card-static rounded-2xl p-8 max-w-md mx-4 text-center border border-blue-600/30">
          <div className="w-16 h-16 rounded-full bg-blue-900/30 border border-blue-600/40 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-blue-400" />
          </div>
          <h2 className="text-blue-400 font-cinzel font-bold text-xl mb-3">Account Frozen</h2>
          <p className="text-muted-foreground text-sm mb-4">Your account has been temporarily frozen. You cannot view or join groups.</p>
          <p className="text-muted-foreground text-xs">Please contact admin/support to resolve this issue.</p>
        </div>
      </div>
    );
  }
  
  if (!group) return <Navigate to="/groups" replace />;

  // Group-specific announcements
  const groupAnnouncements = announcements.filter(a => a.targetGroupId === id);

  const handleSeatClick = (slot: Slot) => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (slot.status === "locked") return;
    // Allow clicking own seats (mine) for recurring payments
    const isMine = (slot.status as unknown as string) === "mine";
    if (slot.status === "claimed" && !isMine) return;
    if (slot.status === "reserved" && slot.userId !== currentUser?.id) return;
    const seatNo = slot.seatNo;
    setSelectedSeats(prev => prev.includes(seatNo) ? prev.filter(s => s !== seatNo) : [...prev, seatNo]);
  };

  const confirmSeats = async () => {
    if (!selectedSeats.length || !id || !currentUser) return;
    setJoinError(""); setPayLoading(true);
    try {
      for (const seatNo of selectedSeats) {
        const existing = slots.find(s => s.seatNo === seatNo);
        // Only reserve if seat is available (new join)
        if (existing && existing.status === "available") {
          await supabase.from("slots").update({ user_id: currentUser.id, status: "reserved", joined_at: new Date().toISOString() }).eq("group_id", id).eq("seat_no", seatNo);
        }
        // If seat is already mine (claimed/reserved), skip reservation - go straight to payment
      }
      // Update filled_slots count
      const { data: slotCount } = await supabase.from("slots").select("id").eq("group_id", id).neq("status", "available");
      if (slotCount) {
        await supabase.from("groups").update({ filled_slots: slotCount.length }).eq("id", id);
      }
      await loadSlots(); await refreshGroups(); setPayStep("payment");
    } catch (e: unknown) { setJoinError((e as Error).message || "Failed to reserve seats"); }
    setPayLoading(false);
  };

  const handlePaymentSubmit = async () => {
    if (!currentUser || !id) return;
    setPayLoading(true);
    try {
      let screenshotUrl: string | undefined;
      if (payProof) {
        const path = `${currentUser.id}/${id}/${Date.now()}_${payProof.name}`;
        const { data: up } = await supabase.storage.from("payment-proofs").upload(path, payProof);
        if (up) { const { data: u } = supabase.storage.from("payment-proofs").getPublicUrl(up.path); screenshotUrl = u.publicUrl; }
      }
      const seatNos = selectedSeats.map(s => `S${s}`).join("+");
      const totalAmt = selectedSeats.length * group.contributionAmount;
      await supabase.from("transactions").insert({
        group_id: id, group_name: group.name, user_id: currentUser.id,
        amount: totalAmt, status: "pending", seat_numbers: seatNos, screenshot_url: screenshotUrl || null,
      });
      await supabase.from("audit_logs").insert({ user_id: currentUser.id, action: `Submitted payment of ₦${totalAmt.toLocaleString()} for ${group.name} (${seatNos})`, type: "payment" });
      await supabase.from("notifications").insert({ user_id: currentUser.id, message: `Your payment of ₦${totalAmt.toLocaleString()} for ${group.name} (Seats: ${seatNos}) is pending admin review.` });
      await loadSlots(); await refreshGroups(); setPayStep("done");
    } catch (e: unknown) { setJoinError((e as Error).message || "Payment submission failed"); }
    setPayLoading(false);
  };

  const sendMsg = async () => {
    if (!chatMsg.trim() || !currentUser || !id) return;
    await supabase.from("chat_messages").insert({ group_id: id, user_id: currentUser.id, username: currentUser.nickname || currentUser.username, text: chatMsg });
    setChatMsg("");
  };

  const handleExit = async () => {
    if (!id || !currentUser) return;
    await supabase.from("exit_requests").insert({ group_id: id, user_id: currentUser.id, reason: exitReason });
    await supabase.from("audit_logs").insert({ user_id: currentUser.id, action: `Requested exit from group ${group.name}`, type: "group" });
    setShowExitModal(false);
    alert("Exit request sent to admin. Make sure you are not owing before leaving.");
  };

  const handleSeatChange = async () => {
    if (!id || !currentUser) return;
    await supabase.from("seat_change_requests").insert({ group_id: id, user_id: currentUser.id, current_seat: parseInt(seatChangeFrom), requested_seat: parseInt(seatChangeTo), reason: seatChangeReason });
    await supabase.from("audit_logs").insert({ user_id: currentUser.id, action: `Requested seat change in ${group.name}: S${seatChangeFrom} → S${seatChangeTo}`, type: "group" });
    setShowSeatChangeModal(false);
    alert("Seat change request submitted to admin.");
  };

  const slotColorClass = (slot: Slot) => {
    const s = slot.status as unknown as string;
    if (s === "mine" && selectedSeats.includes(slot.seatNo)) return "bg-blue-500/20 border-2 border-blue-400 text-blue-300 cursor-pointer shadow-[0_0_8px_rgba(59,130,246,0.4)]";
    if (s === "mine") return "bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300 cursor-pointer shadow-[0_0_10px_rgba(234,179,8,0.4)]";
    if (s === "claimed") return "bg-red-900/30 border border-red-600/40 text-red-400 cursor-not-allowed";
    if (s === "reserved") return "bg-orange-900/30 border border-orange-500/50 text-orange-400 cursor-not-allowed";
    if (s === "locked") return "bg-amber-900/25 border border-amber-500/40 text-amber-500 cursor-not-allowed";
    if (selectedSeats.includes(slot.seatNo)) return "bg-blue-500/20 border-2 border-blue-400 text-blue-300 cursor-pointer shadow-[0_0_8px_rgba(59,130,246,0.4)]";
    return "bg-emerald-900/40 border border-emerald-500/50 text-emerald-400 cursor-pointer hover:bg-emerald-800/60 hover:border-emerald-400 transition-all";
  };

  const statusEmoji = (slot: Slot) => {
    const s = slot.status as unknown as string;
    if (s === "mine") return "🟡";
    if (s === "claimed") return "🔴";
    if (s === "reserved") return "🟠";
    if (s === "locked") return "🟠";
    if (selectedSeats.includes(slot.seatNo)) return "🔵";
    return "🟢";
  };

  const showDays = countdown.d > 0;
  const claimedSlots = slots.filter(s => {
    const st = s.status as unknown as string;
    return st === "claimed" || st === "mine" || st === "reserved";
  });
  const uniqueMembers = new Set(claimedSlots.map(s => s.userId).filter(Boolean));

  return (
    <div className="min-h-screen pt-16 pb-16 relative overflow-hidden">
      <ParticleBackground />

      {/* PREMIUM TIMER HEADER */}
      <div className="relative z-10 w-full border-b border-gold/10" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.95) 0%, rgba(15,10,5,0.9) 100%)", backdropFilter: "blur(24px)" }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {group.isLive ? (
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="live-badge text-[10px] px-3 py-1 animate-pulse">● LIVE</span>
                  <span className="text-muted-foreground text-[10px] font-bold tracking-[0.3em] uppercase">Payment Cycle</span>
                </div>
                <div className="flex items-center gap-1" style={{ fontFamily: "'Cinzel', serif" }}>
                  {showDays && (
                    <>
                      <div className="flex flex-col items-center">
                        <span className="tabular-nums font-black" style={{ fontSize: "clamp(2.8rem,7vw,4.5rem)", background: "linear-gradient(135deg, hsl(45,100%,50%), hsl(38,100%,65%), hsl(45,100%,50%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 24px rgba(234,179,8,0.6)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))", letterSpacing: "2px" }}>{pad(countdown.d)}</span>
                        <span className="text-gold/60 text-[9px] font-bold tracking-widest uppercase">Days</span>
                      </div>
                      <span className="text-gold/40 font-black mx-1 self-start mt-2" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>:</span>
                    </>
                  )}
                  {[{ val: countdown.h, label: "Hours" }, { val: countdown.m, label: "Mins" }, { val: countdown.s, label: "Secs" }].map((item, i) => (
                    <span key={i} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <span className="tabular-nums font-black" style={{ fontSize: "clamp(2.8rem,7vw,4.5rem)", background: "linear-gradient(135deg, hsl(45,100%,50%), hsl(38,100%,65%), hsl(45,100%,50%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 24px rgba(234,179,8,0.6)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))", letterSpacing: "2px" }}>{pad(item.val)}</span>
                        <span className="text-gold/60 text-[9px] font-bold tracking-widest uppercase">{item.label}</span>
                      </div>
                      {i < 2 && <span className="text-gold/40 font-black mx-1 self-start mt-2" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>:</span>}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3"><Clock size={32} className="text-muted-foreground/40" /><div><p className="text-muted-foreground text-sm font-semibold">Group Not Live Yet</p><p className="text-muted-foreground/50 text-xs">Timer starts when admin activates this group</p></div></div>
            )}
            <div className="text-right">
              <p className="gold-gradient-text font-cinzel font-bold text-lg">{group.name}</p>
              <p className="text-muted-foreground text-xs">Deposit ₦{group.contributionAmount.toLocaleString()} → Pack ₦{group.payoutAmount.toLocaleString()}</p>
              <p className="text-muted-foreground/60 text-[10px] capitalize">{group.paymentFrequency} payments ({group.paymentDays}d) · {group.disbursementDays} day payout</p>
            </div>
          </div>

          {/* Group announcements under timer */}
          {groupAnnouncements.length > 0 && (
            <div className="mt-4 space-y-2">
              {groupAnnouncements.slice(0, 3).map(ann => (
                <div key={ann.id} className="flex items-start gap-2 p-3 rounded-xl bg-gold/5 border border-gold/15">
                  <Megaphone size={14} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full mr-2 ${ann.type==="announcement"?"text-blue-400 bg-blue-900/30":ann.type==="promotion"?"text-emerald-400 bg-emerald-900/30":"text-amber-400 bg-amber-900/30"}`}>ANNOUNCEMENT</span>
                    <span className="text-foreground text-xs font-semibold">{ann.title}</span>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{ann.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {/* Group info */}
        <div className="glass-card-static rounded-2xl p-5 mb-6 border border-gold/20">
          <h1 className="gold-gradient-text font-cinzel font-bold text-2xl mb-2">{group.name}</h1>
          <p className="text-muted-foreground text-sm mb-4">{group.description}</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="text-gold">₦{group.contributionAmount.toLocaleString()} / {group.cycleType}</span>
            <span className="text-muted-foreground">{group.filledSlots}/{group.totalSlots} slots filled</span>
            {group.isLive && <span className="live-badge">● LIVE</span>}
          </div>
        </div>

        {/* Seat legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          {[["🟢","Available"],["🔴","Taken/Claimed"],["🟡","Your Seat (click to re-pay)"],["🟠","Reserved"],["🔵","Selected"]].map(([e,l]) => (
            <span key={l} className="flex items-center gap-1 text-muted-foreground">{e} {l}</span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slots grid */}
          <div className="lg:col-span-2">
            <div className="glass-card-static rounded-2xl p-5 border border-gold/15">
              <div className="flex items-center justify-between mb-4">
                <h2 className="gold-text font-cinzel font-bold">Seat Selection</h2>
                {selectedSeats.length > 0 && payStep === "idle" && (
                  <button onClick={() => setPayStep("confirm")} className="btn-gold px-4 py-2 rounded-xl text-xs font-bold">Next ({selectedSeats.length} seats)</button>
                )}
              </div>
              {slotsLoading ? <div className="text-center py-8 text-muted-foreground">Loading seats...</div> : slots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm mb-1">No seats available yet</p>
                  <p className="text-xs">Admin has not added seats to this group yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {slots.map(slot => (
                    <button key={slot.id} onClick={() => handleSeatClick(slot)}
                      className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${slotColorClass(slot)}`}
                      title={`S${slot.seatNo} - ${slot.status}`}>
                      <span className="text-[10px]">{statusEmoji(slot)}</span>
                      <span className="text-[11px] font-bold">{slot.seatNo}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment flow */}
            {payStep === "confirm" && (
              <div className="mt-4 glass-card-static rounded-2xl p-5 border border-gold/20 animate-fade-up">
                <h3 className="gold-text font-cinzel font-bold mb-3">Confirm Seats</h3>
                <p className="text-foreground text-sm mb-2">Selected: <span className="text-gold font-bold">{selectedSeats.map(s => `S${s}`).join(", ")}</span></p>
                <p className="text-foreground text-sm mb-4">Total: <span className="text-gold font-bold">₦{(selectedSeats.length * group.contributionAmount).toLocaleString()}</span></p>
                {joinError && <p className="text-red-400 text-xs mb-3">{joinError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setPayStep("idle")} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Back</button>
                  <button onClick={confirmSeats} disabled={payLoading} className="btn-gold flex-1 py-2.5 rounded-xl text-sm font-bold">{payLoading ? "Reserving..." : "Confirm & Pay"}</button>
                </div>
              </div>
            )}
            {payStep === "payment" && (
              <div className="mt-4 glass-card-static rounded-2xl p-5 border border-gold/20 animate-fade-up">
                <h3 className="gold-text font-cinzel font-bold mb-3">Payment Details</h3>
                {group.accountName && (
                  <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 mb-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Transfer To:</p>
                    <p className="text-foreground font-bold">{group.accountName}</p>
                    <p className="text-gold font-mono text-lg">{group.accountNumber}</p>
                    <p className="text-muted-foreground">{group.bankName}</p>
                    <p className="text-foreground font-bold mt-2">Amount: ₦{(selectedSeats.length * group.contributionAmount).toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs">Reference: {selectedSeats.map(s => `S${s}`).join("+")}</p>
                  </div>
                )}
                <label className="luxury-label">Attach Payment Proof *</label>
                <div className="flex items-center gap-3 mb-4">
                  <label className="btn-glass px-4 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2">
                    <Upload size={14} />{payProof ? payProof.name : "Choose File"}
                    <input type="file" className="hidden" onChange={e => setPayProof(e.target.files?.[0] || null)} accept="image/*,.pdf" />
                  </label>
                  {payProof && <button onClick={() => setPayProof(null)}><X size={14} className="text-red-400" /></button>}
                </div>
                {joinError && <p className="text-red-400 text-xs mb-3">{joinError}</p>}
                <button onClick={handlePaymentSubmit} disabled={payLoading || !payProof} className="btn-gold w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50">
                  {payLoading ? "Submitting..." : "I HAVE MADE PAYMENT - SUBMIT PROOF"}
                </button>
              </div>
            )}
            {payStep === "done" && (
              <div className="mt-4 glass-card-static rounded-2xl p-5 border border-emerald-600/30 bg-emerald-900/10 animate-fade-up">
                <p className="text-emerald-400 font-bold text-center mb-2">✓ Payment Submitted!</p>
                <p className="text-muted-foreground text-xs text-center leading-relaxed">YOUR PAYMENT IS PENDING. The admin will confirm your payment and approve it if successfully received. Your seat is marked as RESERVED until approved.</p>
                <button onClick={() => { setPayStep("idle"); setSelectedSeats([]); setPayProof(null); }} className="btn-glass w-full py-2 rounded-xl text-sm mt-4">Close</button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowExitModal(true)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm flex items-center gap-2 justify-center text-red-400 border-red-600/30">
                <LogOut size={14} />Exit Group
              </button>
              <button onClick={() => setShowSeatChangeModal(true)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm flex items-center gap-2 justify-center">
                <ArrowLeftRight size={14} />Change Seat
              </button>
            </div>
          </div>

          {/* Members + Chat */}
          <div className="space-y-4">
            {/* Member List */}
            <div className="glass-card-static rounded-2xl border border-gold/15 overflow-hidden">
              <div className="px-4 py-3 border-b border-gold/10">
                <h3 className="gold-text font-cinzel font-bold text-sm flex items-center gap-2"><Users size={14} />Members</h3>
                <p className="text-muted-foreground text-[10px] mt-0.5">{uniqueMembers.size} users · {claimedSlots.length} seats</p>
              </div>
              <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto scrollbar-gold">
                {claimedSlots.length === 0 && <p className="text-muted-foreground text-xs text-center py-4">No members yet</p>}
                {claimedSlots.sort((a,b)=>a.seatNo-b.seatNo).map(slot => (
                  <div key={slot.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gold/5 transition-colors">
                    <span className="text-gold text-xs font-mono font-bold w-8 shrink-0">S{slot.seatNo}</span>
                    {slot.profilePicture ? <img src={slot.profilePicture} className="w-7 h-7 rounded-full object-cover border border-gold/20 shrink-0" alt="" /> : <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-obsidian text-xs font-bold shrink-0">{slot.nickname?.[0] || slot.fullName?.[0] || "?"}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-xs truncate">{slot.nickname || slot.fullName || "Member"}</p>
                      <div className="flex items-center gap-1">
                        {slot.isVip && <span className="vip-badge text-[8px]">VIP</span>}
                        <span className={`text-[8px] px-1 rounded ${(slot.status as unknown as string) === "mine" || (slot.status as unknown as string) === "claimed" ? "text-emerald-400" : "text-orange-400"}`}>
                          {(slot.status as unknown as string) === "mine" ? "claimed" : slot.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="glass-card-static rounded-2xl border border-gold/15 overflow-hidden">
              <div className="px-4 py-3 border-b border-gold/10">
                <h3 className="gold-text font-cinzel font-bold text-sm flex items-center gap-2"><Send size={14} />Group Chat</h3>
              </div>
              {group.chatLocked ? (
                <div className="p-4 text-center text-muted-foreground text-xs flex items-center justify-center gap-2"><Lock size={14} />Chat is locked by admin</div>
              ) : (
                <>
                  <div ref={chatRef} className="p-3 space-y-2 max-h-48 overflow-y-auto scrollbar-gold">
                    {messages.map(m => (
                      <div key={m.id} className={`text-xs ${m.username === (currentUser?.nickname || currentUser?.username) ? "text-right" : ""}`}>
                        <span className={`inline-block px-2 py-1 rounded-lg ${m.username === (currentUser?.nickname || currentUser?.username) ? "bg-gold/15 text-gold" : "bg-white/5 text-foreground"}`}>
                          {m.username !== (currentUser?.nickname || currentUser?.username) && <span className="text-muted-foreground text-[9px] block">{m.username}</span>}
                          {m.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gold/10 flex gap-2">
                    <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Message..." className="luxury-input flex-1 py-2 text-xs" />
                    <button onClick={sendMsg} className="btn-gold px-3 py-2 rounded-xl"><Send size={13} /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="glass-card-static rounded-2xl p-6 w-full max-w-md border border-red-600/30">
            <h3 className="text-red-400 font-cinzel font-bold mb-3">Exit Group?</h3>
            <p className="text-muted-foreground text-sm mb-4">Are you sure you want to leave this group? Make sure you are not owing before requesting to exit.</p>
            <textarea value={exitReason} onChange={e => setExitReason(e.target.value)} placeholder="Reason for leaving..." className="luxury-input resize-none h-20 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowExitModal(false)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleExit} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-900/30 border border-red-600/30 text-red-400 hover:bg-red-900/50">Send Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Change Modal */}
      {showSeatChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="glass-card-static rounded-2xl p-6 w-full max-w-md border border-gold/20">
            <h3 className="gold-text font-cinzel font-bold mb-3">Seat Change Request</h3>
            <div className="space-y-3">
              <div><label className="luxury-label">Current Seat Number</label><input value={seatChangeFrom} onChange={e => setSeatChangeFrom(e.target.value)} placeholder="e.g. 5" className="luxury-input" /></div>
              <div><label className="luxury-label">Desired Seat Number</label><input value={seatChangeTo} onChange={e => setSeatChangeTo(e.target.value)} placeholder="e.g. 12" className="luxury-input" /></div>
              <div><label className="luxury-label">Reason</label><textarea value={seatChangeReason} onChange={e => setSeatChangeReason(e.target.value)} placeholder="Why do you want to change?" className="luxury-input resize-none h-16" /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowSeatChangeModal(false)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleSeatChange} className="btn-gold flex-1 py-2.5 rounded-xl text-sm font-bold">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
