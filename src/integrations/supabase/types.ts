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
          admin_name: string
          body: string
          created_at: string
          id: string
          image_url: string | null
          target_group_id: string | null
          title: string
          type: string
        }
        Insert: {
          admin_name?: string
          body: string
          created_at?: string
          id?: string
          image_url?: string | null
          target_group_id?: string | null
          title: string
          type?: string
        }
        Update: {
          admin_name?: string
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          target_group_id?: string | null
          title?: string
          type?: string
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
          created_at: string
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string
          id?: string
          type?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          group_id: string
          id: string
          text: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          text: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          text?: string
          user_id?: string
          username?: string
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
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          call_number?: string | null
          email?: string | null
          facebook?: string | null
          id?: number
          sms_number?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          call_number?: string | null
          email?: string | null
          facebook?: string | null
          id?: number
          sms_number?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      disbursements: {
        Row: {
          admin_id: string | null
          admin_name: string | null
          amount: number
          code: string
          created_at: string
          description: string | null
          group_id: string | null
          group_name: string
          id: string
          image_url: string | null
          seat_numbers: string | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          admin_name?: string | null
          amount?: number
          code?: string
          created_at?: string
          description?: string | null
          group_id?: string | null
          group_name?: string
          id?: string
          image_url?: string | null
          seat_numbers?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          admin_name?: string | null
          amount?: number
          code?: string
          created_at?: string
          description?: string | null
          group_id?: string | null
          group_name?: string
          id?: string
          image_url?: string | null
          seat_numbers?: string | null
          user_id?: string
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
          admin_note: string | null
          created_at: string
          group_id: string
          id: string
          reason: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          group_id: string
          id?: string
          reason?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          group_id?: string
          id?: string
          reason?: string | null
          status?: string
          user_id?: string
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
          chat_locked: boolean
          contribution_amount: number
          created_at: string
          cycle_type: string
          description: string
          disbursement_days: number | null
          filled_slots: number
          id: string
          is_live: boolean
          is_locked: boolean
          live_at: string | null
          name: string
          payment_days: number | null
          payment_frequency: string | null
          payout_account: string | null
          payout_amount: number | null
          terms_text: string
          total_slots: number
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          chat_locked?: boolean
          contribution_amount?: number
          created_at?: string
          cycle_type?: string
          description?: string
          disbursement_days?: number | null
          filled_slots?: number
          id?: string
          is_live?: boolean
          is_locked?: boolean
          live_at?: string | null
          name: string
          payment_days?: number | null
          payment_frequency?: string | null
          payout_account?: string | null
          payout_amount?: number | null
          terms_text?: string
          total_slots?: number
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          chat_locked?: boolean
          contribution_amount?: number
          created_at?: string
          cycle_type?: string
          description?: string
          disbursement_days?: number | null
          filled_slots?: number
          id?: string
          is_live?: boolean
          is_locked?: boolean
          live_at?: string | null
          name?: string
          payment_days?: number | null
          payment_frequency?: string | null
          payout_account?: string | null
          payout_amount?: number | null
          terms_text?: string
          total_slots?: number
          updated_at?: string
        }
        Relationships: []
      }
      guide_tips: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
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
          created_at: string
          current_address: string | null
          current_state: string | null
          dob: string | null
          email: string
          first_name: string
          gender: string | null
          home_address: string | null
          id: string
          is_banned: boolean
          is_frozen: boolean
          is_restricted: boolean
          is_vip: boolean
          last_login_at: string | null
          last_name: string
          lga: string | null
          middle_name: string | null
          nickname: string | null
          password_plain: string | null
          phone: string | null
          profile_picture: string | null
          role: string
          state_of_origin: string | null
          total_paid: number
          trust_score: number
          unread_notifications: number
          updated_at: string
          username: string
          whatsapp_number: string | null
        }
        Insert: {
          age?: number | null
          bank_acc_name?: string | null
          bank_acc_num?: string | null
          bank_name?: string | null
          bvn_nin?: string | null
          created_at?: string
          current_address?: string | null
          current_state?: string | null
          dob?: string | null
          email: string
          first_name: string
          gender?: string | null
          home_address?: string | null
          id: string
          is_banned?: boolean
          is_frozen?: boolean
          is_restricted?: boolean
          is_vip?: boolean
          last_login_at?: string | null
          last_name: string
          lga?: string | null
          middle_name?: string | null
          nickname?: string | null
          password_plain?: string | null
          phone?: string | null
          profile_picture?: string | null
          role?: string
          state_of_origin?: string | null
          total_paid?: number
          trust_score?: number
          unread_notifications?: number
          updated_at?: string
          username: string
          whatsapp_number?: string | null
        }
        Update: {
          age?: number | null
          bank_acc_name?: string | null
          bank_acc_num?: string | null
          bank_name?: string | null
          bvn_nin?: string | null
          created_at?: string
          current_address?: string | null
          current_state?: string | null
          dob?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          home_address?: string | null
          id?: string
          is_banned?: boolean
          is_frozen?: boolean
          is_restricted?: boolean
          is_vip?: boolean
          last_login_at?: string | null
          last_name?: string
          lga?: string | null
          middle_name?: string | null
          nickname?: string | null
          password_plain?: string | null
          phone?: string | null
          profile_picture?: string | null
          role?: string
          state_of_origin?: string | null
          total_paid?: number
          trust_score?: number
          unread_notifications?: number
          updated_at?: string
          username?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      seat_change_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          current_seat: number
          group_id: string
          id: string
          reason: string | null
          requested_seat: number
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          current_seat: number
          group_id: string
          id?: string
          reason?: string | null
          requested_seat: number
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          current_seat?: number
          group_id?: string
          id?: string
          reason?: string | null
          requested_seat?: number
          status?: string
          user_id?: string
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
          group_id: string
          id: number
          is_disbursed: boolean
          joined_at: string | null
          seat_no: number
          status: string
          user_id: string | null
        }
        Insert: {
          disbursed_at?: string | null
          group_id: string
          id?: number
          is_disbursed?: boolean
          joined_at?: string | null
          seat_no: number
          status?: string
          user_id?: string | null
        }
        Update: {
          disbursed_at?: string | null
          group_id?: string
          id?: number
          is_disbursed?: boolean
          joined_at?: string | null
          seat_no?: number
          status?: string
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
          created_at: string
          id: string
          message: string
          replied_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          admin_reply_attachment?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          message: string
          replied_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          admin_reply_attachment?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          message?: string
          replied_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          is_admin: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
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
          amount: number
          code: string
          created_at: string
          declined_reason: string | null
          group_id: string | null
          group_name: string
          id: string
          screenshot_url: string | null
          seat_numbers: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          code?: string
          created_at?: string
          declined_reason?: string | null
          group_id?: string | null
          group_name: string
          id?: string
          screenshot_url?: string | null
          seat_numbers?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          declined_reason?: string | null
          group_id?: string | null
          group_name?: string
          id?: string
          screenshot_url?: string | null
          seat_numbers?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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
          amount: number
          created_at: string
          description: string | null
          group_id: string | null
          group_name: string
          id: string
          resolved: boolean
          resolved_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          group_id?: string | null
          group_name?: string
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          group_id?: string | null
          group_name?: string
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          role: string
          total_paid: number
          trust_score: number
        }[]
      }
      get_platform_stats: { Args: never; Returns: Json }
      send_notification_to_all: {
        Args: { p_message: string }
        Returns: undefined
      }
      send_notification_to_group: {
        Args: { p_group_id: string; p_message: string }
        Returns: undefined
      }
      send_notification_to_user: {
        Args: { p_message: string; p_user_id: string }
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
