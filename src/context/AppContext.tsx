import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "moderator" | "user";

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  isVip: boolean;
  isRestricted: boolean;
  isBanned: boolean;
  isFrozen: boolean;
  profilePicture?: string;
  totalPaid: number;
  trustScore: number;
  activeSlots: number;
  unreadNotifications: number;
  dob?: string;
  age?: number;
  stateOfOrigin?: string;
  lga?: string;
  currentState?: string;
  currentAddress?: string;
  homeAddress?: string;
  bvnNin?: string;
  nickname?: string;
  gender?: string;
  bankDetails?: BankDetails;
  lastLoginAt?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  contributionAmount: number;
  cycleType: "daily" | "weekly" | "biweekly" | "monthly";
  totalSlots: number;
  filledSlots: number;
  isLive: boolean;
  isLocked: boolean;
  chatLocked: boolean;
  payoutAccount?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  termsText: string;
  liveAt?: string;
  createdAt: string;
  payoutAmount: number;
  disbursementDays: number;
  paymentFrequency: string;
  paymentDays: number;
}

export interface Slot {
  id: number;
  groupId: string;
  userId?: string;
  username?: string;
  fullName?: string;
  nickname?: string;
  isVip?: boolean;
  profilePicture?: string;
  status: "available" | "reserved" | "claimed" | "locked";
  isDisbursed?: boolean;
  disbursedAt?: string;
  joinedAt?: string;
  seatNo: number;
}

export interface Transaction {
  id: string;
  code: string;
  groupName: string;
  groupId?: string;
  userId: string;
  amount: number;
  status: "pending" | "approved" | "declined";
  date: string;
  screenshotUrl?: string;
  seatNumbers?: string;
  declinedReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: "announcement" | "promotion" | "server-update" | "group-message";
  imageUrl?: string;
  targetGroupId?: string;
  createdAt: string;
  adminName: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  username?: string;
  subject: string;
  message: string;
  attachmentUrl?: string;
  status: "open" | "replied" | "closed";
  createdAt: string;
  adminReply?: string;
  adminReplyAttachment?: string;
  repliedAt?: string;
}

export interface ContactInfo {
  whatsapp: string;
  facebook: string;
  email: string;
  callNumber: string;
  smsNumber: string;
}

