import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Trophy, Users, Zap, Star, TrendingUp, Phone, Mail, MessageSquare, Facebook, Megaphone, Info, Tag, Server, BookOpen, HelpCircle, HeadphonesIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import GroupCard from "@/components/GroupCard";
import ParticleBackground from "@/components/ParticleBackground";
import rtaspLogo from "@/assets/rtrasp-logo.png";
import promo1 from "@/assets/promo-1.png";
import promo2 from "@/assets/promo-2.png";
import promo3 from "@/assets/promo-3.png";
import promo4 from "@/assets/promo-4.png";
import promo5 from "@/assets/promo-5.png";
import promo6 from "@/assets/promo-6.png";
import promo7 from "@/assets/promo-7.png";
import promo8 from "@/assets/promo-8.png";
import promo9 from "@/assets/promo-9.png";

const promoImages = [promo1, promo2, promo3, promo4, promo5, promo6, promo7, promo8, promo9];

const features = [
  { icon: Shield, title: "Secure & Trusted", desc: "Every transaction is verified by admin before approval. Full audit trail." },
  { icon: Users, title: "Community Circles", desc: "Join savings groups with like-minded contributors. Build together." },
  { icon: TrendingUp, title: "Structured Payouts", desc: "Receive your full cycle payout according to your assigned slot order." },
  { icon: Zap, title: "Daily Tracking", desc: "Automated monitoring with real-time notifications for every activity." },
];
const steps = [
  { n: "01", title: "Create Account", desc: "Register with your details for a fully verified, trusted profile." },
  { n: "02", title: "Choose Your Group", desc: "Browse active savings circles and pick the one that fits your goal." },
  { n: "03", title: "Select Your Slot", desc: "Pick your seat number. Your role number determines your payout order." },
  { n: "04", title: "Contribute & Receive", desc: "Contribute on schedule. Receive your full payout when your slot arrives." },
];
const ANN_STYLE: Record<string, { border: string; bg: string; iconBg: string; icon: typeof Info }> = {
  announcement: { border: "border-emerald-600/40", bg: "bg-emerald-900/20", iconBg: "bg-emerald-900/60", icon: Info },
  promotion: { border: "border-purple-600/40", bg: "bg-purple-900/20", iconBg: "bg-purple-900/60", icon: Tag },
  "server-update": { border: "border-amber-600/40", bg: "bg-amber-900/20", iconBg: "bg-amber-900/60", icon: Server },
  "group-message": { border: "border-gold/30", bg: "bg-gold/5", iconBg: "bg-gold/20", icon: Megaphone },
};

