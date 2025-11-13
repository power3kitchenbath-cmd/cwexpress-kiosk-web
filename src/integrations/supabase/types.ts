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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          read: boolean
          severity: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean
          severity?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean
          severity?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      cabinet_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price_per_unit: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price_per_unit: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price_per_unit?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      design_projects: {
        Row: {
          cabinet_data: Json | null
          cabinet_list_file: string | null
          created_at: string
          design_drawing_file: string | null
          id: string
          project_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cabinet_data?: Json | null
          cabinet_list_file?: string | null
          created_at?: string
          design_drawing_file?: string | null
          id?: string
          project_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cabinet_data?: Json | null
          cabinet_list_file?: string | null
          created_at?: string
          design_drawing_file?: string | null
          id?: string
          project_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          bounce_type: string | null
          created_at: string
          email_type: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          last_attempt_at: string | null
          opened_at: string | null
          opened_count: number
          order_id: string
          recipient_email: string
          retry_count: number
          sent_at: string
          status: string
          tracking_token: string
        }
        Insert: {
          bounce_type?: string | null
          created_at?: string
          email_type: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          last_attempt_at?: string | null
          opened_at?: string | null
          opened_count?: number
          order_id: string
          recipient_email: string
          retry_count?: number
          sent_at?: string
          status?: string
          tracking_token: string
        }
        Update: {
          bounce_type?: string | null
          created_at?: string
          email_type?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          last_attempt_at?: string | null
          opened_at?: string | null
          opened_count?: number
          order_id?: string
          recipient_email?: string
          retry_count?: number
          sent_at?: string
          status?: string
          tracking_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          cabinet_items: Json
          cabinet_total: number
          created_at: string | null
          flooring_items: Json
          flooring_total: number
          grand_total: number
          id: string
          user_id: string
        }
        Insert: {
          cabinet_items?: Json
          cabinet_total?: number
          created_at?: string | null
          flooring_items?: Json
          flooring_total?: number
          grand_total?: number
          id?: string
          user_id: string
        }
        Update: {
          cabinet_items?: Json
          cabinet_total?: number
          created_at?: string | null
          flooring_items?: Json
          flooring_total?: number
          grand_total?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      flooring_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price_per_sqft: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price_per_sqft: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price_per_sqft?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string | null
          product_image_url: string | null
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price_at_purchase: number
          product_id?: string | null
          product_image_url?: string | null
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string | null
          product_image_url?: string | null
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string
          created_at: string | null
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string | null
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          shipping: number
          shipping_address: Json
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          shipping: number
          shipping_address: Json
          status?: string
          subtotal: number
          tax: number
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          shipping?: number
          shipping_address?: Json
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          inventory_count: number
          inventory_status: string
          name: string
          price: number
          sku: string | null
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          inventory_count?: number
          inventory_status?: string
          name: string
          price?: number
          sku?: string | null
          specifications?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          inventory_count?: number
          inventory_status?: string
          name?: string
          price?: number
          sku?: string | null
          specifications?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          billing_address: Json | null
          business_license: string | null
          business_type: string | null
          company_name: string | null
          created_at: string | null
          id: string
          is_pro: boolean | null
          order_count: number | null
          phone: string | null
          preferred_payment_method: string | null
          specialty: string | null
          tax_id: string | null
          updated_at: string | null
          years_in_business: number | null
        }
        Insert: {
          billing_address?: Json | null
          business_license?: string | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string | null
          id: string
          is_pro?: boolean | null
          order_count?: number | null
          phone?: string | null
          preferred_payment_method?: string | null
          specialty?: string | null
          tax_id?: string | null
          updated_at?: string | null
          years_in_business?: number | null
        }
        Update: {
          billing_address?: Json | null
          business_license?: string | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_pro?: boolean | null
          order_count?: number | null
          phone?: string | null
          preferred_payment_method?: string | null
          specialty?: string | null
          tax_id?: string | null
          updated_at?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      failed_emails_summary: {
        Row: {
          affected_orders: string[] | null
          bounce_types: string[] | null
          failure_count: number | null
          failure_reasons: string[] | null
          last_failure: string | null
          recipient_email: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_email_delivery_rate: {
        Args: never
        Returns: {
          delivery_rate: number
          failed_emails: number
          total_emails: number
        }[]
      }
      check_email_delivery_health: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
