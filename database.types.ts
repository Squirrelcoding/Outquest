export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      cities: {
        Row: {
          city: string | null;
          city_ascii: string | null;
          county_name: string | null;
          id: number;
          lat: number | null;
          lng: number | null;
          location: unknown | null;
          place: string | null;
          population: number | null;
          state_id: string | null;
          timezone: string | null;
        };
        Insert: {
          city?: string | null;
          city_ascii?: string | null;
          county_name?: string | null;
          id: number;
          lat?: number | null;
          lng?: number | null;
          location?: unknown | null;
          place?: string | null;
          population?: number | null;
          state_id?: string | null;
          timezone?: string | null;
        };
        Update: {
          city?: string | null;
          city_ascii?: string | null;
          county_name?: string | null;
          id?: number;
          lat?: number | null;
          lng?: number | null;
          location?: unknown | null;
          place?: string | null;
          population?: number | null;
          state_id?: string | null;
          timezone?: string | null;
        };
        Relationships: [];
      };
      comment: {
        Row: {
          content: string | null;
          created_at: string;
          id: number;
          quest_id: number | null;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: number;
          quest_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: number;
          quest_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comment_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "quest";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          }
        ];
      };
      "comment score": {
        Row: {
          comment_id: number | null;
          created_at: string;
          id: number;
          user_id: string | null;
        };
        Insert: {
          comment_id?: number | null;
          created_at?: string;
          id?: number;
          user_id?: string | null;
        };
        Update: {
          comment_id?: number | null;
          created_at?: string;
          id?: number;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comment score_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment score_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          }
        ];
      };
      completion: {
        Row: {
          created_at: string;
          id: number;
          quest_id: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          quest_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          quest_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "completion_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "quest";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completion_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          }
        ];
      };
      leaderboard: {
        Row: {
          created_at: string;
          id: number;
          leaderboard_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          leaderboard_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          leaderboard_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leaderboard_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          }
        ];
      };
      "leaderboard meta": {
        Row: {
          created_at: string;
          id: number;
          leaderboard_id: string | null;
          owner_id: string | null;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          leaderboard_id?: string | null;
          owner_id?: string | null;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          leaderboard_id?: string | null;
          owner_id?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leaderboard meta_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          }
        ];
      };
      message: {
        Row: {
          content: string | null;
          created_at: string;
          id: number;
          place: number | null;
          quest_id: number | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: number;
          place?: number | null;
          quest_id?: number | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: number;
          place?: number | null;
          quest_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "message_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "quest";
            referencedColumns: ["id"];
          }
        ];
      };
      profile: {
        Row: {
          age: number | null;
          city: string | null;
          id: string;
          username: string | null;
        };
        Insert: {
          age?: number | null;
          city?: string | null;
          id: string;
          username?: string | null;
        };
        Update: {
          age?: number | null;
          city?: string | null;
          id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      quest: {
        Row: {
          author: string;
          created_at: string | null;
          deadline: string | null;
          description: string | null;
          id: number;
          location: string | null;
          title: string | null;
          type: Database["public"]["Enums"]["QUEST_TYPE"];
        };
        Insert: {
          author: string;
          created_at?: string | null;
          deadline?: string | null;
          description?: string | null;
          id?: number;
          location?: string | null;
          title?: string | null;
          type?: Database["public"]["Enums"]["QUEST_TYPE"];
        };
        Update: {
          author?: string;
          created_at?: string | null;
          deadline?: string | null;
          description?: string | null;
          id?: number;
          location?: string | null;
          title?: string | null;
          type?: Database["public"]["Enums"]["QUEST_TYPE"];
        };
        Relationships: [
          {
            foreignKeyName: "quest_author_fkey";
            columns: ["author"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          }
        ];
      };
      "quest score": {
        Row: {
          created_at: string;
          id: number;
          quest_id: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          quest_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          quest_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quest score_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "quest";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quest score_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          }
        ];
      };
      submission: {
        Row: {
          id: number;
          subquest_id: number | null;
          time: string | null;
          user_id: string;
        };
        Insert: {
          id?: number;
          subquest_id?: number | null;
          time?: string | null;
          user_id: string;
        };
        Update: {
          id?: number;
          subquest_id?: number | null;
          time?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submission_subquest_id_fkey";
            columns: ["subquest_id"];
            isOneToOne: false;
            referencedRelation: "subquest";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submission_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          }
        ];
      };
      subquest: {
        Row: {
          id: number;
          prompt: string | null;
          quest_id: number | null;
        };
        Insert: {
          id?: number;
          prompt?: string | null;
          quest_id?: number | null;
        };
        Update: {
          id?: number;
          prompt?: string | null;
          quest_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "subquests_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "quest";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_email_verified: {
        Args: { p_email: string };
        Returns: boolean;
      };
      get_search_results: {
        Args: {
          current_lat: number;
          current_long: number;
          radius_meters: number;
        };
        Returns: {
          distance_meters: number;
          id: number;
          lat: number;
          long: number;
        }[];
      };
      gtrgm_compress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { "": unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      nearby_restaurants: {
        Args: { lat: number; long: number };
        Returns: {
          dist_meters: number;
          id: number;
          lat: number;
          long: number;
          name: string;
        }[];
      };
      set_limit: {
        Args: { "": number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { "": string };
        Returns: string[];
      };
    };
    Enums: {
      QUEST_TYPE: "PHOTO" | "LOCATION" | "PATH";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  	public: {
    	Enums: {
      	QUEST_TYPE: ["PHOTO", "LOCATION", "PATH"],
    	},
  	},
} as const;