interface AppContextType {
  currentUser: User | null;
  session: Session | null;
  setCurrentUser: (user: User | null) => void;
  isLoggedIn: boolean;
  notifications: Notification[];
  markNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  groups: Group[];
  refreshGroups: () => Promise<void>;
  transactions: Transaction[];
  refreshTransactions: () => Promise<void>;
  leaderboard: User[];
  refreshLeaderboard: () => Promise<void>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  refreshAnnouncements: () => Promise<void>;
  supportTickets: SupportTicket[];
  setSupportTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  refreshSupportTickets: () => Promise<void>;
  contactInfo: ContactInfo;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactInfo>>;
  refreshContactInfo: () => Promise<void>;
  loading: boolean;
  maintenanceMode: boolean;
  setMaintenanceMode: React.Dispatch<React.SetStateAction<boolean>>;
  refreshMaintenanceMode: () => Promise<void>;
  termsAndConditions: string;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function mapProfile(p: Record<string, unknown>): User {
  return {
    id: p.id as string,
    username: p.username as string,
    firstName: p.first_name as string,
    middleName: p.middle_name as string | undefined,
    lastName: p.last_name as string,
    email: p.email as string,
    phone: (p.phone as string) || "",
    role: (p.role as UserRole) || "user",
    isVip: Boolean(p.is_vip),
    isRestricted: Boolean(p.is_restricted),
    isBanned: Boolean(p.is_banned),
    isFrozen: Boolean(p.is_frozen),
    nickname: p.nickname as string | undefined,
    gender: p.gender as string | undefined,
    dob: p.dob as string | undefined,
    age: p.age as number | undefined,
    stateOfOrigin: p.state_of_origin as string | undefined,
    lga: p.lga as string | undefined,
    currentState: p.current_state as string | undefined,
    currentAddress: p.current_address as string | undefined,
    homeAddress: p.home_address as string | undefined,
    bvnNin: p.bvn_nin as string | undefined,
    profilePicture: p.profile_picture as string | undefined,
    totalPaid: Number(p.total_paid) || 0,
    trustScore: Number(p.trust_score) || 50,
    unreadNotifications: Number(p.unread_notifications) || 0,
    activeSlots: 0,
    lastLoginAt: p.last_login_at as string | undefined,
    bankDetails: (p.bank_acc_name as string) ? {
      accountName: p.bank_acc_name as string,
      accountNumber: p.bank_acc_num as string,
      bankName: p.bank_name as string,
    } : undefined,
  };
}

function mapGroup(g: Record<string, unknown>): Group {
  return {
    id: g.id as string,
    name: g.name as string,
    description: (g.description as string) || "",
    contributionAmount: Number(g.contribution_amount) || 0,
    cycleType: (g.cycle_type as Group["cycleType"]) || "daily",
    totalSlots: Number(g.total_slots) || 100,
    filledSlots: Number(g.filled_slots) || 0,
    isLive: Boolean(g.is_live),
    isLocked: Boolean(g.is_locked),
    chatLocked: Boolean(g.chat_locked),
    payoutAccount: g.payout_account as string | undefined,
    bankName: g.bank_name as string | undefined,
    accountNumber: g.account_number as string | undefined,
    accountName: g.account_name as string | undefined,
    termsText: (g.terms_text as string) || "",
    liveAt: g.live_at as string | undefined,
    createdAt: g.created_at as string,
    payoutAmount: Number(g.payout_amount) || 0,
    disbursementDays: Number(g.disbursement_days) || 30,
    paymentFrequency: (g.payment_frequency as string) || "daily",
    paymentDays: Number(g.payment_days) || 1,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ whatsapp: "", facebook: "", email: "", callNumber: "", smsNumber: "" });
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState("");

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
  }, []);

  const refreshMaintenanceMode = useCallback(async () => {
    try {
      const { data } = await supabase.from("platform_settings").select("value").eq("key", "maintenance_mode").single();
      setMaintenanceMode(data?.value === "true");
    } catch {}
  }, []);

  const refreshGroups = useCallback(async () => {
    try {
      const { data } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
      if (data) setGroups(data.map(g => mapGroup(g as unknown as Record<string, unknown>)));
    } catch {}
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const { data } = await supabase.rpc("get_leaderboard");
      if (data) {
        setLeaderboard(data.map((u: Record<string, unknown>) => ({
          id: u.id as string,
          username: "",
          firstName: u.first_name as string,
          lastName: u.last_name as string,
          email: "",
          phone: "",
          role: "user" as UserRole,
          isVip: Boolean(u.is_vip),
          isRestricted: false,
          isBanned: false,
          isFrozen: false,
          nickname: u.nickname as string | undefined,
          profilePicture: u.profile_picture as string | undefined,
          totalPaid: Number(u.total_paid) || 0,
          trustScore: Number(u.trust_score) || 50,
          activeSlots: 0,
          unreadNotifications: 0,
        })));
      }
    } catch {}
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) {
        const mapped: Notification[] = data.map((n: Record<string, unknown>) => ({
          id: n.id as string,
          userId: n.user_id as string,
          message: n.message as string,
          read: Boolean(n.is_read),
          createdAt: n.created_at as string,
        }));
        setNotifications(mapped);
        const unread = mapped.filter(n => !n.read).length;
        setCurrentUserState(prev => prev ? { ...prev, unreadNotifications: unread } : null);
      }
    } catch {}
  }, []);

  const refreshTransactions = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setTransactions(data.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          code: t.code as string,
          groupName: t.group_name as string,
          groupId: t.group_id as string | undefined,
          userId: t.user_id as string,
          amount: Number(t.amount) || 0,
          status: t.status as Transaction["status"],
          date: t.created_at as string,
          screenshotUrl: t.screenshot_url as string | undefined,
          seatNumbers: t.seat_numbers as string | undefined,
          declinedReason: t.declined_reason as string | undefined,
        })));
      }
    } catch {}
  }, []);

  const refreshAnnouncements = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setAnnouncements(data.map((a: Record<string, unknown>) => ({
          id: a.id as string,
          title: a.title as string,
          body: a.body as string,
          type: a.type as Announcement["type"],
          imageUrl: a.image_url as string | undefined,
          targetGroupId: a.target_group_id as string | undefined,
          createdAt: a.created_at as string,
          adminName: (a.admin_name as string) || "Admin",
        })));
      }
    } catch {}
  }, []);

  const refreshSupportTickets = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setSupportTickets(data.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          userId: t.user_id as string,
          subject: t.subject as string,
          message: t.message as string,
          attachmentUrl: t.attachment_url as string | undefined,
          status: t.status as SupportTicket["status"],
          createdAt: t.created_at as string,
          adminReply: t.admin_reply as string | undefined,
          adminReplyAttachment: t.admin_reply_attachment as string | undefined,
          repliedAt: t.replied_at as string | undefined,
        })));
      }
    } catch {}
  }, []);

  const refreshContactInfo = useCallback(async () => {
    try {
      const { data } = await supabase.from("contact_info").select("*").eq("id", 1).single();
      if (data) {
        setContactInfo({
          whatsapp: (data as Record<string, unknown>).whatsapp as string || "",
          facebook: (data as Record<string, unknown>).facebook as string || "",
          email: (data as Record<string, unknown>).email as string || "",
          callNumber: (data as Record<string, unknown>).call_number as string || "",
          smsNumber: (data as Record<string, unknown>).sms_number as string || "",
        });
      }
    } catch {}
  }, []);

  const markNotificationsRead = useCallback(async () => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setCurrentUserState(prev => prev ? { ...prev, unreadNotifications: 0 } : null);
    } catch {}
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setCurrentUserState(mapProfile(data as unknown as Record<string, unknown>));
  }, []);

  // Load terms
  const loadTerms = useCallback(async () => {
    try {
      const { data } = await supabase.from("platform_settings").select("value").eq("key", "terms_and_conditions").single();
      if (data) setTermsAndConditions((data as Record<string, unknown>).value as string);
    } catch {}
  }, []);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess);
      if (sess?.user) {
        // Load profile
        setTimeout(async () => {
          const { data } = await supabase.from("profiles").select("*").eq("id", sess.user.id).single();
          if (data) {
            const mapped = mapProfile(data as unknown as Record<string, unknown>);
            setCurrentUserState(mapped);
            // Update last login
            await supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", sess.user.id);
            // Load user-specific data
            const [notifData, txData, ticketsData] = await Promise.all([
              supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50),
              supabase.from("transactions").select("*").order("created_at", { ascending: false }),
              supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
            ]);
            if (notifData.data) {
              const mapped2: Notification[] = notifData.data.map((n: Record<string, unknown>) => ({
                id: n.id as string, userId: n.user_id as string, message: n.message as string,
                read: Boolean(n.is_read), createdAt: n.created_at as string,
              }));
              setNotifications(mapped2);
              setCurrentUserState(prev => prev ? { ...prev, unreadNotifications: mapped2.filter(n => !n.read).length } : null);
            }
            if (txData.data) {
              setTransactions(txData.data.map((t: Record<string, unknown>) => ({
                id: t.id as string, code: t.code as string, groupName: t.group_name as string,
                groupId: t.group_id as string | undefined, userId: t.user_id as string,
                amount: Number(t.amount) || 0, status: t.status as Transaction["status"],
                date: t.created_at as string, screenshotUrl: t.screenshot_url as string | undefined,
                seatNumbers: t.seat_numbers as string | undefined,
              })));
            }
            if (ticketsData.data) {
              setSupportTickets(ticketsData.data.map((t: Record<string, unknown>) => ({
                id: t.id as string, userId: t.user_id as string, subject: t.subject as string,
                message: t.message as string, attachmentUrl: t.attachment_url as string | undefined,
                status: t.status as SupportTicket["status"], createdAt: t.created_at as string,
                adminReply: t.admin_reply as string | undefined, repliedAt: t.replied_at as string | undefined,
              })));
            }
          }
        }, 0);
      } else {
        setCurrentUserState(null);
        setNotifications([]);
        setTransactions([]);
        setSupportTickets([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initial load of public data
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        refreshGroups(),
        refreshAnnouncements(),
        refreshContactInfo(),
        refreshLeaderboard(),
        refreshMaintenanceMode(),
        loadTerms(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser,
      session,
      setCurrentUser,
      isLoggedIn: !!currentUser,
      notifications,
      markNotificationsRead,
      refreshNotifications,
      groups,
      refreshGroups,
      transactions,
      refreshTransactions,
      leaderboard,
      refreshLeaderboard,
      announcements,
      setAnnouncements,
      refreshAnnouncements,
      supportTickets,
      setSupportTickets,
      refreshSupportTickets,
      contactInfo,
      setContactInfo,
      refreshContactInfo,
      loading,
      maintenanceMode,
      setMaintenanceMode,
      refreshMaintenanceMode,
      termsAndConditions,
      refreshProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
