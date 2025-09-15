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
      "5LEAD TEST": {
        Row: {
          "# Employees": number | null
          "Annual Revenue": string | null
          basic_info: Json | null
          City: string | null
          Company: string | null
          "Company Address": string | null
          "Company City": string | null
          "Company Country": string | null
          "Company Linkedin Url": string | null
          "Company Name for Emails": string | null
          "Company Phone": string | null
          "Company State": string | null
          company_data: Json | null
          company_linkedin_post: Json | null
          Country: string | null
          Email: string | null
          "Email Status": string | null
          "Facebook Url": string | null
          "First Name": string | null
          Industry: string | null
          Keywords: string | null
          "Last Name": string | null
          "Last Raised At": string | null
          "Latest Funding": string | null
          "Latest Funding Amount": number | null
          linkedin_posts: Json | null
          "Person Linkedin Url": string | null
          "Secondary Email": string | null
          State: string | null
          Technologies: string | null
          Title: string | null
          "Total Funding": number | null
          "Twitter Url": string | null
          Website: string | null
        }
        Insert: {
          "# Employees"?: number | null
          "Annual Revenue"?: string | null
          basic_info?: Json | null
          City?: string | null
          Company?: string | null
          "Company Address"?: string | null
          "Company City"?: string | null
          "Company Country"?: string | null
          "Company Linkedin Url"?: string | null
          "Company Name for Emails"?: string | null
          "Company Phone"?: string | null
          "Company State"?: string | null
          company_data?: Json | null
          company_linkedin_post?: Json | null
          Country?: string | null
          Email?: string | null
          "Email Status"?: string | null
          "Facebook Url"?: string | null
          "First Name"?: string | null
          Industry?: string | null
          Keywords?: string | null
          "Last Name"?: string | null
          "Last Raised At"?: string | null
          "Latest Funding"?: string | null
          "Latest Funding Amount"?: number | null
          linkedin_posts?: Json | null
          "Person Linkedin Url"?: string | null
          "Secondary Email"?: string | null
          State?: string | null
          Technologies?: string | null
          Title?: string | null
          "Total Funding"?: number | null
          "Twitter Url"?: string | null
          Website?: string | null
        }
        Update: {
          "# Employees"?: number | null
          "Annual Revenue"?: string | null
          basic_info?: Json | null
          City?: string | null
          Company?: string | null
          "Company Address"?: string | null
          "Company City"?: string | null
          "Company Country"?: string | null
          "Company Linkedin Url"?: string | null
          "Company Name for Emails"?: string | null
          "Company Phone"?: string | null
          "Company State"?: string | null
          company_data?: Json | null
          company_linkedin_post?: Json | null
          Country?: string | null
          Email?: string | null
          "Email Status"?: string | null
          "Facebook Url"?: string | null
          "First Name"?: string | null
          Industry?: string | null
          Keywords?: string | null
          "Last Name"?: string | null
          "Last Raised At"?: string | null
          "Latest Funding"?: string | null
          "Latest Funding Amount"?: number | null
          linkedin_posts?: Json | null
          "Person Linkedin Url"?: string | null
          "Secondary Email"?: string | null
          State?: string | null
          Technologies?: string | null
          Title?: string | null
          "Total Funding"?: number | null
          "Twitter Url"?: string | null
          Website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
