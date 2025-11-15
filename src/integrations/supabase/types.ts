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
      analytics_events: {
        Row: {
          created_at: string | null
          event_category: string
          event_label: string | null
          event_type: string
          event_value: number | null
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_category: string
          event_label?: string | null
          event_type: string
          event_value?: number | null
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_category?: string
          event_label?: string | null
          event_type?: string
          event_value?: number | null
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_report_config: {
        Row: {
          admin_email: string
          created_at: string
          frequency: string
          id: string
          last_sent_at: string | null
          updated_at: string
        }
        Insert: {
          admin_email: string
          created_at?: string
          frequency: string
          id?: string
          last_sent_at?: string | null
          updated_at?: string
        }
        Update: {
          admin_email?: string
          created_at?: string
          frequency?: string
          id?: string
          last_sent_at?: string | null
          updated_at?: string
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
      countertop_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price_per_linear_ft: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price_per_linear_ft: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price_per_linear_ft?: number
        }
        Relationships: []
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
      email_warmup_daily_stats: {
        Row: {
          created_at: string
          date: string
          emails_sent: number
          exceeded_limit: boolean
          id: string
          percentage_used: number
          target_volume: number
          warmup_schedule_id: string
        }
        Insert: {
          created_at?: string
          date: string
          emails_sent?: number
          exceeded_limit?: boolean
          id?: string
          percentage_used?: number
          target_volume: number
          warmup_schedule_id: string
        }
        Update: {
          created_at?: string
          date?: string
          emails_sent?: number
          exceeded_limit?: boolean
          id?: string
          percentage_used?: number
          target_volume?: number
          warmup_schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_warmup_daily_stats_warmup_schedule_id_fkey"
            columns: ["warmup_schedule_id"]
            isOneToOne: false
            referencedRelation: "email_warmup_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      email_warmup_schedule: {
        Row: {
          created_at: string
          current_day: number
          daily_limit: number
          domain: string
          id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_day?: number
          daily_limit: number
          domain: string
          id?: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_day?: number
          daily_limit?: number
          domain?: string
          id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      estimates: {
        Row: {
          cabinet_items: Json
          cabinet_total: number
          countertop_items: Json
          countertop_total: number
          created_at: string | null
          flooring_items: Json
          flooring_total: number
          grand_total: number
          hardware_items: Json
          hardware_total: number
          id: string
          user_id: string
        }
        Insert: {
          cabinet_items?: Json
          cabinet_total?: number
          countertop_items?: Json
          countertop_total?: number
          created_at?: string | null
          flooring_items?: Json
          flooring_total?: number
          grand_total?: number
          hardware_items?: Json
          hardware_total?: number
          id?: string
          user_id: string
        }
        Update: {
          cabinet_items?: Json
          cabinet_total?: number
          countertop_items?: Json
          countertop_total?: number
          created_at?: string | null
          flooring_items?: Json
          flooring_total?: number
          grand_total?: number
          hardware_items?: Json
          hardware_total?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      flooring_types: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          price_per_sqft: number
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_per_sqft: number
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_per_sqft?: number
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      hardware_types: {
        Row: {
          category: string
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          price_per_unit: number
        }
        Insert: {
          category?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_per_unit: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_per_unit?: number
        }
        Relationships: []
      }
      install_projects: {
        Row: {
          actual_completion_date: string | null
          actual_cost: number
          address: Json
          assigned_pm: string | null
          budget: number
          created_at: string
          created_by: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_id: string | null
          priority: string
          project_name: string
          project_type: string
          quote_request_id: string | null
          services: Json
          start_date: string
          status: string
          target_completion_date: string
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          actual_cost?: number
          address: Json
          assigned_pm?: string | null
          budget?: number
          created_at?: string
          created_by: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          priority?: string
          project_name: string
          project_type: string
          quote_request_id?: string | null
          services?: Json
          start_date: string
          status?: string
          target_completion_date: string
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          actual_cost?: number
          address?: Json
          assigned_pm?: string | null
          budget?: number
          created_at?: string
          created_by?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          priority?: string
          project_name?: string
          project_type?: string
          quote_request_id?: string | null
          services?: Json
          start_date?: string
          status?: string
          target_completion_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "install_projects_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "install_projects_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      install_teams: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          specialty: string
          team_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          specialty: string
          team_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          specialty?: string
          team_name?: string
          updated_at?: string
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
          thumbnail_url: string | null
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
          thumbnail_url?: string | null
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
          thumbnail_url?: string | null
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
      project_assignments: {
        Row: {
          assigned_date: string
          created_at: string
          id: string
          notes: string | null
          project_id: string
          scheduled_end: string
          scheduled_start: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          project_id: string
          scheduled_end: string
          scheduled_start: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string
          scheduled_end?: string
          scheduled_start?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "install_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "install_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      project_issues: {
        Row: {
          created_at: string
          description: string
          id: string
          issue_type: string
          project_id: string
          reported_by: string
          reported_date: string
          resolution: string | null
          resolved_date: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          issue_type: string
          project_id: string
          reported_by: string
          reported_date?: string
          resolution?: string | null
          resolved_date?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          issue_type?: string
          project_id?: string
          reported_by?: string
          reported_date?: string
          resolution?: string | null
          resolved_date?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "install_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_kpis: {
        Row: {
          budget_used_percentage: number
          completion_percentage: number
          created_at: string
          customer_satisfaction: number | null
          id: string
          issues_count: number
          notes: string | null
          project_id: string
          quality_score: number | null
          recorded_date: string
          safety_incidents: number
          schedule_variance_days: number
          team_efficiency_rating: number | null
        }
        Insert: {
          budget_used_percentage?: number
          completion_percentage?: number
          created_at?: string
          customer_satisfaction?: number | null
          id?: string
          issues_count?: number
          notes?: string | null
          project_id: string
          quality_score?: number | null
          recorded_date?: string
          safety_incidents?: number
          schedule_variance_days?: number
          team_efficiency_rating?: number | null
        }
        Update: {
          budget_used_percentage?: number
          completion_percentage?: number
          created_at?: string
          customer_satisfaction?: number | null
          id?: string
          issues_count?: number
          notes?: string | null
          project_id?: string
          quality_score?: number | null
          recorded_date?: string
          safety_incidents?: number
          schedule_variance_days?: number
          team_efficiency_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_kpis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "install_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to_team: string | null
          completed_date: string | null
          created_at: string
          dependencies: Json | null
          description: string | null
          due_date: string
          estimated_hours: number | null
          id: string
          priority: string
          project_id: string
          status: string
          task_name: string
          task_type: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to_team?: string | null
          completed_date?: string | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          due_date: string
          estimated_hours?: number | null
          id?: string
          priority?: string
          project_id: string
          status?: string
          task_name: string
          task_type: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to_team?: string | null
          completed_date?: string | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          due_date?: string
          estimated_hours?: number | null
          id?: string
          priority?: string
          project_id?: string
          status?: string
          task_name?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assigned_to_team_fkey"
            columns: ["assigned_to_team"]
            isOneToOne: false
            referencedRelation: "install_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "install_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          design_image_url: string
          design_settings: Json
          door_style: string
          id: string
          message: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          design_image_url: string
          design_settings: Json
          door_style: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          design_image_url?: string
          design_settings?: Json
          door_style?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_cabinet_designs: {
        Row: {
          brightness: number
          created_at: string
          design_name: string
          door_style: string
          id: string
          opacity: number
          room_image_url: string
          scale: number
          updated_at: string
          user_id: string
        }
        Insert: {
          brightness?: number
          created_at?: string
          design_name: string
          door_style: string
          id?: string
          opacity?: number
          room_image_url: string
          scale?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          brightness?: number
          created_at?: string
          design_name?: string
          door_style?: string
          id?: string
          opacity?: number
          room_image_url?: string
          scale?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_flooring_designs: {
        Row: {
          brightness: number
          created_at: string
          design_name: string
          flooring_type: string
          id: string
          is_sample_room: boolean
          opacity: number
          room_image_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brightness?: number
          created_at?: string
          design_name: string
          flooring_type: string
          id?: string
          is_sample_room?: boolean
          opacity?: number
          room_image_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brightness?: number
          created_at?: string
          design_name?: string
          flooring_type?: string
          id?: string
          is_sample_room?: boolean
          opacity?: number
          room_image_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          certification_level: string
          created_at: string
          email: string | null
          hire_date: string
          hourly_rate: number | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          specialty: string
          team_id: string
          updated_at: string
        }
        Insert: {
          certification_level: string
          created_at?: string
          email?: string | null
          hire_date: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          specialty: string
          team_id: string
          updated_at?: string
        }
        Update: {
          certification_level?: string
          created_at?: string
          email?: string | null
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          specialty?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "install_teams"
            referencedColumns: ["id"]
          },
        ]
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
      [_ in never]: never
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
      calculate_warmup_daily_limit: {
        Args: { day_number: number }
        Returns: number
      }
      check_email_delivery_health: { Args: never; Returns: undefined }
      get_cron_jobs: {
        Args: never
        Returns: {
          active: boolean
          command: string
          database: string
          jobid: number
          jobname: string
          nodename: string
          nodeport: number
          schedule: string
          username: string
        }[]
      }
      get_failed_emails_summary: {
        Args: never
        Returns: {
          affected_orders: string[]
          bounce_types: string[]
          failure_count: number
          failure_reasons: string[]
          last_failure: string
          recipient_email: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "project_manager"
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
      app_role: ["admin", "user", "project_manager"],
    },
  },
} as const
