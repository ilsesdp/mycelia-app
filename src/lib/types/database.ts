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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      event_photos: {
        Row: {
          created_at: string
          event_id: string
          id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          ends_at: string | null
          event_date: string
          farm_id: string
          id: string
          name: string
          notes: string | null
          photo_url: string | null
          starts_at: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          event_date: string
          farm_id: string
          id?: string
          name: string
          notes?: string | null
          photo_url?: string | null
          starts_at?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          event_date?: string
          farm_id?: string
          id?: string
          name?: string
          notes?: string | null
          photo_url?: string | null
          starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_public_contact"
            referencedColumns: ["farm_id"]
          },
          {
            foreignKeyName: "events_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_categories: {
        Row: {
          category: Database["public"]["Enums"]["category_t"]
          farm_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["category_t"]
          farm_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category_t"]
          farm_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_categories_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_public_contact"
            referencedColumns: ["farm_id"]
          },
          {
            foreignKeyName: "farm_categories_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_hours: {
        Row: {
          close_time: string | null
          closed: boolean
          day_of_week: number
          farm_id: string
          id: string
          open_time: string | null
        }
        Insert: {
          close_time?: string | null
          closed?: boolean
          day_of_week: number
          farm_id: string
          id?: string
          open_time?: string | null
        }
        Update: {
          close_time?: string | null
          closed?: boolean
          day_of_week?: number
          farm_id?: string
          id?: string
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_hours_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_public_contact"
            referencedColumns: ["farm_id"]
          },
          {
            foreignKeyName: "farm_hours_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_markets: {
        Row: {
          farm_id: string
          market_id: string
        }
        Insert: {
          farm_id: string
          market_id: string
        }
        Update: {
          farm_id?: string
          market_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_markets_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_public_contact"
            referencedColumns: ["farm_id"]
          },
          {
            foreignKeyName: "farm_markets_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_markets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          about: string | null
          address: string | null
          cover_photo_url: string | null
          created_at: string
          directions: string | null
          facebook: string | null
          google_place_id: string | null
          id: string
          instagram: string | null
          lat: number | null
          lng: number | null
          name: string
          owner_id: string
          published: boolean
          timezone: string
          today_status: Database["public"]["Enums"]["today_status_t"] | null
          today_status_date: string | null
          today_status_note: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          cover_photo_url?: string | null
          created_at?: string
          directions?: string | null
          facebook?: string | null
          google_place_id?: string | null
          id?: string
          instagram?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          owner_id: string
          published?: boolean
          timezone?: string
          today_status?: Database["public"]["Enums"]["today_status_t"] | null
          today_status_date?: string | null
          today_status_note?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          cover_photo_url?: string | null
          created_at?: string
          directions?: string | null
          facebook?: string | null
          google_place_id?: string | null
          id?: string
          instagram?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string
          published?: boolean
          timezone?: string
          today_status?: Database["public"]["Enums"]["today_status_t"] | null
          today_status_date?: string | null
          today_status_note?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_photos: {
        Row: {
          created_at: string
          id: string
          market_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_photos_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number | null
          id: string
          lat: number | null
          lng: number | null
          location: string | null
          name: string
          open_time: string | null
          schedule_text: string | null
          timezone: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          name: string
          open_time?: string | null
          schedule_text?: string | null
          timezone?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          name?: string
          open_time?: string | null
          schedule_text?: string | null
          timezone?: string
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          counterpart_id: string
          created_at: string
          farm_id: string
          id: string
          last_message_at: string
        }
        Insert: {
          counterpart_id: string
          created_at?: string
          farm_id: string
          id?: string
          last_message_at?: string
        }
        Update: {
          counterpart_id?: string
          created_at?: string
          farm_id?: string
          id?: string
          last_message_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_counterpart_id_fkey"
            columns: ["counterpart_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_public_contact"
            referencedColumns: ["farm_id"]
          },
          {
            foreignKeyName: "message_threads_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          channel: string
          event_type: string
          id: string
          payload: Json | null
          sent_at: string
          user_id: string | null
        }
        Insert: {
          channel: string
          event_type: string
          id?: string
          payload?: Json | null
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          event_type?: string
          id?: string
          payload?: Json | null
          sent_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: Database["public"]["Enums"]["availability_t"]
          category: Database["public"]["Enums"]["category_t"] | null
          created_at: string
          farm_id: string
          id: string
          name: string
          photo_url: string | null
          qty: string | null
          roughly_when: string | null
          sort_order: number
          unit: Database["public"]["Enums"]["unit_t"] | null
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_t"]
          category?: Database["public"]["Enums"]["category_t"] | null
          created_at?: string
          farm_id: string
          id?: string
          name: string
          photo_url?: string | null
          qty?: string | null
          roughly_when?: string | null
          sort_order?: number
          unit?: Database["public"]["Enums"]["unit_t"] | null
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_t"]
          category?: Database["public"]["Enums"]["category_t"] | null
          created_at?: string
          farm_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          qty?: string | null
          roughly_when?: string | null
          sort_order?: number
          unit?: Database["public"]["Enums"]["unit_t"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_public_contact"
            referencedColumns: ["farm_id"]
          },
          {
            foreignKeyName: "products_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          email_visibility: Database["public"]["Enums"]["visibility_t"]
          full_name: string | null
          id: string
          message_channel: Database["public"]["Enums"]["message_channel_t"]
          notif_event_on: boolean
          notif_market_on: boolean
          notif_msg_on: boolean
          notif_pause: boolean
          phone_visibility: Database["public"]["Enums"]["visibility_t"]
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          email_visibility?: Database["public"]["Enums"]["visibility_t"]
          full_name?: string | null
          id: string
          message_channel?: Database["public"]["Enums"]["message_channel_t"]
          notif_event_on?: boolean
          notif_market_on?: boolean
          notif_msg_on?: boolean
          notif_pause?: boolean
          phone_visibility?: Database["public"]["Enums"]["visibility_t"]
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          email_visibility?: Database["public"]["Enums"]["visibility_t"]
          full_name?: string | null
          id?: string
          message_channel?: Database["public"]["Enums"]["message_channel_t"]
          notif_event_on?: boolean
          notif_market_on?: boolean
          notif_msg_on?: boolean
          notif_pause?: boolean
          phone_visibility?: Database["public"]["Enums"]["visibility_t"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      farm_public_contact: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          email_visibility: Database["public"]["Enums"]["visibility_t"] | null
          farm_id: string | null
          message_channel:
            | Database["public"]["Enums"]["message_channel_t"]
            | null
          phone_visibility: Database["public"]["Enums"]["visibility_t"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability_t: "ready_now" | "producing" | "planning"
      category_t:
        | "Vegetables"
        | "Fruit"
        | "Eggs"
        | "Dairy"
        | "Honey"
        | "Flowers"
        | "Herbs"
        | "Handmade Crafts"
        | "Baked Goods"
        | "Seeds"
        | "Fiber Goods"
        | "Mushrooms"
        | "Dry Goods"
      message_channel_t: "text_me" | "email_me" | "both"
      today_status_t: "open" | "closed_early" | "closed"
      unit_t:
        | "lb"
        | "oz"
        | "kg"
        | "bunch"
        | "dozen"
        | "pint"
        | "quart"
        | "jar"
        | "each"
        | "fl oz"
        | "gallon"
        | "pack"
        | "bag"
        | "loaf"
      visibility_t: "growers_only" | "everyone" | "nobody"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      availability_t: ["ready_now", "producing", "planning"],
      category_t: [
        "Vegetables",
        "Fruit",
        "Eggs",
        "Dairy",
        "Honey",
        "Flowers",
        "Herbs",
        "Handmade Crafts",
        "Baked Goods",
        "Seeds",
        "Fiber Goods",
        "Mushrooms",
        "Dry Goods",
      ],
      message_channel_t: ["text_me", "email_me", "both"],
      today_status_t: ["open", "closed_early", "closed"],
      unit_t: [
        "lb",
        "oz",
        "kg",
        "bunch",
        "dozen",
        "pint",
        "quart",
        "jar",
        "each",
        "fl oz",
        "gallon",
        "pack",
        "bag",
        "loaf",
      ],
      visibility_t: ["growers_only", "everyone", "nobody"],
    },
  },
} as const
