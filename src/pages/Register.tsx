import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ChevronRight, CheckSquare, Square } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from "@/components/ParticleBackground";

const nigerianStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River",
  "Delta","Ebonyi","Edo","Ekiti","Enugu","FCT-Abuja","Gombe","Imo","Jigawa","Kaduna","Kano",
  "Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo",
  "Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"
];

type Step = 1 | 2 | 3 | 4;

export default function Register() {
  const [step, setStep] = useState<Step>(1);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { isLoggedIn, termsAndConditions } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", middleName: "", lastName: "", dob: "",
    phone: "", whatsappNumber: "", stateOfOrigin: "", lga: "", currentState: "", currentAddress: "",
    fullHomeAddress: "", username: "", email: "", password: "", confirmPassword: "",
    bvnNin: "", nickname: "", gender: "",
    bankAccName: "", bankName: "", bankAccNum: "",
  });

  if (isLoggedIn) { navigate("/dashboard", { replace: true }); return null; }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const doSubmit = async () => {
    setLoading(true); setError("");
    try {
      const { data: existingUser } = await supabase.from("profiles").select("id").eq("username", form.username).single();
      if (existingUser) { setError("Username already taken. Please choose another."); setLoading(false); return; }

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { username: form.username, first_name: form.firstName, last_name: form.lastName } }
      });
      if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("profiles").update({
          username: form.username, first_name: form.firstName, middle_name: form.middleName || null,
          last_name: form.lastName, phone: form.phone || null, whatsapp_number: form.whatsappNumber || null,
          nickname: form.nickname || null, gender: form.gender || null, dob: form.dob || null,
          state_of_origin: form.stateOfOrigin || null, lga: form.lga || null,
          current_state: form.currentState || null, current_address: form.currentAddress || null,
          home_address: form.fullHomeAddress || null, bvn_nin: form.bvnNin || null, email: form.email,
          password_plain: form.password,
          bank_acc_name: form.bankAccName || null, bank_name: form.bankName || null, bank_acc_num: form.bankAccNum || null,
        }).eq("id", data.user.id);

        await supabase.from("notifications").insert({
          user_id: data.user.id,
          message: `Welcome to Rejoice Trust Ajo, ${form.firstName}! Your account has been created successfully. Start exploring savings groups.`,
        });
        await supabase.from("audit_logs").insert({
          user_id: data.user.id,
          action: "You accepted the platform terms and conditions before creating this account",
          type: "user",
        });
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) { setError("You must accept the Terms and Conditions to create an account."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const stepLabels = ["Personal", "Location", "Financial/BVN", "Legal"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10 relative">
      <ParticleBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_40%,rgba(234,179,8,0.04)_0%,transparent_60%)]" />
      <div className="relative w-full max-w-2xl animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center animate-glow-pulse">
              <span className="text-obsidian font-cinzel font-black">RA</span>
            </div>
          </Link>
          <h1 className="gold-gradient-text text-3xl font-cinzel font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-2">Join the Rejoice Ajo savings community</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {stepLabels.map((label, i) => {
            const s = (i + 1) as Step;
            return (
              <div key={s} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${step === s ? "bg-gold text-obsidian" : step > s ? "bg-gold/20 text-gold border border-gold/30" : "bg-muted/30 text-muted-foreground"}`}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">{step > s ? "✓" : s}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < 3 && <ChevronRight size={12} className="text-muted-foreground" />}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass-card-static p-8 rounded-2xl border border-gold/20">
            {step === 1 && (
              <div className="space-y-4 animate-fade-up">
                <h2 className="gold-text font-cinzel font-bold text-sm uppercase tracking-widest mb-6">Step 1: Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="luxury-label">First Name *</label><input type="text" value={form.firstName} onChange={set("firstName")} placeholder="Rejoice" className="luxury-input" required /></div>
                  <div><label className="luxury-label">Middle Name</label><input type="text" value={form.middleName} onChange={set("middleName")} placeholder="Grace" className="luxury-input" /></div>
                  <div><label className="luxury-label">Last Name *</label><input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Adeyemi" className="luxury-input" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="luxury-label">Nickname *</label><input type="text" value={form.nickname} onChange={set("nickname")} placeholder="GoldMember" className="luxury-input" required /></div>
                  <div><label className="luxury-label">Gender *</label>
                    <select value={form.gender} onChange={set("gender")} className="luxury-input" required>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="luxury-label">Date of Birth *</label><input type="date" value={form.dob} onChange={set("dob")} className="luxury-input" required /></div>
                  <div><label className="luxury-label">Email Address *</label><input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className="luxury-input" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="luxury-label">Phone Number *</label><input type="tel" value={form.phone} onChange={set("phone")} placeholder="+234 801 234 5678" className="luxury-input" required /></div>
                  <div>
                    <label className="luxury-label">WhatsApp Number *</label>
                    <input type="tel" value={form.whatsappNumber} onChange={set("whatsappNumber")} placeholder="+234 801 234 5678" className="luxury-input" required />
                    <p className="text-muted-foreground/60 text-[9px] mt-1">Note: Admin may contact you on this number to verify your identity.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="luxury-label">Username *</label><input type="text" value={form.username} onChange={set("username")} placeholder="goldmember" className="luxury-input" required /></div>
                  <div><label className="luxury-label">Password *</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min 8 chars" className="luxury-input pr-10" required minLength={8} />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold p-1">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                  </div>
                </div>
                <div><label className="luxury-label">Confirm Password *</label>
                  <input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat your password" className="luxury-input" required /></div>
                <button type="button" onClick={() => { if (!form.firstName || !form.lastName || !form.nickname || !form.gender || !form.email || !form.password) { setError("Please fill in all required fields"); return; } if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; } setError(""); setStep(2); }}
                  className="btn-gold w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-4">
                  Next <ArrowRight size={16} />
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4 animate-fade-up">
                <h2 className="gold-text font-cinzel font-bold text-sm uppercase tracking-widest mb-6">Step 2: Location Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="luxury-label">State of Origin *</label>
                    <select value={form.stateOfOrigin} onChange={set("stateOfOrigin")} className="luxury-input" required>
                      <option value="">Select state</option>{nigerianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                  <div><label className="luxury-label">LGA *</label><input type="text" value={form.lga} onChange={set("lga")} placeholder="Your LGA" className="luxury-input" required /></div>
                </div>
                <div><label className="luxury-label">Full Home Address *</label><textarea value={form.fullHomeAddress} onChange={set("fullHomeAddress")} placeholder="Full home address" className="luxury-input resize-none h-20" required /></div>
                <div><label className="luxury-label">Current State *</label>
                  <select value={form.currentState} onChange={set("currentState")} className="luxury-input" required>
                    <option value="">Select state</option>{nigerianStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select></div>
                <div><label className="luxury-label">Current Full Address *</label><input type="text" value={form.currentAddress} onChange={set("currentAddress")} placeholder="No. 5 Musa Street, Lagos" className="luxury-input" required /></div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-glass flex-1 py-3 rounded-xl font-semibold text-sm">Back</button>
                  <button type="button" onClick={() => { setError(""); setStep(3); }} className="btn-gold flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">Next <ArrowRight size={16} /></button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4 animate-fade-up">
                <h2 className="gold-text font-cinzel font-bold text-sm uppercase tracking-widest mb-4">Step 3: Financial Details / BVN</h2>
                <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 mb-2">
                  <p className="text-foreground text-xs font-bold mb-1">⚠️ Disbursement Account Details</p>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">Make sure your account details are correct before submitting to avoid wrong disbursement.</p>
                </div>
                <div><label className="luxury-label">Full Name on Account *</label><input type="text" value={form.bankAccName} onChange={set("bankAccName")} placeholder="Rejoice Grace Adeyemi" className="luxury-input" required /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="luxury-label">Bank Name *</label><input type="text" value={form.bankName} onChange={set("bankName")} placeholder="First Bank" className="luxury-input" required /></div>
                  <div><label className="luxury-label">Account Number *</label><input type="text" value={form.bankAccNum} onChange={set("bankAccNum")} placeholder="0123456789" className="luxury-input" required /></div>
                </div>
                <div>
                  <label className="luxury-label">BVN Number</label>
                  <input type="text" value={form.bvnNin} onChange={set("bvnNin")} placeholder="BVN number" className="luxury-input" />
                  <div className="p-3 rounded-lg bg-blue-900/10 border border-blue-600/20 mt-2">
                    <p className="text-blue-400 text-[10px] leading-relaxed"><strong>Why we ask for your BVN:</strong> Your BVN is required to verify your identity. This is legally required as part of the Know Your Customer (KYC) process. We require this number from you as a means of verifying your identity. Please note that your BVN does NOT give us access to your bank details. It is only used for verification which makes it easy for you to deposit and withdraw your funds as well as keep our platform safe from scammers.</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-glass flex-1 py-3 rounded-xl font-semibold text-sm">Back</button>
                  <button type="button" onClick={() => { if (!form.bankAccName || !form.bankName || !form.bankAccNum) { setError("Fill all required bank details"); return; } setError(""); setStep(4); }}
                    className="btn-gold flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">Next <ArrowRight size={16} /></button>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4 animate-fade-up">
                <h2 className="gold-text font-cinzel font-bold text-sm uppercase tracking-widest mb-4">Step 4: Terms & Conditions</h2>
                <div className="rounded-xl border border-gold/20 p-4 max-h-60 overflow-y-auto scrollbar-gold text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {termsAndConditions || "Loading terms..."}
                </div>
                <button type="button" onClick={() => setShowTermsModal(true)}
                  className="text-gold text-xs underline hover:text-gold/80 transition-colors">
                  Read Full Terms & Conditions
                </button>
                <div className="flex items-start gap-3 mt-4 p-4 rounded-xl border border-gold/20 bg-gold/5 cursor-pointer"
                  onClick={() => setTermsAccepted(!termsAccepted)}>
                  <div className="mt-0.5 shrink-0 text-gold">{termsAccepted ? <CheckSquare size={18} /> : <Square size={18} />}</div>
                  <p className="text-sm text-foreground leading-relaxed">
                    I have read and accept the <span className="text-gold font-semibold">Terms and Conditions</span> of the Rejoice Trust Ajo Platform. I understand all contributions are voluntary and agree to abide by platform rules.
                  </p>
                </div>
                {error && <div className="py-2 px-3 rounded-lg bg-red-900/20 border border-red-600/30 text-red-400 text-xs">{error}</div>}
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(3)} className="btn-glass flex-1 py-3 rounded-xl font-semibold text-sm">Back</button>
                  <button type="submit" disabled={loading || !termsAccepted}
                    className="btn-gold flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />Creating...</span> : <>I Accept &amp; Create Account</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
        <p className="text-center text-muted-foreground text-sm mt-6">
          Already have an account? <Link to="/login" className="text-gold font-semibold hover:underline">Sign In</Link>
        </p>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-2xl glass-card-static rounded-2xl border border-gold/20 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gold/10 flex items-center justify-between">
              <h3 className="gold-gradient-text font-cinzel font-bold text-lg">Terms & Conditions</h3>
              <button onClick={() => setShowTermsModal(false)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <div className="p-6 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{termsAndConditions}</div>
            <div className="p-4 border-t border-gold/10">
              <button onClick={() => { setTermsAccepted(true); setShowTermsModal(false); }} className="btn-gold w-full py-3 rounded-xl font-bold text-sm">I Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md glass-card-static rounded-2xl border border-gold/20">
            <div className="p-6 border-b border-gold/10">
              <h3 className="gold-gradient-text font-cinzel font-bold text-lg">Confirm Bank Details</h3>
            </div>
            <div className="p-6">
              <p className="text-foreground text-sm mb-4">Are you sure your bank details are correct?</p>
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 space-y-2">
                <p className="text-foreground text-sm"><strong>Name:</strong> {form.bankAccName}</p>
                <p className="text-foreground text-sm"><strong>Bank:</strong> {form.bankName}</p>
                <p className="text-foreground text-sm font-mono"><strong>Account:</strong> {form.bankAccNum}</p>
              </div>
              <p className="text-muted-foreground text-xs mt-3">If this is not correct, click "Back" to modify it.</p>
            </div>
            <div className="p-4 border-t border-gold/10 flex gap-3">
              <button onClick={() => { setShowConfirmModal(false); setStep(3); }} className="btn-glass flex-1 py-3 rounded-xl text-sm font-semibold">Back</button>
              <button onClick={() => { setShowConfirmModal(false); doSubmit(); }} className="btn-gold flex-1 py-3 rounded-xl text-sm font-bold">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
