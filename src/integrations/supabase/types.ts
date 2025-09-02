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
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_count: number
          details: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_felipe_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
