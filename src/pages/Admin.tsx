import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import { BarChart3, Users, Shield, FileText, Bell, Ban, Star, Lock, Search, CheckCircle, X, Crown, Eye, EyeOff, Edit, Plus, Megaphone, LogOut, Trash2, Phone, Key, ToggleLeft, ToggleRight, Upload, Reply, Settings, TrendingUp, ListChecks, DollarSign, AlertTriangle, RefreshCw } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import type { Announcement } from "@/context/AppContext";

type SideTab = "overview"|"users"|"groups"|"payments"|"announcements"|"support"|"contact-info"|"seat-changes"|"exit-requests"|"audit"|"terms"|"disbursements"|"members"|"debts";

const Btn = ({ onClick, children, variant="glass", size="sm", className="", disabled=false }: { onClick?:()=>void; children:React.ReactNode; variant?:"glass"|"gold"|"red"|"green"|"blue"|"amber"; size?:"xs"|"sm"; className?:string; disabled?:boolean; }) => {
  const base="inline-flex items-center gap-1 font-semibold rounded-lg transition-all cursor-pointer border disabled:opacity-50";
  const sz=size==="xs"?"px-2 py-1 text-[10px]":"px-3 py-1.5 text-xs";
  const vars:Record<string,string>={glass:"border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-white/20",gold:"border-gold/40 bg-gold/10 text-gold hover:bg-gold/20",red:"border-red-600/30 bg-red-900/15 text-red-400 hover:bg-red-900/30",green:"border-emerald-600/30 bg-emerald-900/15 text-emerald-400 hover:bg-emerald-900/30",blue:"border-blue-600/30 bg-blue-900/15 text-blue-400 hover:bg-blue-900/30",amber:"border-amber-600/30 bg-amber-900/15 text-amber-400 hover:bg-amber-900/30"};
  return <button onClick={onClick} disabled={disabled} className={`${base} ${sz} ${vars[variant]} ${className}`}>{children}</button>;
};

