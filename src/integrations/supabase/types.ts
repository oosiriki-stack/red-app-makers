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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_read: boolean
          platform: string | null
          query: string | null
          reaction: string | null
          reaction_note: string | null
          requester: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          platform?: string | null
          query?: string | null
          reaction?: string | null
          reaction_note?: string | null
          requester?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          platform?: string | null
          query?: string | null
          reaction?: string | null
          reaction_note?: string | null
          requester?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      anomaly_baselines: {
        Row: {
          created_at: string
          id: string
          negative_count: number
          risk_score: number
          total_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          negative_count?: number
          risk_score?: number
          total_count?: number
          user_id: string
          window_start: string
        }
        Update: {
          created_at?: string
          id?: string
          negative_count?: number
          risk_score?: number
          total_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      mentions: {
        Row: {
          author: string
          avatar: string | null
          content: string
          created_at: string
          emotion: string | null
          engagement: number | null
          enriched_at: string | null
          entities: Json | null
          id: string
          impact_score: number | null
          interactions: Json | null
          is_sarcastic: boolean | null
          mention_date: string
          query: string | null
          requester: string | null
          sentiment: string
          source: string
          source_url: string | null
          theme: string | null
          user_id: string
        }
        Insert: {
          author?: string
          avatar?: string | null
          content?: string
          created_at?: string
          emotion?: string | null
          engagement?: number | null
          enriched_at?: string | null
          entities?: Json | null
          id?: string
          impact_score?: number | null
          interactions?: Json | null
          is_sarcastic?: boolean | null
          mention_date?: string
          query?: string | null
          requester?: string | null
          sentiment?: string
          source: string
          source_url?: string | null
          theme?: string | null
          user_id: string
        }
        Update: {
          author?: string
          avatar?: string | null
          content?: string
          created_at?: string
          emotion?: string | null
          engagement?: number | null
          enriched_at?: string | null
          entities?: Json | null
          id?: string
          impact_score?: number | null
          interactions?: Json | null
          is_sarcastic?: boolean | null
          mention_date?: string
          query?: string | null
          requester?: string | null
          sentiment?: string
          source?: string
          source_url?: string | null
          theme?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monitoring_settings: {
        Row: {
          brand: string
          country: string | null
          created_at: string
          id: string
          keywords: string[]
          monitoring_started_at: string
          paused_at: string | null
          person: string | null
          platforms: Json
          previous_brand: string | null
          sector: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string
          country?: string | null
          created_at?: string
          id?: string
          keywords?: string[]
          monitoring_started_at?: string
          paused_at?: string | null
          person?: string | null
          platforms?: Json
          previous_brand?: string | null
          sector?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          country?: string | null
          created_at?: string
          id?: string
          keywords?: string[]
          monitoring_started_at?: string
          paused_at?: string | null
          person?: string | null
          platforms?: Json
          previous_brand?: string | null
          sector?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id: string
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rss_feeds: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          last_fetched_at: string | null
          last_item_key: string | null
          source: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          last_fetched_at?: string | null
          last_item_key?: string | null
          source?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          last_fetched_at?: string | null
          last_item_key?: string | null
          source?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      social_handles: {
        Row: {
          created_at: string
          handle: string
          id: string
          platform: string
          updated_at: string
          url: string | null
          user_id: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          handle: string
          id?: string
          platform: string
          updated_at?: string
          url?: string | null
          user_id: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          handle?: string
          id?: string
          platform?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_fcfa: number | null
          card_last4: string | null
          created_at: string
          end_date: string | null
          expires_at: string | null
          id: string
          payer_name: string | null
          payer_phone: string | null
          payment_method: string | null
          payment_proof_url: string | null
          plan: string
          start_date: string
          status: string
          submitted_at: string | null
          transaction_id: string | null
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          amount_fcfa?: number | null
          card_last4?: string | null
          created_at?: string
          end_date?: string | null
          expires_at?: string | null
          id?: string
          payer_name?: string | null
          payer_phone?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          plan?: string
          start_date?: string
          status?: string
          submitted_at?: string | null
          transaction_id?: string | null
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          amount_fcfa?: number | null
          card_last4?: string | null
          created_at?: string
          end_date?: string | null
          expires_at?: string | null
          id?: string
          payer_name?: string | null
          payer_phone?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          plan?: string
          start_date?: string
          status?: string
          submitted_at?: string | null
          transaction_id?: string | null
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: string
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: string
          token?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: string
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: { _user: string; _workspace: string }
        Returns: boolean
      }
      workspace_role_of: {
        Args: { _user: string; _workspace: string }
        Returns: Database["public"]["Enums"]["workspace_role"]
      }
    }
    Enums: {
      app_role: "user" | "admin" | "super_admin"
      workspace_role: "owner" | "admin" | "member" | "viewer"
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
    Enums: {
      app_role: ["user", "admin", "super_admin"],
      workspace_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
