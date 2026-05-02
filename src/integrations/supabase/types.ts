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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      company_costs: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_history: {
        Row: {
          contact_phone: string
          created_at: string
          id: string
          instance_name: string
          message_text: string
          message_timestamp: string
          message_type: string
          updated_at: string
          whatsapp_message_id: string | null
        }
        Insert: {
          contact_phone: string
          created_at?: string
          id?: string
          instance_name: string
          message_text: string
          message_timestamp: string
          message_type: string
          updated_at?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          contact_phone?: string
          created_at?: string
          id?: string
          instance_name?: string
          message_text?: string
          message_timestamp?: string
          message_type?: string
          updated_at?: string
          whatsapp_message_id?: string | null
        }
        Relationships: []
      }
      monthly_goals: {
        Row: {
          created_at: string
          goal_amount: number
          id: string
          month: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          goal_amount: number
          id?: string
          month: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          goal_amount?: number
          id?: string
          month?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      motivational_settings: {
        Row: {
          created_at: string
          display_top_count: number
          end_date: string | null
          id: string
          is_active: boolean
          prize_description: string | null
          prize_image_url: string | null
          prize_title: string
          ranking_type: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_top_count?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          prize_description?: string | null
          prize_image_url?: string | null
          prize_title?: string
          ranking_type?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_top_count?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          prize_description?: string | null
          prize_image_url?: string | null
          prize_title?: string
          ranking_type?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      predefined_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          contract_type: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          contract_type?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role: string
        }
        Update: {
          contract_type?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          business_activity: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          cnpj: string | null
          created_at: string
          creation_date: string | null
          debt_number: string | null
          discount_percentage: number | null
          discounted_value: number | null
          entry_installments: number | null
          entry_value: number | null
          fees_value: number | null
          id: string
          image_url: string | null
          installment_value: number | null
          installments: number | null
          status: string | null
          total_debt: number | null
          updated_at: string
          user_id: string
          validity_date: string | null
        }
        Insert: {
          business_activity?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          cnpj?: string | null
          created_at?: string
          creation_date?: string | null
          debt_number?: string | null
          discount_percentage?: number | null
          discounted_value?: number | null
          entry_installments?: number | null
          entry_value?: number | null
          fees_value?: number | null
          id?: string
          image_url?: string | null
          installment_value?: number | null
          installments?: number | null
          status?: string | null
          total_debt?: number | null
          updated_at?: string
          user_id: string
          validity_date?: string | null
        }
        Update: {
          business_activity?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          cnpj?: string | null
          created_at?: string
          creation_date?: string | null
          debt_number?: string | null
          discount_percentage?: number | null
          discounted_value?: number | null
          entry_installments?: number | null
          entry_value?: number | null
          fees_value?: number | null
          id?: string
          image_url?: string | null
          installment_value?: number | null
          installments?: number | null
          status?: string | null
          total_debt?: number | null
          updated_at?: string
          user_id?: string
          validity_date?: string | null
        }
        Relationships: []
      }
      recurring_message_schedules: {
        Row: {
          client_name: string
          client_phone: string
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          end_date: string | null
          execution_time: string
          funnel_stage: Database["public"]["Enums"]["funnel_stage"]
          id: string
          instance_name: string
          is_active: boolean
          last_execution_date: string | null
          message_text: string
          next_execution_date: string | null
          recurrence_interval: number
          recurrence_type: Database["public"]["Enums"]["recurrence_type"]
          start_date: string
          total_executions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name: string
          client_phone: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          end_date?: string | null
          execution_time: string
          funnel_stage?: Database["public"]["Enums"]["funnel_stage"]
          id?: string
          instance_name: string
          is_active?: boolean
          last_execution_date?: string | null
          message_text: string
          next_execution_date?: string | null
          recurrence_interval?: number
          recurrence_type: Database["public"]["Enums"]["recurrence_type"]
          start_date: string
          total_executions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string
          client_phone?: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          end_date?: string | null
          execution_time?: string
          funnel_stage?: Database["public"]["Enums"]["funnel_stage"]
          id?: string
          instance_name?: string
          is_active?: boolean
          last_execution_date?: string | null
          message_text?: string
          next_execution_date?: string | null
          recurrence_interval?: number
          recurrence_type?: Database["public"]["Enums"]["recurrence_type"]
          start_date?: string
          total_executions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_schedules: {
        Row: {
          client_name: string
          client_phone: string
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          end_date: string | null
          executions_count: number
          id: string
          instance_name: string
          is_active: boolean
          last_execution_date: string | null
          message_text: string
          next_execution_date: string
          recurrence_interval: number
          recurrence_type: string
          start_date: string
          total_occurrences: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name: string
          client_phone: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          end_date?: string | null
          executions_count?: number
          id?: string
          instance_name: string
          is_active?: boolean
          last_execution_date?: string | null
          message_text: string
          next_execution_date: string
          recurrence_interval?: number
          recurrence_type: string
          start_date: string
          total_occurrences?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string
          client_phone?: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          end_date?: string | null
          executions_count?: number
          id?: string
          instance_name?: string
          is_active?: boolean
          last_execution_date?: string | null
          message_text?: string
          next_execution_date?: string
          recurrence_interval?: number
          recurrence_type?: string
          start_date?: string
          total_occurrences?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          client_document: string
          client_name: string
          client_phone: string
          created_at: string
          gross_amount: number
          id: string
          installments: number
          payment_method: string
          sale_date: string
          salesperson_id: string
          salesperson_name: string
        }
        Insert: {
          client_document: string
          client_name: string
          client_phone: string
          created_at?: string
          gross_amount: number
          id?: string
          installments?: number
          payment_method: string
          sale_date: string
          salesperson_id: string
          salesperson_name: string
        }
        Update: {
          client_document?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          gross_amount?: number
          id?: string
          installments?: number
          payment_method?: string
          sale_date?: string
          salesperson_id?: string
          salesperson_name?: string
        }
        Relationships: []
      }
      scheduled_messages: {
        Row: {
          client_name: string | null
          client_phone: string
          created_at: string
          error_message: string | null
          id: string
          instance_name: string
          message_text: string
          requires_approval: boolean
          scheduled_date: string
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name?: string | null
          client_phone: string
          created_at?: string
          error_message?: string | null
          id?: string
          instance_name: string
          message_text: string
          requires_approval?: boolean
          scheduled_date: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string | null
          client_phone?: string
          created_at?: string
          error_message?: string | null
          id?: string
          instance_name?: string
          message_text?: string
          requires_approval?: boolean
          scheduled_date?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_instance_access: {
        Row: {
          access_type: string
          created_at: string
          id: string
          instance_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_type?: string
          created_at?: string
          id?: string
          instance_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_type?: string
          created_at?: string
          id?: string
          instance_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_instance_access_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "user_whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      user_whatsapp_instances: {
        Row: {
          created_at: string
          evolution_api_key: string | null
          evolution_api_url: string | null
          evolution_instance_id: string | null
          id: string
          instance_name: string
          instance_token: string | null
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_id?: string | null
          id?: string
          instance_name: string
          instance_token?: string | null
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_id?: string | null
          id?: string
          instance_name?: string
          instance_token?: string | null
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_duplicate_proposals: {
        Args: never
        Returns: {
          deleted_count: number
          details: string
        }[]
      }
      get_commercial_intel_summary: {
        Args: { p_end: string; p_start: string; p_user_id?: string }
        Returns: {
          avg_days_to_convert: number
          conversion_rate: number
          matched_sales: number
          matched_sales_value: number
          median_days_to_convert: number
          same_day_count: number
          total_proposals: number
          total_proposals_value: number
          total_sales: number
          total_sales_value: number
        }[]
      }
      get_conversion_time_buckets: {
        Args: { p_end: string; p_start: string; p_user_id?: string }
        Returns: {
          bucket: string
          bucket_order: number
          count: number
          total_value: number
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_hourly_patterns: {
        Args: { p_end: string; p_start: string; p_user_id?: string }
        Returns: {
          count: number
          dow: number
          hour: number
          source: string
          total_value: number
        }[]
      }
      get_open_proposals: {
        Args: { p_end: string; p_start: string; p_user_id?: string }
        Returns: {
          aging_days: number
          client_name: string
          client_phone: string
          cnpj: string
          created_at: string
          discounted_value: number
          fees_value: number
          proposal_id: string
          salesperson_id: string
          salesperson_name: string
          total_debt: number
        }[]
      }
      get_proposal_to_sale_conversion: {
        Args: { p_end: string; p_start: string; p_user_id?: string }
        Returns: {
          client_name: string
          cnpj_normalized: string
          days_to_convert: number
          payment_method: string
          proposal_created_at: string
          proposal_discounted_value: number
          proposal_fees_value: number
          proposal_id: string
          proposal_total_debt: number
          sale_amount: number
          sale_date: string
          sale_id: string
          salesperson_id: string
          salesperson_name: string
        }[]
      }
      get_salesperson_intel: {
        Args: { p_end: string; p_start: string }
        Returns: {
          avg_days_to_convert: number
          avg_discount_pct: number
          avg_proposal_value: number
          avg_sale_value: number
          conversion_rate: number
          matched_sales_count: number
          proposals_count: number
          proposals_value: number
          sales_count: number
          sales_value: number
          salesperson_id: string
          salesperson_name: string
        }[]
      }
      get_team_daily_sales: {
        Args: { sale_date_param: string }
        Returns: {
          total_amount: number
          total_sales: number
        }[]
      }
      get_today_dashboard_summary: {
        Args: { p_user_id?: string }
        Returns: {
          salespeople: Json
          total_fees: number
          total_proposals_count: number
          total_sales_amount: number
          total_sales_count: number
        }[]
      }
      get_weekly_ranking:
        | {
            Args: never
            Returns: {
              amount_position: number
              contracts_count: number
              salesperson_id: string
              salesperson_name: string
              total_amount: number
              volume_position: number
            }[]
          }
        | {
            Args: { p_end_date?: string; p_start_date?: string }
            Returns: {
              amount_position: number
              contracts_count: number
              salesperson_id: string
              salesperson_name: string
              total_amount: number
              volume_position: number
            }[]
          }
      is_felipe_user: { Args: never; Returns: boolean }
    }
    Enums: {
      funnel_stage:
        | "prospeccao"
        | "qualificacao"
        | "proposta_enviada"
        | "negociacao"
        | "venda_realizada"
        | "cobranca"
        | "pos_venda"
      recurrence_type: "daily" | "weekly" | "monthly"
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
      funnel_stage: [
        "prospeccao",
        "qualificacao",
        "proposta_enviada",
        "negociacao",
        "venda_realizada",
        "cobranca",
        "pos_venda",
      ],
      recurrence_type: ["daily", "weekly", "monthly"],
    },
  },
} as const