const Modal = ({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)" }}>
    <div className="w-full max-w-xl glass-card-static rounded-2xl border border-gold/20 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b border-gold/15">
        <h3 className="gold-text font-cinzel font-bold text-base">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default function Admin() {
  const { currentUser, isLoggedIn, groups, refreshGroups, announcements, setAnnouncements, refreshAnnouncements, supportTickets, refreshSupportTickets, contactInfo, setContactInfo, maintenanceMode, setMaintenanceMode } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [sideTab, setSideTab] = useState<SideTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminUsers, setAdminUsers] = useState<Record<string,unknown>[]>([]);
  const [adminPayments, setAdminPayments] = useState<Record<string,unknown>[]>([]);
  const [stats, setStats] = useState({ totalUsers:0, activeGroups:0, pendingPayments:0, openTickets:0, totalRevenue:0 });
  const [exitRequests, setExitRequests] = useState<Record<string,unknown>[]>([]);
  const [seatChanges, setSeatChanges] = useState<Record<string,unknown>[]>([]);
  const [auditLogs, setAuditLogs] = useState<Record<string,unknown>[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState<string|null>(null);
  const [showSupportReply, setShowSupportReply] = useState<string|null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string,boolean>>({});
  const [annTitle, setAnnTitle] = useState(""); const [annBody, setAnnBody] = useState(""); const [annType, setAnnType] = useState<Announcement["type"]>("announcement"); const [annGroupId, setAnnGroupId] = useState("");
  const [annFile, setAnnFile] = useState<File|null>(null);
  const [supportReplyText, setSupportReplyText] = useState(""); const [supportReplyFile, setSupportReplyFile] = useState<File|null>(null);
  const [gName, setGName] = useState(""); const [gDesc, setGDesc] = useState(""); const [gAmt, setGAmt] = useState(""); const [gCycle, setGCycle] = useState("daily"); const [gSlots, setGSlots] = useState("100"); const [gBank, setGBank] = useState(""); const [gAccNum, setGAccNum] = useState(""); const [gAccName, setGAccName] = useState(""); const [editingGroup, setEditingGroup] = useState<string|null>(null);
  const [gPayoutAmt, setGPayoutAmt] = useState(""); const [gPayFreq, setGPayFreq] = useState("daily"); const [gPayDays, setGPayDays] = useState("1"); const [gDisbDays, setGDisbDays] = useState("30");
  const [notifTarget, setNotifTarget] = useState("all"); const [notifMsg, setNotifMsg] = useState(""); const [notifUserId, setNotifUserId] = useState("");
  const [editedUser, setEditedUser] = useState<Record<string,string>>({});
  const [termContent, setTermContent] = useState(""); const [termSaving, setTermSaving] = useState(false);
  const [editContact, setEditContact] = useState({ ...contactInfo });

  // Members tab
  const [memberGroupId, setMemberGroupId] = useState("");
  const [groupMembers, setGroupMembers] = useState<Record<string,unknown>[]>([]);
  const [memberStats, setMemberStats] = useState({ totalUsers: 0, totalSeats: 0 });

  // Disbursements tab
  const [disbursements, setDisbursements] = useState<Record<string,unknown>[]>([]);
  const [showDisbModal, setShowDisbModal] = useState(false);
  const [disbUserId, setDisbUserId] = useState(""); const [disbGroupId, setDisbGroupId] = useState(""); const [disbAmount, setDisbAmount] = useState(""); const [disbDesc, setDisbDesc] = useState(""); const [disbSeats, setDisbSeats] = useState(""); const [disbFile, setDisbFile] = useState<File|null>(null);

  // Debts tab
  const [debts, setDebts] = useState<Record<string,unknown>[]>([]);

  const loadData = async () => {
    const [statsData, usersData, paymentsData, exitData, seatData, auditData, disbData, debtsData] = await Promise.all([
      supabase.rpc("get_platform_stats"),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*, profiles(username, first_name, last_name, nickname)").order("created_at", { ascending: false }),
      supabase.from("exit_requests").select("*, profiles(username, nickname), groups(name)").order("created_at", { ascending: false }),
      supabase.from("seat_change_requests").select("*, profiles(username, nickname), groups(name)").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("*, profiles(username)").order("created_at", { ascending: false }).limit(100),
      supabase.from("disbursements").select("*, profiles(username, first_name, last_name)").order("created_at", { ascending: false }),
      supabase.from("user_debts").select("*, profiles(username, first_name, last_name)").order("created_at", { ascending: false }),
    ]);
    if (statsData.data) setStats(statsData.data as typeof stats);
    if (usersData.data) setAdminUsers(usersData.data as typeof adminUsers);
    if (paymentsData.data) setAdminPayments(paymentsData.data as typeof adminPayments);
    if (exitData.data) setExitRequests(exitData.data as typeof exitRequests);
    if (seatData.data) setSeatChanges(seatData.data as typeof seatChanges);
    if (auditData.data) setAuditLogs(auditData.data as typeof auditLogs);
    if (disbData.data) setDisbursements(disbData.data as typeof disbursements);
    if (debtsData.data) setDebts(debtsData.data as typeof debts);
    const { data: termsData } = await supabase.from("platform_settings").select("value").eq("key","terms_and_conditions").single();
    if (termsData) setTermContent((termsData as Record<string,unknown>).value as string);
  };

  const loadGroupMembers = async (groupId: string) => {
    if (!groupId) { setGroupMembers([]); setMemberStats({ totalUsers: 0, totalSeats: 0 }); return; }
    const { data } = await supabase.from("slots").select("*, profiles(username, first_name, last_name, nickname, is_vip, profile_picture)").eq("group_id", groupId).order("seat_no");
    if (data) {
      const occupied = data.filter((s: Record<string,unknown>) => s.user_id);
      setGroupMembers(occupied as typeof groupMembers);
      const uniqueUsers = new Set(occupied.map((s: Record<string,unknown>) => s.user_id as string));
      setMemberStats({ totalUsers: uniqueUsers.size, totalSeats: occupied.length });
    }
  };

  useEffect(() => { loadData(); refreshAnnouncements(); refreshSupportTickets(); }, []);
  useEffect(() => { if (memberGroupId) loadGroupMembers(memberGroupId); }, [memberGroupId]);

  if (!isLoggedIn || (currentUser?.role !== "admin" && currentUser?.role !== "moderator")) return <Navigate to="/" replace />;

  const toggleMaintenance = async () => {
    const val = !maintenanceMode;
    await supabase.from("platform_settings").update({ value: String(val) }).eq("key","maintenance_mode");
    setMaintenanceMode(val);
  };

  const createGroup = async () => {
    if (!gName || !gAmt) return;
    const payload = { name:gName, description:gDesc, contribution_amount:parseFloat(gAmt), cycle_type:gCycle, total_slots:parseInt(gSlots), bank_name:gBank, account_number:gAccNum, account_name:gAccName, payout_amount:parseFloat(gPayoutAmt)||0, payment_frequency:gPayFreq, payment_days:parseInt(gPayDays)||1, disbursement_days:parseInt(gDisbDays)||30 };
    if (editingGroup) {
      await supabase.from("groups").update(payload).eq("id",editingGroup);
    } else {
      const { data } = await supabase.from("groups").insert(payload).select().single();
      if (data) {
        const slots = Array.from({ length: parseInt(gSlots) }, (_, i) => ({ group_id: (data as Record<string,unknown>).id as string, seat_no: i+1, status:"available" }));
        await supabase.from("slots").insert(slots);
        await supabase.rpc("send_notification_to_all", { msg: `New group available: ${gName}! Join now and start saving.` });
      }
    }
    await refreshGroups(); setShowCreateGroup(false); setEditingGroup(null); setGName(""); setGDesc(""); setGAmt(""); setGSlots("100"); setGBank(""); setGAccNum(""); setGAccName(""); setGPayoutAmt(""); setGPayFreq("daily"); setGPayDays("1"); setGDisbDays("30");
  };

  const toggleGroupLive = async (groupId: string, isLive: boolean) => {
    await supabase.from("groups").update({ is_live: !isLive, live_at: !isLive ? new Date().toISOString() : null }).eq("id", groupId);
    if (!isLive) await supabase.rpc("send_notification_to_group", { gid: groupId, msg: `Your group is now LIVE! Daily timer has started.` });
    await refreshGroups(); await loadData();
  };

  const deleteGroup = async (groupId: string) => { if (!confirm("Delete this group?")) return; await supabase.from("groups").delete().eq("id", groupId); await refreshGroups(); };

  const sendAnnouncement = async () => {
    if (!annTitle || !annBody) return;
    let imageUrl: string | undefined;
    if (annFile) {
      const path = `ann_${Date.now()}_${annFile.name}`;
      const { data: up } = await supabase.storage.from("announcements").upload(path, annFile);
      if (up) { const { data: u } = supabase.storage.from("announcements").getPublicUrl(up.path); imageUrl = u.publicUrl; }
    }
    await supabase.from("announcements").insert({ title:annTitle, body:annBody, type:annType, image_url:imageUrl||null, target_group_id:annGroupId||null, admin_name:currentUser?.username||"Admin" });
    if (!annGroupId) await supabase.rpc("send_notification_to_all", { msg: `📢 ${annTitle}: ${annBody}` });
    else await supabase.rpc("send_notification_to_group", { gid: annGroupId, msg: `📢 ${annTitle}: ${annBody}` });
    await refreshAnnouncements(); setShowAnnouncement(false); setAnnTitle(""); setAnnBody(""); setAnnFile(null); setAnnGroupId("");
  };

  const deleteAnnouncement = async (id: string) => { await supabase.from("announcements").delete().eq("id", id); setAnnouncements(prev => prev.filter(a => a.id !== id)); };

  const sendNotification = async () => {
    if (!notifMsg) return;
    if (notifTarget === "all") await supabase.rpc("send_notification_to_all", { msg: notifMsg });
    else if (notifTarget === "user" && notifUserId) await supabase.rpc("send_notification_to_user", { uid: notifUserId, msg: notifMsg });
    else if (notifTarget === "vip") { const vips = adminUsers.filter(u => u.is_vip); for (const u of vips) await supabase.rpc("send_notification_to_user", { uid: u.id as string, msg: notifMsg }); }
    setNotifMsg(""); setNotifUserId(""); alert("Notification sent!");
  };

  const updateUserFlag = async (userId: string, field: string, value: boolean) => {
    await supabase.from("profiles").update({ [field]: value }).eq("id", userId);
    await loadData();
    if (field === "is_banned" && value) await supabase.rpc("send_notification_to_user", { uid: userId, msg: "Your account has been banned. Contact admin to appeal." });
    if (field === "is_banned" && !value) await supabase.rpc("send_notification_to_user", { uid: userId, msg: "Your account has been unbanned. Welcome back!" });
  };

  const saveUserEdit = async () => {
    if (!showUserEdit) return;
    await supabase.from("profiles").update({ trust_score: editedUser.trustScore ? parseInt(editedUser.trustScore) : undefined, role: editedUser.role || undefined }).eq("id", showUserEdit);
    if (editedUser.role === "admin") await supabase.rpc("send_notification_to_user", { uid: showUserEdit, msg: "You have been granted Admin role on the platform." });
    setShowUserEdit(null); await loadData();
  };

  const replyTicket = async (ticketId: string) => {
    if (!supportReplyText) return;
    let attachmentUrl: string | undefined;
    if (supportReplyFile) {
      const path = `admin/${ticketId}_${Date.now()}_${supportReplyFile.name}`;
      const { data: up } = await supabase.storage.from("support-attachments").upload(path, supportReplyFile);
      if (up) { const { data: u } = supabase.storage.from("support-attachments").getPublicUrl(up.path); attachmentUrl = u.publicUrl; }
    }
    const ticket = supportTickets.find(t => t.id === ticketId);
    // Insert as ticket reply
    await supabase.from("ticket_replies").insert({ ticket_id: ticketId, user_id: currentUser!.id, message: supportReplyText, attachment_url: attachmentUrl||null, is_admin: true });
    await supabase.from("support_tickets").update({ admin_reply: supportReplyText, admin_reply_attachment: attachmentUrl||null, status: "replied", replied_at: new Date().toISOString() }).eq("id", ticketId);
    if (ticket) await supabase.rpc("send_notification_to_user", { uid: ticket.userId, msg: `Admin replied to your support ticket: "${ticket.subject}"` });
    await refreshSupportTickets(); setShowSupportReply(null); setSupportReplyText(""); setSupportReplyFile(null);
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    await supabase.from("support_tickets").update({ status: newStatus }).eq("id", ticketId);
    const ticket = supportTickets.find(t => t.id === ticketId);
    if (ticket) await supabase.rpc("send_notification_to_user", { uid: ticket.userId, msg: `Your support ticket "${ticket.subject}" has been marked as: ${newStatus.toUpperCase()}` });
    await refreshSupportTickets();
  };

  const approvePayment = async (txId: string) => { await supabase.from("transactions").update({ status: "approved" }).eq("id", txId); await loadData(); };
  const declinePayment = async (txId: string, userId: string, groupName: string) => {
    const reason = prompt("Reason for declining (optional):");
    await supabase.from("transactions").update({ status: "declined", declined_reason: reason || null }).eq("id", txId);
    await supabase.rpc("send_notification_to_user", { uid: userId, msg: `Your payment for ${groupName} was declined.${reason ? ` Reason: ${reason}` : ""} Please resubmit.` });
    await loadData();
  };

  const saveTerms = async () => { setTermSaving(true); await supabase.from("platform_settings").update({ value: termContent }).eq("key", "terms_and_conditions"); setTermSaving(false); alert("Terms saved!"); };
  const saveContactInfo = async () => { await supabase.from("contact_info").update({ whatsapp:editContact.whatsapp, facebook:editContact.facebook, email:editContact.email, call_number:editContact.callNumber, sms_number:editContact.smsNumber }).eq("id", 1); setContactInfo(editContact); alert("Contact info saved!"); };
  const generatePassword = () => { const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!"; return Array.from({length:12},()=>chars[Math.floor(Math.random()*chars.length)]).join(""); };

  const removeMemberFromSeat = async (slotId: number, userId: string, seatNo: number, groupName: string) => {
    if (!confirm(`Remove user from Seat S${seatNo}?`)) return;
    await supabase.from("slots").update({ user_id: null, status: "available", joined_at: null }).eq("id", slotId);
    await supabase.rpc("send_notification_to_user", { uid: userId, msg: `You have been removed from Seat S${seatNo} in ${groupName} by an admin.` });
    loadGroupMembers(memberGroupId);
  };

  const kickMemberFromGroup = async (userId: string, groupId: string, groupName: string) => {
    if (!confirm(`Kick this user from all seats in ${groupName}?`)) return;
    await supabase.from("slots").update({ user_id: null, status: "available", joined_at: null }).eq("group_id", groupId).eq("user_id", userId);
    await supabase.rpc("send_notification_to_user", { uid: userId, msg: `You have been removed from group ${groupName} by an admin.` });
    loadGroupMembers(memberGroupId);
  };

  const createDisbursement = async () => {
    if (!disbUserId || !disbGroupId || !disbAmount) return;
    let imageUrl: string | undefined;
    if (disbFile) {
      const path = `disb_${Date.now()}_${disbFile.name}`;
      const { data: up } = await supabase.storage.from("disbursement-proofs").upload(path, disbFile);
      if (up) { const { data: u } = supabase.storage.from("disbursement-proofs").getPublicUrl(up.path); imageUrl = u.publicUrl; }
    }
    const selectedGroup = groups.find(g => g.id === disbGroupId);
    await supabase.from("disbursements").insert({ user_id: disbUserId, group_id: disbGroupId, group_name: selectedGroup?.name || "", amount: parseFloat(disbAmount), description: disbDesc || null, seat_numbers: disbSeats || null, proof_url: imageUrl || null });
    // Mark seats as disbursed if provided
    if (disbSeats) {
      const seatNums = disbSeats.split("+").map(s => parseInt(s.replace(/\D/g,"")));
      for (const sn of seatNums) {
        await supabase.from("slots").update({ is_disbursed: true, disbursed_at: new Date().toISOString() }).eq("group_id", disbGroupId).eq("seat_no", sn).eq("user_id", disbUserId);
      }
    }
    await supabase.rpc("send_notification_to_user", { uid: disbUserId, msg: `🎉 You have been disbursed ₦${parseFloat(disbAmount).toLocaleString()} from ${selectedGroup?.name || "a group"}! Check your bank, it may take up to 24hrs.` });
    setShowDisbModal(false); setDisbUserId(""); setDisbGroupId(""); setDisbAmount(""); setDisbDesc(""); setDisbSeats(""); setDisbFile(null);
    await loadData();
  };

  const resolveDebt = async (debtId: string) => {
    await supabase.from("user_debts").update({ is_paid: true }).eq("id", debtId);
    await loadData();
  };

  const SIDEBAR_ITEMS: {id:SideTab;icon:React.ElementType;label:string;adminOnly?:boolean}[] = [
    {id:"overview",icon:BarChart3,label:"Overview"},
    {id:"users",icon:Users,label:"Users",adminOnly:true},
    {id:"groups",icon:Shield,label:"Groups",adminOnly:true},
    {id:"members",icon:Users,label:"Members",adminOnly:true},
    {id:"payments",icon:FileText,label:"Payments",adminOnly:true},
    {id:"disbursements",icon:DollarSign,label:"Disbursements",adminOnly:true},
    {id:"debts",icon:AlertTriangle,label:"Debt Tracking",adminOnly:true},
    {id:"announcements",icon:Megaphone,label:"Announcements"},
    {id:"support",icon:Bell,label:"Support"},
    {id:"contact-info",icon:Phone,label:"Contact Info",adminOnly:true},
    {id:"seat-changes",icon:ListChecks,label:"Seat Changes",adminOnly:true},
    {id:"exit-requests",icon:LogOut,label:"Exit Requests",adminOnly:true},
    {id:"audit",icon:FileText,label:"Audit Logs",adminOnly:true},
    {id:"terms",icon:Settings,label:"Terms & Cond.",adminOnly:true},
  ];

  const filteredUsers = adminUsers.filter(u => {
    if (!searchQuery) return true;
    return (u.username as string)?.toLowerCase().includes(searchQuery.toLowerCase()) || (u.email as string)?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen flex relative pt-16">
      <ParticleBackground />
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-gold/10 z-10 fixed top-16 bottom-0 left-0 pt-4 pb-4" style={{background:"rgba(5,5,5,0.92)",backdropFilter:"blur(20px)"}}>
        <div className="px-4 mb-4"><p className="gold-gradient-text font-cinzel font-black text-sm">ADMIN PANEL</p><p className="text-muted-foreground text-[10px] uppercase tracking-widest">{currentUser?.role}</p></div>
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto scrollbar-gold">
          {SIDEBAR_ITEMS.filter(i => !i.adminOnly || isAdmin).map(item => (
            <button key={item.id} onClick={() => setSideTab(item.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${sideTab===item.id?"bg-gold/15 border border-gold/25 text-gold":"text-muted-foreground hover:text-foreground hover:bg-gold/5 border border-transparent"}`}>
              <item.icon size={13} className={sideTab===item.id?"text-gold":""} />{item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-gold/10">
          <button onClick={toggleMaintenance} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${maintenanceMode?"bg-amber-900/30 border border-amber-600/30 text-amber-400":"btn-glass"}`}>
            {maintenanceMode?<ToggleRight size={13}/>:<ToggleLeft size={13}/>}{maintenanceMode?"Maintenance ON":"Maintenance OFF"}
          </button>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gold/10 flex overflow-x-auto gap-0 scrollbar-gold" style={{background:"rgba(5,5,5,0.95)",backdropFilter:"blur(20px)"}}>
        {SIDEBAR_ITEMS.filter(i => !i.adminOnly || isAdmin).map(item => (
          <button key={item.id} onClick={() => setSideTab(item.id)} className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[9px] shrink-0 ${sideTab===item.id?"text-gold":"text-muted-foreground"}`}>
            <item.icon size={14}/>{item.label}
          </button>
        ))}
      </div>

      <div className="md:ml-56 flex-1 min-w-0 relative z-10 px-4 md:px-6 py-6 pb-20 md:pb-6">
        {/* ── OVERVIEW ── */}
        {sideTab === "overview" && (
          <div className="animate-fade-up">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Platform Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{label:"Total Users",val:stats.totalUsers},{label:"Active Groups",val:stats.activeGroups},{label:"Pending Payments",val:stats.pendingPayments},{label:"Open Tickets",val:stats.openTickets}].map(s=>(
                <div key={s.label} className="glass-card-static rounded-2xl p-4">
                  <p className="text-muted-foreground text-xs">{s.label}</p>
                  <p className="gold-gradient-text font-cinzel font-black text-2xl mt-1">{s.val}</p>
                </div>
              ))}
            </div>
            <div className="glass-card-static rounded-2xl p-4 mb-6">
              <p className="text-muted-foreground text-xs mb-1">Total Revenue (Approved)</p>
              <p className="gold-gradient-text font-cinzel font-black text-3xl">₦{(stats.totalRevenue||0).toLocaleString()}</p>
            </div>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gold/10 flex items-center justify-between">
                <h3 className="gold-text font-cinzel font-bold text-sm">Recent Members</h3>
                <Btn onClick={() => setSideTab("users")} variant="gold" size="xs">View All</Btn>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["Username","Name","Role","Status","Joined"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px]">{h}</th>)}</tr></thead>
                <tbody>{adminUsers.slice(0,5).map((u,i)=>(
                  <tr key={i} className="border-b border-white/5"><td className="px-3 py-2 text-gold font-mono">@{u.username as string}</td><td className="px-3 py-2">{u.first_name as string} {u.last_name as string}</td><td className="px-3 py-2 capitalize">{u.role as string}</td><td className="px-3 py-2">{u.is_banned?"🔴 Banned":u.is_frozen?"🔵 Frozen":u.is_restricted?"🟡 Restricted":"🟢 Active"}</td><td className="px-3 py-2 text-muted-foreground">{new Date(u.created_at as string).toLocaleDateString()}</td></tr>
                ))}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {sideTab === "users" && isAdmin && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="gold-gradient-text font-cinzel font-bold text-2xl">User Management</h2>
              <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search users..." className="luxury-input pl-9 py-2 text-xs w-56"/></div>
            </div>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["Username","Name","Email","Role","Status","Score","Password","Last Login","Actions"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px] whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>{filteredUsers.map((u,i)=>(
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-gold font-mono">@{u.username as string}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{u.first_name as string} {u.last_name as string}{u.is_vip && <span className="vip-badge ml-1 text-[8px]">VIP</span>}</td>
                    <td className="px-3 py-2 text-muted-foreground text-[10px]">{u.email as string}</td>
                    <td className="px-3 py-2 capitalize">{u.role as string}</td>
                    <td className="px-3 py-2">{u.is_banned?"🔴":u.is_frozen?"🔵":u.is_restricted?"🟡":"🟢"}</td>
                    <td className="px-3 py-2 text-gold">{u.trust_score as number}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[9px] text-muted-foreground">{showPasswords[u.id as string] ? (u.password_plain as string || "N/A") : "••••••••"}</span>
                        <button onClick={() => setShowPasswords(p=>({...p,[u.id as string]:!p[u.id as string]}))} className="text-muted-foreground hover:text-gold">{showPasswords[u.id as string]?<EyeOff size={10}/>:<Eye size={10}/>}</button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-[9px]">{u.last_login_at ? new Date(u.last_login_at as string).toLocaleString() : "Never"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 flex-wrap">
                        <Btn variant="gold" size="xs" onClick={()=>{setShowUserEdit(u.id as string);setEditedUser({trustScore:String(u.trust_score),role:u.role as string})}}><Edit size={9}/>Edit</Btn>
                        <Btn variant={u.is_vip?"amber":"blue"} size="xs" onClick={()=>updateUserFlag(u.id as string,"is_vip",!u.is_vip)}><Crown size={9}/>{u.is_vip?"Rm VIP":"VIP"}</Btn>
                        <Btn variant={u.is_banned?"green":"red"} size="xs" onClick={()=>updateUserFlag(u.id as string,"is_banned",!u.is_banned)}><Ban size={9}/>{u.is_banned?"Unban":"Ban"}</Btn>
                        <Btn variant={u.is_frozen?"green":"blue"} size="xs" onClick={()=>updateUserFlag(u.id as string,"is_frozen",!u.is_frozen)}><Lock size={9}/>{u.is_frozen?"Unfreeze":"Freeze"}</Btn>
                        <Btn variant="amber" size="xs" onClick={async()=>{const pw=generatePassword();await supabase.from("profiles").update({password_plain:pw}).eq("id",u.id as string);alert(`New password: ${pw}`)}}><Key size={9}/>Gen Pw</Btn>
                        <Btn variant="amber" size="xs" onClick={async()=>{const msg=prompt("Send notification:");if(msg)await supabase.rpc("send_notification_to_user",{uid:u.id as string,msg:msg})}}><Bell size={9}/>Notify</Btn>
                      </div>
                    </td>
                  </tr>
                ))}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* ── GROUPS ── */}
        {sideTab === "groups" && isAdmin && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="gold-gradient-text font-cinzel font-bold text-2xl">Group Management</h2>
              <Btn variant="gold" onClick={()=>{setShowCreateGroup(true);setEditingGroup(null);setGName("");setGDesc("");setGAmt("");setGSlots("100");setGBank("");setGAccNum("");setGAccName("");setGPayoutAmt("");setGPayFreq("daily");setGPayDays("1");setGDisbDays("30")}}><Plus size={12}/>Create Group</Btn>
            </div>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["Name","Cycle","Deposit","Payout","Pay Freq","Slots","Status","Actions"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px]">{h}</th>)}</tr></thead>
                <tbody>{groups.map((g,i)=>(
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2 font-semibold">{g.name}</td>
                    <td className="px-3 py-2 capitalize">{g.cycleType}</td>
                    <td className="px-3 py-2 text-gold">₦{g.contributionAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-emerald-400">₦{g.payoutAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 capitalize text-muted-foreground">{g.paymentFrequency} ({g.paymentDays}d)</td>
                    <td className="px-3 py-2">{g.filledSlots}/{g.totalSlots}</td>
                    <td className="px-3 py-2">{g.isLive?<span className="live-badge">● LIVE</span>:<span className="text-muted-foreground">Inactive</span>}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Btn variant={g.isLive?"amber":"green"} size="xs" onClick={()=>toggleGroupLive(g.id,g.isLive)}><TrendingUp size={9}/>{g.isLive?"Stop":"Live"}</Btn>
                        <Btn variant="gold" size="xs" onClick={()=>{setEditingGroup(g.id);setGName(g.name);setGDesc(g.description);setGAmt(String(g.contributionAmount));setGCycle(g.cycleType);setGSlots(String(g.totalSlots));setGBank(g.bankName||"");setGAccNum(g.accountNumber||"");setGAccName(g.accountName||"");setGPayoutAmt(String(g.payoutAmount));setGPayFreq(g.paymentFrequency);setGPayDays(String(g.paymentDays));setGDisbDays(String(g.disbursementDays));setShowCreateGroup(true)}}><Edit size={9}/>Edit</Btn>
                        <Btn variant="red" size="xs" onClick={()=>deleteGroup(g.id)}><Trash2 size={9}/>Del</Btn>
                      </div>
                    </td>
                  </tr>
                ))}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* ── MEMBERS ── */}
        {sideTab === "members" && isAdmin && (
          <div className="animate-fade-up">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Member Management</h2>
            <div className="mb-4">
              <label className="luxury-label">Select Group</label>
              <select value={memberGroupId} onChange={e=>setMemberGroupId(e.target.value)} className="luxury-input">
                <option value="">-- Select a Group --</option>
                {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            {memberGroupId && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="glass-card-static rounded-xl p-4"><p className="text-muted-foreground text-xs">Total Users</p><p className="gold-gradient-text font-cinzel font-black text-2xl">{memberStats.totalUsers}</p></div>
                  <div className="glass-card-static rounded-xl p-4"><p className="text-muted-foreground text-xs">Total Seats Selected</p><p className="gold-gradient-text font-cinzel font-black text-2xl">{memberStats.totalSeats}</p></div>
                </div>
                <div className="glass-card-static rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gold/10 flex justify-between items-center">
                    <h3 className="gold-text font-cinzel font-bold text-sm">Members & Seats</h3>
                    <Btn variant="glass" size="xs" onClick={() => loadGroupMembers(memberGroupId)}><RefreshCw size={10}/>Refresh</Btn>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["Seat","User","Name","Status","VIP","Joined","Actions"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px]">{h}</th>)}</tr></thead>
                    <tbody>{groupMembers.length === 0 ? <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No members in this group</td></tr> : groupMembers.map((m,i)=>{
                      const p = m.profiles as Record<string,unknown>|null;
                      const gName2 = groups.find(g=>g.id===memberGroupId)?.name||"";
                      return (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-3 py-2 text-gold font-mono font-bold">S{m.seat_no as number}</td>
                          <td className="px-3 py-2 flex items-center gap-2">
                            {p?.profile_picture ? <img src={p.profile_picture as string} className="w-6 h-6 rounded-full object-cover border border-gold/20" alt=""/> : <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[9px] font-bold">{(p?.first_name as string)?.[0]||"?"}</div>}
                            <span className="text-muted-foreground">@{p?.username as string}</span>
                          </td>
                          <td className="px-3 py-2">{p?.first_name as string} {p?.last_name as string}</td>
                          <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${m.status==="claimed"?"text-emerald-400 bg-emerald-900/20 border border-emerald-600/30":"text-orange-400 bg-orange-900/20 border border-orange-600/30"}`}>{m.status as string}</span></td>
                          <td className="px-3 py-2">{p?.is_vip?"⭐ VIP":"-"}</td>
                          <td className="px-3 py-2 text-muted-foreground text-[9px]">{m.joined_at?new Date(m.joined_at as string).toLocaleDateString():"-"}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              <Btn variant="red" size="xs" onClick={()=>removeMemberFromSeat(m.id as number, m.user_id as string, m.seat_no as number, gName2)}><X size={9}/>Remove Seat</Btn>
                              <Btn variant="red" size="xs" onClick={()=>kickMemberFromGroup(m.user_id as string, memberGroupId, gName2)}><LogOut size={9}/>Kick</Btn>
                            </div>
                          </td>
                        </tr>
                      );
                    })}</tbody></table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {sideTab === "payments" && isAdmin && (
          <div className="animate-fade-up">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Payment Management</h2>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["Code","User","Group","Seats","Amount","Proof","Status","Date","Actions"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px] whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>{adminPayments.map((tx,i)=>{
                  const profile = tx.profiles as Record<string,unknown>|null;
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-3 py-2 font-mono text-gold text-[10px]">{tx.code as string}</td>
                      <td className="px-3 py-2">@{profile?.username as string}</td>
                      <td className="px-3 py-2">{tx.group_name as string}</td>
                      <td className="px-3 py-2 text-muted-foreground">{tx.seat_numbers as string||"-"}</td>
                      <td className="px-3 py-2 font-bold text-gold">₦{Number(tx.amount).toLocaleString()}</td>
                      <td className="px-3 py-2">{tx.screenshot_url?<a href={tx.screenshot_url as string} target="_blank" rel="noreferrer" className="text-blue-400 underline text-[10px]">View</a>:<span className="text-muted-foreground">None</span>}</td>
                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${tx.status==="pending"?"text-amber-400 border-amber-600/30 bg-amber-900/20":tx.status==="approved"?"text-emerald-400 border-emerald-600/30 bg-emerald-900/20":"text-red-400 border-red-600/30 bg-red-900/20"}`}>{tx.status as string}</span></td>
                      <td className="px-3 py-2 text-muted-foreground text-[9px]">{new Date(tx.created_at as string).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        {tx.status === "pending" && (
                          <div className="flex gap-1">
                            <Btn variant="green" size="xs" onClick={()=>approvePayment(tx.id as string)}><CheckCircle size={9}/>Approve</Btn>
                            <Btn variant="red" size="xs" onClick={()=>declinePayment(tx.id as string,tx.user_id as string,tx.group_name as string)}><X size={9}/>Decline</Btn>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* ── DISBURSEMENTS ── */}
        {sideTab === "disbursements" && isAdmin && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="gold-gradient-text font-cinzel font-bold text-2xl">Disbursements</h2>
              <Btn variant="gold" onClick={()=>setShowDisbModal(true)}><Plus size={12}/>New Disbursement</Btn>
            </div>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["Code","User","Group","Seats","Amount","Proof","Date"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px]">{h}</th>)}</tr></thead>
                <tbody>{disbursements.length===0?<tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No disbursements yet</td></tr>:disbursements.map((d,i)=>{
                  const p=d.profiles as Record<string,unknown>|null;
                  return (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-3 py-2 font-mono text-gold text-[10px]">{d.code as string}</td>
                      <td className="px-3 py-2">@{p?.username as string}</td>
                      <td className="px-3 py-2">{d.group_name as string}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.seat_numbers as string||"-"}</td>
                      <td className="px-3 py-2 font-bold text-emerald-400">₦{Number(d.amount).toLocaleString()}</td>
                      <td className="px-3 py-2">{d.image_url?<a href={d.image_url as string} target="_blank" rel="noreferrer" className="text-blue-400 underline text-[10px]">View</a>:"-"}</td>
                      <td className="px-3 py-2 text-muted-foreground text-[9px]">{new Date(d.created_at as string).toLocaleDateString()}</td>
                    </tr>
                  );
                })}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* ── DEBTS ── */}
        {sideTab === "debts" && isAdmin && (
          <div className="animate-fade-up">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Debt Tracking</h2>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["User","Group","Amount","Description","Date","Status","Actions"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px]">{h}</th>)}</tr></thead>
                <tbody>{debts.length===0?<tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No debts recorded</td></tr>:debts.map((d,i)=>{
                  const p=d.profiles as Record<string,unknown>|null;
                  return (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-3 py-2">@{p?.username as string}</td>
                      <td className="px-3 py-2">{d.group_name as string}</td>
                      <td className="px-3 py-2 font-bold text-red-400">₦{Number(d.amount).toLocaleString()}</td>
                      <td className="px-3 py-2 text-muted-foreground text-[10px]">{d.description as string||"-"}</td>
                      <td className="px-3 py-2 text-muted-foreground text-[9px]">{new Date(d.created_at as string).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{d.resolved?<span className="text-emerald-400 text-[9px] font-bold">Resolved</span>:<span className="text-red-400 text-[9px] font-bold">Unresolved</span>}</td>
                      <td className="px-3 py-2">{!d.resolved && <Btn variant="green" size="xs" onClick={()=>resolveDebt(d.id as string)}><CheckCircle size={9}/>Resolve</Btn>}</td>
                    </tr>
                  );
                })}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS ── */}
        {sideTab === "announcements" && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="gold-gradient-text font-cinzel font-bold text-2xl">Announcements</h2>
              <Btn variant="gold" onClick={()=>setShowAnnouncement(true)}><Plus size={12}/>New Announcement</Btn>
            </div>
            <div className="space-y-3">
              {announcements.map(ann=>(
                <div key={ann.id} className="glass-card-static rounded-xl p-4 border border-gold/15 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${ann.type==="announcement"?"text-blue-400 border-blue-600/30 bg-blue-900/20":ann.type==="promotion"?"text-emerald-400 border-emerald-600/30 bg-emerald-900/20":ann.type==="server-update"?"text-amber-400 border-amber-600/30 bg-amber-900/20":"text-purple-400 border-purple-600/30 bg-purple-900/20"}`}>{ann.type.replace("-"," ")}</span>
                      {ann.targetGroupId && <span className="text-xs text-muted-foreground">• Group Only</span>}
                    </div>
                    <h3 className="text-foreground font-bold text-sm">{ann.title}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{ann.body}</p>
                    {ann.imageUrl && <img src={ann.imageUrl} alt="" className="mt-2 rounded-lg max-h-24 object-cover border border-white/10"/>}
                    <p className="text-muted-foreground/40 text-[9px] mt-2">{new Date(ann.createdAt).toLocaleString()} · {ann.adminName}</p>
                  </div>
                  <Btn variant="red" size="xs" onClick={()=>deleteAnnouncement(ann.id)}><Trash2 size={9}/>Del</Btn>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUPPORT ── */}
        {sideTab === "support" && (
          <div className="animate-fade-up">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Support Tickets</h2>
            <div className="space-y-3">
              {supportTickets.length === 0 && <div className="text-center py-12 text-muted-foreground">No support tickets</div>}
              {supportTickets.map(t=>(
                <div key={t.id} className="glass-card-static rounded-xl p-4 border border-gold/10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-foreground font-semibold text-sm">{t.subject}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${t.status==="open"?"text-blue-400 border-blue-600/30 bg-blue-900/20":t.status==="replied"?"text-emerald-400 border-emerald-600/30 bg-emerald-900/20":t.status==="solved"?"text-purple-400 border-purple-600/30 bg-purple-900/20":t.status==="escalated"?"text-red-400 border-red-600/30 bg-red-900/20":"text-muted-foreground border-muted/30 bg-muted/20"}`}>{t.status}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs mb-2">{t.message}</p>
                  {t.attachmentUrl && <a href={t.attachmentUrl} target="_blank" rel="noreferrer" className="text-gold text-xs underline mb-2 block">View User Attachment</a>}
                  {t.adminReply && <div className="p-2 rounded-lg bg-gold/5 border border-gold/20 mb-2"><p className="text-xs text-gold font-bold mb-1">Your Reply:</p><p className="text-xs">{t.adminReply}</p>{t.adminReplyAttachment && <a href={t.adminReplyAttachment} target="_blank" rel="noreferrer" className="text-gold text-xs underline">View Attachment</a>}</div>}
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                    <p className="text-muted-foreground/40 text-[9px]">{new Date(t.createdAt).toLocaleString()}</p>
                    <div className="flex gap-1 flex-wrap">
                      {t.status !== "closed" && <Btn variant="gold" size="xs" onClick={()=>{setShowSupportReply(t.id);setSupportReplyText("");}}><Reply size={9}/>Reply</Btn>}
                      {t.status !== "solved" && t.status !== "closed" && <Btn variant="blue" size="xs" onClick={()=>updateTicketStatus(t.id,"solved")}><CheckCircle size={9}/>Solved</Btn>}
                      {t.status !== "escalated" && t.status !== "closed" && <Btn variant="amber" size="xs" onClick={()=>updateTicketStatus(t.id,"escalated")}><AlertTriangle size={9}/>Escalate</Btn>}
                      {t.status === "closed" ? <Btn variant="green" size="xs" onClick={()=>updateTicketStatus(t.id,"open")}><RefreshCw size={9}/>Reopen</Btn> : <Btn variant="red" size="xs" onClick={()=>updateTicketStatus(t.id,"closed")}><X size={9}/>Close</Btn>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEAT CHANGES ── */}
        {sideTab === "seat-changes" && isAdmin && (
          <div className="animate-fade-up">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Seat Change Requests</h2>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["User","Group","From","To","Reason","Status","Actions"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold text-[9px] uppercase">{h}</th>)}</tr></thead>
              <tbody>{seatChanges.map((sc,i)=>{
                const p=sc.profiles as Record<string,unknown>|null; const g=sc.groups as Record<string,unknown>|null;
                return <tr key={i} className="border-b border-white/5"><td className="px-3 py-2">@{p?.username as string}</td><td className="px-3 py-2">{g?.name as string}</td><td className="px-3 py-2 text-gold">S{sc.current_seat as number}</td><td className="px-3 py-2 text-emerald-400">S{sc.requested_seat as number}</td><td className="px-3 py-2 text-muted-foreground text-[10px]">{sc.reason as string}</td><td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${sc.status==="pending"?"text-amber-400 border-amber-600/30 bg-amber-900/20":sc.status==="approved"?"text-emerald-400 border-emerald-600/30 bg-emerald-900/20":"text-red-400 border-red-600/30 bg-red-900/20"}`}>{sc.status as string}</span></td><td className="px-3 py-2">{sc.status==="pending"&&<div className="flex gap-1"><Btn variant="green" size="xs" onClick={async()=>{await supabase.from("seat_change_requests").update({status:"approved"}).eq("id",sc.id as string);await loadData()}}><CheckCircle size={9}/>OK</Btn><Btn variant="red" size="xs" onClick={async()=>{await supabase.from("seat_change_requests").update({status:"declined"}).eq("id",sc.id as string);await loadData()}}><X size={9}/>No</Btn></div>}</td></tr>;
              })}</tbody></table>
            </div>
          </div>
        )}

        {/* ── EXIT REQUESTS ── */}
        {sideTab === "exit-requests" && isAdmin && (
          <div className="animate-fade-up">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Exit Requests</h2>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["User","Group","Reason","Status","Actions"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold text-[9px] uppercase">{h}</th>)}</tr></thead>
              <tbody>{exitRequests.map((er,i)=>{
                const p=er.profiles as Record<string,unknown>|null; const g=er.groups as Record<string,unknown>|null;
                return <tr key={i} className="border-b border-white/5"><td className="px-3 py-2">@{p?.username as string}</td><td className="px-3 py-2">{g?.name as string}</td><td className="px-3 py-2 text-muted-foreground text-[10px]">{er.reason as string}</td><td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${er.status==="pending"?"text-amber-400 border-amber-600/30 bg-amber-900/20":er.status==="approved"?"text-emerald-400 border-emerald-600/30 bg-emerald-900/20":"text-red-400 border-red-600/30 bg-red-900/20"}`}>{er.status as string}</span></td><td className="px-3 py-2">{er.status==="pending"&&<div className="flex gap-1"><Btn variant="green" size="xs" onClick={async()=>{await supabase.from("exit_requests").update({status:"approved"}).eq("id",er.id as string);await supabase.rpc("send_notification_to_user",{uid:er.user_id as string,msg:`Your exit request from ${(g?.name as string)||"group"} has been approved.`});await loadData()}}><CheckCircle size={9}/>Approve</Btn><Btn variant="red" size="xs" onClick={async()=>{await supabase.from("exit_requests").update({status:"declined"}).eq("id",er.id as string);await supabase.rpc("send_notification_to_user",{uid:er.user_id as string,msg:`Your exit request from ${(g?.name as string)||"group"} has been declined.`});await loadData()}}><X size={9}/>Decline</Btn></div>}</td></tr>;
              })}</tbody></table>
            </div>
          </div>
        )}

        {/* ── AUDIT LOGS ── */}
        {sideTab === "audit" && isAdmin && (
          <div className="animate-fade-up">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Audit Logs</h2>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              <table className="w-full text-xs"><thead><tr className="border-b border-gold/10 bg-gold/5">{["User","Action","Type","Date"].map(h=><th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold text-[9px] uppercase">{h}</th>)}</tr></thead>
              <tbody>{auditLogs.map((log,i)=>{
                const p=log.profiles as Record<string,unknown>|null;
                return <tr key={i} className="border-b border-white/5"><td className="px-3 py-2 text-gold">@{p?.username as string||"System"}</td><td className="px-3 py-2">{log.action as string}</td><td className="px-3 py-2 text-muted-foreground">{log.type as string}</td><td className="px-3 py-2 text-muted-foreground text-[9px]">{new Date(log.created_at as string).toLocaleString()}</td></tr>;
              })}</tbody></table>
            </div>
          </div>
        )}

        {/* ── CONTACT INFO ── */}
        {sideTab === "contact-info" && isAdmin && (
          <div className="animate-fade-up max-w-xl">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Contact Information</h2>
            <div className="glass-card-static rounded-2xl p-6 space-y-4">
              <div><label className="luxury-label">WhatsApp</label><input type="text" value={editContact.whatsapp} onChange={e=>setEditContact(p=>({...p,whatsapp:e.target.value}))} className="luxury-input"/></div>
              <div><label className="luxury-label">Facebook</label><input type="text" value={editContact.facebook} onChange={e=>setEditContact(p=>({...p,facebook:e.target.value}))} className="luxury-input"/></div>
              <div><label className="luxury-label">Email</label><input type="email" value={editContact.email} onChange={e=>setEditContact(p=>({...p,email:e.target.value}))} className="luxury-input"/></div>
              <div><label className="luxury-label">Call Number</label><input type="tel" value={editContact.callNumber} onChange={e=>setEditContact(p=>({...p,callNumber:e.target.value}))} className="luxury-input"/></div>
              <div><label className="luxury-label">SMS Number</label><input type="tel" value={editContact.smsNumber} onChange={e=>setEditContact(p=>({...p,smsNumber:e.target.value}))} className="luxury-input"/></div>
              <button onClick={saveContactInfo} className="btn-gold w-full py-3 rounded-xl font-bold text-sm">Save Contact Info</button>
            </div>
            <div className="glass-card-static rounded-2xl p-6 mt-6 space-y-4">
              <h3 className="gold-text font-cinzel font-bold">Send Notification</h3>
              <select value={notifTarget} onChange={e=>setNotifTarget(e.target.value)} className="luxury-input"><option value="all">All Users</option><option value="vip">VIP Members</option><option value="user">Specific User</option></select>
              {notifTarget==="user"&&<select value={notifUserId} onChange={e=>setNotifUserId(e.target.value)} className="luxury-input"><option value="">-- Select User --</option>{adminUsers.filter(u=>u.role!=="admin").map(u=><option key={u.id as string} value={u.id as string}>@{u.username as string} ({u.first_name as string})</option>)}</select>}
              <textarea value={notifMsg} onChange={e=>setNotifMsg(e.target.value)} placeholder="Notification message..." className="luxury-input resize-none h-20"/>
              <button onClick={sendNotification} className="btn-gold w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Bell size={14}/>Send Notification</button>
            </div>
          </div>
        )}

        {/* ── TERMS ── */}
        {sideTab === "terms" && isAdmin && (
          <div className="animate-fade-up max-w-2xl">
            <h2 className="gold-gradient-text font-cinzel font-bold text-2xl mb-6">Terms & Conditions</h2>
            <div className="glass-card-static rounded-2xl p-6">
              <textarea value={termContent} onChange={e=>setTermContent(e.target.value)} className="luxury-input resize-none h-80 text-xs leading-relaxed mb-4"/>
              <button onClick={saveTerms} disabled={termSaving} className="btn-gold w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60">{termSaving?"Saving...":"Save Terms & Conditions"}</button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE/EDIT GROUP MODAL */}
      {showCreateGroup && (
        <Modal title={editingGroup?"Edit Group":"Create Group"} onClose={()=>setShowCreateGroup(false)}>
          <div className="space-y-3">
            <div><label className="luxury-label">Group Name *</label><input value={gName} onChange={e=>setGName(e.target.value)} className="luxury-input"/></div>
            <div><label className="luxury-label">Description</label><textarea value={gDesc} onChange={e=>setGDesc(e.target.value)} className="luxury-input resize-none h-20"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="luxury-label">Deposit Amount (₦) *</label><input type="number" value={gAmt} onChange={e=>setGAmt(e.target.value)} className="luxury-input"/></div>
              <div><label className="luxury-label">Payout Amount (₦)</label><input type="number" value={gPayoutAmt} onChange={e=>setGPayoutAmt(e.target.value)} className="luxury-input"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="luxury-label">Cycle Type *</label><select value={gCycle} onChange={e=>setGCycle(e.target.value)} className="luxury-input"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="biweekly">Bi-Weekly</option><option value="monthly">Monthly</option></select></div>
              <div><label className="luxury-label">Payment Frequency</label><select value={gPayFreq} onChange={e=>setGPayFreq(e.target.value)} className="luxury-input"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="luxury-label">Payment Days</label><input type="number" value={gPayDays} onChange={e=>setGPayDays(e.target.value)} className="luxury-input" min="1"/></div>
              <div><label className="luxury-label">Disbursement Days</label><input type="number" value={gDisbDays} onChange={e=>setGDisbDays(e.target.value)} className="luxury-input" min="1"/></div>
            </div>
            {!editingGroup && <div><label className="luxury-label">Total Slots</label><input type="number" value={gSlots} onChange={e=>setGSlots(e.target.value)} className="luxury-input"/></div>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="luxury-label">Account Name</label><input value={gAccName} onChange={e=>setGAccName(e.target.value)} className="luxury-input"/></div>
              <div><label className="luxury-label">Account Number</label><input value={gAccNum} onChange={e=>setGAccNum(e.target.value)} className="luxury-input"/></div>
            </div>
            <div><label className="luxury-label">Bank Name</label><input value={gBank} onChange={e=>setGBank(e.target.value)} className="luxury-input"/></div>
            <button onClick={createGroup} className="btn-gold w-full py-3 rounded-xl font-bold text-sm mt-2">{editingGroup?"Update Group":"Create Group"}</button>
          </div>
        </Modal>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {showAnnouncement && (
        <Modal title="New Announcement" onClose={()=>setShowAnnouncement(false)}>
          <div className="space-y-3">
            <div><label className="luxury-label">Type *</label>
              <select value={annType} onChange={e=>setAnnType(e.target.value as Announcement["type"])} className="luxury-input">
                <option value="announcement">📢 Announcement</option>
                <option value="promotion">🎉 Promotion</option>
                <option value="server-update">🔧 Server Maintenance</option>
                <option value="group-message">💬 Group Message</option>
              </select>
            </div>
            <div><label className="luxury-label">Target Group (leave empty for global)</label>
              <select value={annGroupId} onChange={e=>setAnnGroupId(e.target.value)} className="luxury-input">
                <option value="">All Users (Global)</option>
                {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div><label className="luxury-label">Title *</label><input value={annTitle} onChange={e=>setAnnTitle(e.target.value)} className="luxury-input"/></div>
            <div><label className="luxury-label">Body *</label><textarea value={annBody} onChange={e=>setAnnBody(e.target.value)} className="luxury-input resize-none h-24"/></div>
            <div><label className="luxury-label">Image/File (Optional)</label>
              <label className="btn-glass px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-2 w-fit">
                <Upload size={12}/>{annFile?annFile.name:"Choose Image"}
                <input type="file" className="hidden" onChange={e=>setAnnFile(e.target.files?.[0]||null)} accept="image/*"/>
              </label>
            </div>
            <button onClick={sendAnnouncement} className="btn-gold w-full py-3 rounded-xl font-bold text-sm">Send Announcement</button>
          </div>
        </Modal>
      )}

      {/* USER EDIT MODAL */}
      {showUserEdit && (
        <Modal title="Edit User" onClose={()=>setShowUserEdit(null)}>
          <div className="space-y-3">
            <div><label className="luxury-label">Trust Score</label><input type="number" value={editedUser.trustScore||""} onChange={e=>setEditedUser(p=>({...p,trustScore:e.target.value}))} className="luxury-input" min="0" max="100"/></div>
            {isAdmin && <div><label className="luxury-label">Role</label><select value={editedUser.role||"user"} onChange={e=>setEditedUser(p=>({...p,role:e.target.value}))} className="luxury-input"><option value="user">User</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select></div>}
            <button onClick={saveUserEdit} className="btn-gold w-full py-3 rounded-xl font-bold text-sm">Save Changes</button>
          </div>
        </Modal>
      )}

      {/* SUPPORT REPLY MODAL */}
      {showSupportReply && (
        <Modal title="Reply to Ticket" onClose={()=>setShowSupportReply(null)}>
          <div className="space-y-3">
            <textarea value={supportReplyText} onChange={e=>setSupportReplyText(e.target.value)} placeholder="Your reply..." className="luxury-input resize-none h-28"/>
            <div><label className="luxury-label">Attachment (Optional)</label>
              <label className="btn-glass px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-2 w-fit">
                <Upload size={12}/>{supportReplyFile?supportReplyFile.name:"Choose File"}
                <input type="file" className="hidden" onChange={e=>setSupportReplyFile(e.target.files?.[0]||null)} accept="image/*,.pdf"/>
              </label>
            </div>
            <button onClick={()=>replyTicket(showSupportReply!)} className="btn-gold w-full py-3 rounded-xl font-bold text-sm">Send Reply</button>
          </div>
        </Modal>
      )}

      {/* DISBURSEMENT MODAL */}
      {showDisbModal && (
        <Modal title="Create Disbursement" onClose={()=>setShowDisbModal(false)}>
          <div className="space-y-3">
            <div><label className="luxury-label">Select User *</label>
              <select value={disbUserId} onChange={e=>setDisbUserId(e.target.value)} className="luxury-input">
                <option value="">-- Select User --</option>
                {adminUsers.filter(u=>u.role!=="admin").map(u=><option key={u.id as string} value={u.id as string}>@{u.username as string} - {u.first_name as string} {u.last_name as string}</option>)}
              </select>
            </div>
            <div><label className="luxury-label">Select Group *</label>
              <select value={disbGroupId} onChange={e=>setDisbGroupId(e.target.value)} className="luxury-input">
                <option value="">-- Select Group --</option>
                {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div><label className="luxury-label">Seat Numbers (e.g. S1+S3)</label><input value={disbSeats} onChange={e=>setDisbSeats(e.target.value)} placeholder="S1+S3" className="luxury-input"/></div>
            <div><label className="luxury-label">Amount (₦) *</label><input type="number" value={disbAmount} onChange={e=>setDisbAmount(e.target.value)} className="luxury-input"/></div>
            <div><label className="luxury-label">Description</label><textarea value={disbDesc} onChange={e=>setDisbDesc(e.target.value)} placeholder="Disbursement description..." className="luxury-input resize-none h-16"/></div>
            <div><label className="luxury-label">Proof Image (Optional)</label>
              <label className="btn-glass px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-2 w-fit">
                <Upload size={12}/>{disbFile?disbFile.name:"Choose Image"}
                <input type="file" className="hidden" onChange={e=>setDisbFile(e.target.files?.[0]||null)} accept="image/*,.pdf"/>
              </label>
            </div>
            <button onClick={createDisbursement} disabled={!disbUserId||!disbGroupId||!disbAmount} className="btn-gold w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50">Confirm Disbursement</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