export default function Landing() {
  const { groups, leaderboard, announcements, contactInfo, isLoggedIn } = useApp();
  const publicAnnouncements = announcements.filter(a => !a.targetGroupId);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Crossfade animation
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % promoImages.length);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(234,179,8,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-card-static px-4 py-2 rounded-full mb-8 animate-fade-up">
            <img src={rtaspLogo} alt="RTRASP" className="w-6 h-6 rounded-full object-contain" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">RTRASP</span>
          </div>
          <h1 className="gold-gradient-text text-4xl md:text-6xl font-cinzel font-black mb-6 leading-tight animate-fade-up delay-100">Rejoice Trust Rotation Ajo Savings Platform</h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light mb-4 max-w-3xl mx-auto leading-relaxed animate-fade-up delay-200">
            Join trusted savings circles and build financial discipline through structured rotating contributions.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-10 max-w-xl mx-auto animate-fade-up delay-300">
            The premier luxury rotating savings (Ajo/ROSCA) platform for Nigerians who take their financial future seriously.
          </p>
          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-400">
              <Link to="/register" className="btn-gold px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 justify-center">Get Started Free <ArrowRight size={18} /></Link>
              <Link to="/groups" className="btn-glass px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 justify-center">Explore Groups <Users size={18} /></Link>
            </div>
          )}
          {isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-400">
              <Link to="/dashboard" className="btn-gold px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 justify-center">My Dashboard <ArrowRight size={18} /></Link>
              <Link to="/groups" className="btn-glass px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 justify-center">Explore Groups <Users size={18} /></Link>
            </div>
          )}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 animate-fade-up delay-500">
            {[{ val: "₦2.4B+", label: "Total Saved" }, { val: "1,200+", label: "Active Members" }, { val: "98%", label: "Payout Rate" }].map(s => (
              <div key={s.label} className="glass-card-static p-4 rounded-xl text-center">
                <p className="gold-gradient-text text-2xl font-cinzel font-bold">{s.val}</p>
                <p className="text-muted-foreground text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMAGE SLIDESHOW - Crossfade */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">ADVERTISEMENT</span>
            <h2 className="gold-gradient-text text-2xl font-cinzel font-bold">See How It Works</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gold/20 glass-card-static relative" style={{ aspectRatio: "16/10" }}>
            {promoImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Promo ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                style={{ opacity: currentSlide === i ? 1 : 0 }}
              />
            ))}
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {promoImages.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? "bg-gold w-6" : "bg-white/30 hover:bg-white/50"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS - only visible to logged-in users */}
      {isLoggedIn && publicAnnouncements.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Megaphone size={20} className="text-gold" />
              <h2 className="gold-gradient-text text-2xl font-cinzel font-bold">Announcements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicAnnouncements.map(ann => {
                const style = ANN_STYLE[ann.type] || ANN_STYLE.announcement;
                const IconComp = style.icon;
                return (
                  <div key={ann.id} className={`rounded-2xl p-5 border ${style.border} ${style.bg} transition-all hover:scale-[1.01]`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${style.iconBg} flex items-center justify-center shrink-0`}>
                        <IconComp size={16} className="text-foreground/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-current"
                            style={{ color: style.border.includes("emerald") ? "#34d399" : style.border.includes("purple") ? "#a78bfa" : style.border.includes("amber") ? "#fbbf24" : "#eab308" }}>
                            {ann.type.replace("-", " ")}
                          </span>
                          <span className="text-muted-foreground/50 text-[10px]">{new Date(ann.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-foreground font-bold text-sm mb-1">{ann.title}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">{ann.body}</p>
                        {ann.imageUrl && <img src={ann.imageUrl} alt={ann.title} className="mt-3 rounded-xl w-full max-h-40 object-cover border border-white/10" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ACTIVE GROUPS - glassmorphism cards */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Live Opportunities</p>
            <h2 className="gold-gradient-text text-3xl md:text-4xl font-cinzel font-bold">Active Savings Groups</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {groups.slice(0, 8).map(g => <GroupCard key={g.id} group={g} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/groups" className="btn-glass px-8 py-3 rounded-xl text-sm inline-flex items-center gap-2">View All Groups <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 px-4" id="about">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">About Us</p>
            <h2 className="gold-gradient-text text-3xl md:text-4xl font-cinzel font-bold">What is RTRASP?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card-static rounded-2xl p-8 border border-gold/15">
              <h3 className="gold-text font-cinzel font-bold text-lg mb-4">Our Mission</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Rejoice Trust Rotation Ajo Savings Platform (RTRASP) is a secure, community-driven rotating savings platform built for Nigerians who want to save money together in a trusted and transparent environment.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our platform digitizes the traditional Ajo/Esusu/ROSCA system, making it more secure, transparent, and accessible. Every contribution is tracked, every payout is documented, and every member is verified.
              </p>
            </div>
            <div className="glass-card-static rounded-2xl p-8 border border-gold/15">
              <h3 className="gold-text font-cinzel font-bold text-lg mb-4">How It Works</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex items-start gap-2"><span className="text-gold font-bold">1.</span> Create an account and verify your identity</li>
                <li className="flex items-start gap-2"><span className="text-gold font-bold">2.</span> Browse and join available savings groups</li>
                <li className="flex items-start gap-2"><span className="text-gold font-bold">3.</span> Select your seat and make contributions on schedule</li>
                <li className="flex items-start gap-2"><span className="text-gold font-bold">4.</span> Receive your full payout when your turn comes</li>
                <li className="flex items-start gap-2"><span className="text-gold font-bold">5.</span> Admin verifies all payments and manages disbursements</li>
              </ul>
            </div>
          </div>
          <div className="glass-card-static rounded-2xl p-8 border border-gold/15 mt-8">
            <h3 className="gold-text font-cinzel font-bold text-lg mb-4 text-center">Why Choose RTRASP?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div><Shield size={28} className="mx-auto text-gold mb-2" /><p className="text-foreground font-bold text-sm">100% Transparent</p><p className="text-muted-foreground text-xs mt-1">Every transaction and payout is visible and traceable</p></div>
              <div><Users size={28} className="mx-auto text-gold mb-2" /><p className="text-foreground font-bold text-sm">Community Trust</p><p className="text-muted-foreground text-xs mt-1">KYC verification and trust scoring for all members</p></div>
              <div><Zap size={28} className="mx-auto text-gold mb-2" /><p className="text-foreground font-bold text-sm">Admin Protected</p><p className="text-muted-foreground text-xs mt-1">Dedicated admin team monitoring all activities 24/7</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="gold-gradient-text text-3xl md:text-4xl font-cinzel font-bold">How RTRASP Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="glass-card p-6 text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-4">
                  <span className="text-obsidian font-cinzel font-black text-sm">{s.n}</span>
                </div>
                <h3 className="gold-text font-cinzel font-bold text-sm mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USER GUIDE & TIPS */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">User Guide</p>
            <h2 className="gold-gradient-text text-3xl md:text-4xl font-cinzel font-bold">Tips & Guidelines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: BookOpen, title: "Always Pay On Time", desc: "Make your contributions before the timer resets. Late payments may result in being marked as a defaulter/debtor." },
              { icon: HelpCircle, title: "Verify Your Details", desc: "Ensure your bank details and personal information are correct to avoid payout issues." },
              { icon: HeadphonesIcon, title: "Need Help? Contact Support", desc: "Create a support ticket from your dashboard if you encounter any issues. Our team responds promptly." },
              { icon: Shield, title: "Keep Your Account Secure", desc: "Use a strong password and check your email to confirm your account after registration." },
            ].map((tip, i) => (
              <div key={tip.title} className="glass-card-static rounded-2xl p-6 border border-gold/10 flex items-start gap-4" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                  <tip.icon size={18} className="text-gold" />
                </div>
                <div>
                  <h3 className="gold-text font-bold text-sm mb-1 font-cinzel">{tip.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/guide" className="btn-glass px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">View All Guide Tips <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="glass-card p-6" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-gold" />
                </div>
                <h3 className="gold-text font-bold text-sm mb-2 font-cinzel">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      {leaderboard.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="gold-gradient-text text-3xl font-cinzel font-bold">Top Contributors</h2>
            </div>
            <div className="glass-card-static rounded-2xl overflow-hidden">
              {leaderboard.slice(0, 10).map((u, i) => (
                <div key={`${u.id}-${i}`} className="flex items-center gap-4 px-6 py-4 border-b border-gold/10 last:border-0 hover:bg-gold/5 transition-colors">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-cinzel font-black text-sm shrink-0 ${i === 0 ? "bg-gold text-obsidian" : i === 1 ? "bg-muted text-foreground" : i === 2 ? "bg-amber-800/40 text-amber-400" : "bg-muted/30 text-muted-foreground"}`}>{i + 1}</span>
                  {u.profilePicture ? <img src={u.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover border border-gold/20 shrink-0" /> : <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-obsidian font-bold text-sm shrink-0">{u.firstName?.[0] || "?"}</div>}
                  <div className="flex-1">
                    <p className="text-foreground font-semibold text-sm">{u.nickname || u.firstName}</p>
                    {u.isVip && <span className="vip-badge text-[9px]">VIP ✦</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-bold text-sm font-cinzel">{u.trustScore}★</p>
                    <p className="text-muted-foreground text-xs">₦{u.totalPaid.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="gold-gradient-text text-3xl font-cinzel font-bold mb-8">Get In Touch</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {contactInfo.whatsapp && <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="btn-glass px-6 py-3 rounded-xl text-sm flex items-center gap-2"><MessageSquare size={14} />WhatsApp</a>}
            {contactInfo.facebook && <a href={contactInfo.facebook} target="_blank" rel="noreferrer" className="btn-glass px-6 py-3 rounded-xl text-sm flex items-center gap-2"><Facebook size={14} />Facebook</a>}
            {contactInfo.email && <a href={`mailto:${contactInfo.email}`} className="btn-glass px-6 py-3 rounded-xl text-sm flex items-center gap-2"><Mail size={14} />{contactInfo.email}</a>}
            {contactInfo.callNumber && <a href={`tel:${contactInfo.callNumber}`} className="btn-glass px-6 py-3 rounded-xl text-sm flex items-center gap-2"><Phone size={14} />{contactInfo.callNumber}</a>}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-gold/10 text-center">
        <p className="gold-gradient-text font-cinzel font-bold text-sm">REJOICE TRUST ROTATION AJO SAVINGS PLATFORM (RTRASP)</p>
        <p className="text-muted-foreground text-xs mt-2">© 2026 RTRASP. All rights reserved.</p>
      </footer>
    </div>
  );
}
