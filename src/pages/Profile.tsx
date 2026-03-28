import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import { Camera, Lock, Mail, User, Shield, CreditCard, Calendar, Upload } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

type Tab = "info" | "password" | "email" | "bank";

export default function Profile() {
  const { currentUser, isLoggedIn, setCurrentUser, refreshProfile } = useApp();
  const [tab, setTab] = useState<Tab>("info");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
  const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [nickname, setNickname] = useState(currentUser?.nickname ?? "");
  const [gender, setGender] = useState(currentUser?.gender ?? "");
  const [curPw, setCurPw] = useState(""); const [newPw, setNewPw] = useState(""); const [confPw, setConfPw] = useState("");
  const [newEmail, setNewEmail] = useState(""); const [emailPw, setEmailPw] = useState("");
  const [bankAccName, setBankAccName] = useState(currentUser?.bankDetails?.accountName ?? "");
  const [bankAccNum, setBankAccNum] = useState(currentUser?.bankDetails?.accountNumber ?? "");
  const [bankName, setBankName] = useState(currentUser?.bankDetails?.bankName ?? "");

  if (!isLoggedIn || !currentUser) return <Navigate to="/login" replace />;

  const success = () => { setSaved(true); setSaving(false); setTimeout(() => setSaved(false), 2500); };
  const fail = (msg: string) => { setError(msg); setSaving(false); };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${currentUser.id}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
    const { data } = await supabase.storage.from("profile-pictures").upload(path, file, { upsert: true });
    if (data) {
      const { data: urlData } = supabase.storage.from("profile-pictures").getPublicUrl(data.path);
      await supabase.from("profiles").update({ profile_picture: urlData.publicUrl }).eq("id", currentUser.id);
      setCurrentUser({ ...currentUser, profilePicture: urlData.publicUrl });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setError(""); setSaving(true);
    try {
      if (tab === "info") {
        await supabase.from("profiles").update({ first_name: firstName, last_name: lastName, phone, nickname, gender }).eq("id", currentUser.id);
        await supabase.from("audit_logs").insert({ user_id: currentUser.id, action: "Updated profile information", type: "profile" });
        setCurrentUser({ ...currentUser, firstName, lastName, phone, nickname, gender });
      } else if (tab === "password") {
        if (newPw !== confPw) { fail("Passwords do not match"); return; }
        if (newPw.length < 8) { fail("Password must be at least 8 characters"); return; }
        const { error: pwErr } = await supabase.auth.updateUser({ password: newPw });
        if (pwErr) { fail(pwErr.message); return; }
        await supabase.from("profiles").update({ password_plain: newPw }).eq("id", currentUser.id);
        setCurPw(""); setNewPw(""); setConfPw("");
        await supabase.from("audit_logs").insert({ user_id: currentUser.id, action: "Changed account password", type: "security" });
      } else if (tab === "email") {
        const { error: emailErr } = await supabase.auth.updateUser({ email: newEmail });
        if (emailErr) { fail(emailErr.message); return; }
        await supabase.from("profiles").update({ email: newEmail }).eq("id", currentUser.id);
        setCurrentUser({ ...currentUser, email: newEmail });
        setNewEmail(""); setEmailPw("");
      } else if (tab === "bank") {
        await supabase.from("profiles").update({ bank_acc_name: bankAccName, bank_acc_num: bankAccNum, bank_name: bankName }).eq("id", currentUser.id);
        setCurrentUser({ ...currentUser, bankDetails: { accountName: bankAccName, accountNumber: bankAccNum, bankName } });
      }
      success();
    } catch (err: unknown) { fail((err as Error).message || "Failed to save"); }
  };

  const tabs: { id: Tab; icon: typeof User; label: string }[] = [
    { id: "info", icon: User, label: "Information" },
    { id: "password", icon: Lock, label: "Password" },
    { id: "email", icon: Mail, label: "Email" },
    { id: "bank", icon: CreditCard, label: "Bank Details" },
  ];

  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10 max-w-3xl">
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="gold-gradient-text text-3xl font-cinzel font-bold">My Profile</h1>
        </div>
        <div className="glass-card-static rounded-2xl p-6 mb-6 animate-fade-up delay-100">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center text-obsidian text-2xl font-cinzel font-black animate-glow-pulse overflow-hidden">
                {currentUser.profilePicture ? <img src={currentUser.profilePicture} alt="" className="w-full h-full object-cover" /> : `${currentUser.firstName[0]}${currentUser.lastName[0]}`}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors">
                {uploading ? <span className="w-3 h-3 border border-obsidian/50 border-t-obsidian rounded-full animate-spin" /> : <Camera size={11} className="text-obsidian" />}
                <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-foreground font-bold text-xl">{currentUser.firstName} {currentUser.lastName}</h2>
                {currentUser.isVip && <span className="vip-badge">VIP ✦</span>}
                {currentUser.role === "admin" && <span className="px-2 py-0.5 rounded-full bg-red-900/30 border border-red-600/30 text-red-400 text-xs font-bold">ADMIN</span>}
              </div>
              <p className="text-muted-foreground text-sm">@{currentUser.username}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{currentUser.email}</p>
              {currentUser.nickname && <p className="text-muted-foreground text-xs italic mt-0.5">"{currentUser.nickname}"</p>}
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase tracking-widest">Trust Score</p>
              <p className="gold-gradient-text text-xl font-cinzel font-bold">{currentUser.trustScore}★</p>
              <p className="text-muted-foreground text-xs mt-1">Total Paid</p>
              <p className="gold-gradient-text font-cinzel font-bold">₦{currentUser.totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 mb-6 animate-fade-up delay-200 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(""); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? "btn-gold" : "btn-glass"}`}>
              <t.icon size={12} /><span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="glass-card-static rounded-2xl p-6 animate-fade-up delay-300">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-600/30 text-red-400 text-xs">{error}</div>}
          {saved && <div className="mb-4 p-3 rounded-lg bg-emerald-900/20 border border-emerald-600/30 text-emerald-400 text-xs">Changes saved successfully!</div>}
          {tab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="luxury-label">First Name</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="luxury-input" /></div>
                <div><label className="luxury-label">Last Name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="luxury-input" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="luxury-label">Nickname</label><input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="luxury-input" /></div>
                <div><label className="luxury-label">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="luxury-input">
                    <option value="">Select gender</option>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div><label className="luxury-label">Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="luxury-input" /></div>
            </div>
          )}
          {tab === "password" && (
            <div className="space-y-4">
              <div><label className="luxury-label">New Password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="luxury-input" placeholder="Min 8 characters" /></div>
              <div><label className="luxury-label">Confirm New Password</label><input type="password" value={confPw} onChange={e => setConfPw(e.target.value)} className="luxury-input" /></div>
            </div>
          )}
          {tab === "email" && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs">Current email: <span className="text-foreground">{currentUser.email}</span></p>
              <div><label className="luxury-label">New Email</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="luxury-input" /></div>
            </div>
          )}
          {tab === "bank" && (
            <div className="space-y-4">
              <div><label className="luxury-label">Account Name</label><input type="text" value={bankAccName} onChange={e => setBankAccName(e.target.value)} className="luxury-input" /></div>
              <div><label className="luxury-label">Account Number</label><input type="text" value={bankAccNum} onChange={e => setBankAccNum(e.target.value)} className="luxury-input" /></div>
              <div><label className="luxury-label">Bank Name</label><input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="luxury-input" /></div>
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-gold w-full py-3 rounded-xl font-bold text-sm mt-6 disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
