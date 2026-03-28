export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          admin_name: string | null
          body: string
          created_at: string | null
          id: string
          image_url: string | null
          target_group_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          admin_name?: string | null
          body: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          target_group_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          admin_name?: string | null
          body?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          target_group_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_target_group_id_fkey"
            columns: ["target_group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          admin_name: string | null
          created_at: string | null
          id: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          text: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          text: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          text?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_info: {
        Row: {
          call_number: string | null
          email: string | null
          facebook: string | null
          id: number
          sms_number: string | null
          whatsapp: string | null
        }
        Insert: {
          call_number?: string | null
          email?: string | null
          facebook?: string | null
          id?: number
          sms_number?: string | null
          whatsapp?: string | null
        }
        Update: {
          call_number?: string | null
          email?: string | null
          facebook?: string | null
          id?: number
          sms_number?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      disbursements: {
        Row: {
          amount: number | null
          code: string | null
          created_at: string | null
          description: string | null
          group_id: string | null
          group_name: string | null
          id: string
          proof_url: string | null
          seat_numbers: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          group_name?: string | null
          id?: string
          proof_url?: string | null
          seat_numbers?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          group_name?: string | null
          id?: string
          proof_url?: string | null
          seat_numbers?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disbursements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      exit_requests: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          reason: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          reason?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          reason?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exit_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          chat_locked: boolean | null
          contribution_amount: number | null
          created_at: string | null
          cycle_type: string | null
          description: string | null
          disbursement_days: number | null
          filled_slots: number | null
          id: string
          is_live: boolean | null
          is_locked: boolean | null
          live_at: string | null
          name: string
          payment_days: number | null
          payment_frequency: string | null
          payout_account: string | null
          payout_amount: number | null
          terms_text: string | null
          total_slots: number | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          chat_locked?: boolean | null
          contribution_amount?: number | null
          created_at?: string | null
          cycle_type?: string | null
          description?: string | null
          disbursement_days?: number | null
          filled_slots?: number | null
          id?: string
          is_live?: boolean | null
          is_locked?: boolean | null
          live_at?: string | null
          name: string
          payment_days?: number | null
          payment_frequency?: string | null
          payout_account?: string | null
          payout_amount?: number | null
          terms_text?: string | null
          total_slots?: number | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          chat_locked?: boolean | null
          contribution_amount?: number | null
          created_at?: string | null
          cycle_type?: string | null
          description?: string | null
          disbursement_days?: number | null
          filled_slots?: number | null
          id?: string
          is_live?: boolean | null
          is_locked?: boolean | null
          live_at?: string | null
          name?: string
          payment_days?: number | null
          payment_frequency?: string | null
          payout_account?: string | null
          payout_amount?: number | null
          terms_text?: string | null
          total_slots?: number | null
        }
        Relationships: []
      }
      guide_tips: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: number
          key: string
          value: string | null
        }
        Insert: {
          id?: number
          key: string
          value?: string | null
        }
        Update: {
          id?: number
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          bank_acc_name: string | null
          bank_acc_num: string | null
          bank_name: string | null
          bvn_nin: string | null
          created_at: string | null
          current_address: string | null
          current_state: string | null
          dob: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          home_address: string | null
          id: string
          is_banned: boolean | null
          is_frozen: boolean | null
          is_restricted: boolean | null
          is_vip: boolean | null
          last_login_at: string | null
          last_name: string | null
          lga: string | null
          middle_name: string | null
          nickname: string | null
          password_plain: string | null
          phone: string | null
          profile_picture: string | null
          role: string | null
          state_of_origin: string | null
          total_paid: number | null
          trust_score: number | null
          unread_notifications: number | null
          username: string | null
          whatsapp_number: string | null
        }
        Insert: {
          age?: number | null
          bank_acc_name?: string | null
          bank_acc_num?: string | null
          bank_name?: string | null
          bvn_nin?: string | null
          created_at?: string | null
          current_address?: string | null
          current_state?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          home_address?: string | null
          id: string
          is_banned?: boolean | null
          is_frozen?: boolean | null
          is_restricted?: boolean | null
          is_vip?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          lga?: string | null
          middle_name?: string | null
          nickname?: string | null
          password_plain?: string | null
          phone?: string | null
          profile_picture?: string | null
          role?: string | null
          state_of_origin?: string | null
          total_paid?: number | null
          trust_score?: number | null
          unread_notifications?: number | null
          username?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          age?: number | null
          bank_acc_name?: string | null
          bank_acc_num?: string | null
          bank_name?: string | null
          bvn_nin?: string | null
          created_at?: string | null
          current_address?: string | null
          current_state?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          home_address?: string | null
          id?: string
          is_banned?: boolean | null
          is_frozen?: boolean | null
          is_restricted?: boolean | null
          is_vip?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          lga?: string | null
          middle_name?: string | null
          nickname?: string | null
          password_plain?: string | null
          phone?: string | null
          profile_picture?: string | null
          role?: string | null
          state_of_origin?: string | null
          total_paid?: number | null
          trust_score?: number | null
          unread_notifications?: number | null
          username?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      seat_change_requests: {
        Row: {
          created_at: string | null
          current_seat: number | null
          group_id: string | null
          id: string
          reason: string | null
          requested_seat: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_seat?: number | null
          group_id?: string | null
          id?: string
          reason?: string | null
          requested_seat?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_seat?: number | null
          group_id?: string | null
          id?: string
          reason?: string | null
          requested_seat?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seat_change_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      slots: {
        Row: {
          disbursed_at: string | null
          group_id: string | null
          id: number
          is_disbursed: boolean | null
          joined_at: string | null
          seat_no: number
          status: string | null
          user_id: string | null
        }
        Insert: {
          disbursed_at?: string | null
          group_id?: string | null
          id?: number
          is_disbursed?: boolean | null
          joined_at?: string | null
          seat_no: number
          status?: string | null
          user_id?: string | null
        }
        Update: {
          disbursed_at?: string | null
          group_id?: string | null
          id?: number
          is_disbursed?: boolean | null
          joined_at?: string | null
          seat_no?: number
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slots_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          admin_reply_attachment: string | null
          attachment_url: string | null
          created_at: string | null
          id: string
          message: string
          replied_at: string | null
          status: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          admin_reply_attachment?: string | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          replied_at?: string | null
          status?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          admin_reply_attachment?: string | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          replied_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          id: string
          is_admin: boolean | null
          message: string
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message?: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          code: string | null
          created_at: string | null
          declined_reason: string | null
          group_id: string | null
          group_name: string | null
          id: string
          screenshot_url: string | null
          seat_numbers: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          code?: string | null
          created_at?: string | null
          declined_reason?: string | null
          group_id?: string | null
          group_name?: string | null
          id?: string
          screenshot_url?: string | null
          seat_numbers?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          code?: string | null
          created_at?: string | null
          declined_reason?: string | null
          group_id?: string | null
          group_name?: string | null
          id?: string
          screenshot_url?: string | null
          seat_numbers?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_debts: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          group_id: string | null
          group_name: string | null
          id: string
          is_paid: boolean | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          group_name?: string | null
          id?: string
          is_paid?: boolean | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          group_name?: string | null
          id?: string
          is_paid?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_debts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard: {
        Args: never
        Returns: {
          first_name: string
          id: string
          is_vip: boolean
          last_name: string
          nickname: string
          profile_picture: string
          total_paid: number
          trust_score: number
        }[]
      }
      get_platform_stats: { Args: never; Returns: Json }
      send_notification_to_all: { Args: { msg: string }; Returns: undefined }
      send_notification_to_group: {
        Args: { gid: string; msg: string }
        Returns: undefined
      }
      send_notification_to_user: {
        Args: { msg: string; uid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
