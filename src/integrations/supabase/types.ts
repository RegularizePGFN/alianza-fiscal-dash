export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      company_costs: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
