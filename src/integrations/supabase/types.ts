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
      ai_recommendations: {
        Row: {
          accepted_at: string | null
          based_on_difficulties: string[] | null
          completed_at: string | null
          content: Json
          created_at: string | null
          expires_at: string | null
          id: string
          priority: string | null
          reasoning: string | null
          recommendation_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          based_on_difficulties?: string[] | null
          completed_at?: string | null
          content?: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          reasoning?: string | null
          recommendation_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          based_on_difficulties?: string[] | null
          completed_at?: string | null
          content?: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          reasoning?: string | null
          recommendation_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          embedding: string | null
          end_date: string | null
          estimated_duration: number | null
          fashion_era: string | null
          format: string | null
          id: string
          is_active: boolean | null
          is_additional: boolean | null
          knowledge_base: string | null
          lesson_type: string
          media_url: string | null
          points_reward: number | null
          quiz_config: Json | null
          start_date: string | null
          title: string
          topics: string[]
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          embedding?: string | null
          end_date?: string | null
          estimated_duration?: number | null
          fashion_era?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          is_additional?: boolean | null
          knowledge_base?: string | null
          lesson_type: string
          media_url?: string | null
          points_reward?: number | null
          quiz_config?: Json | null
          start_date?: string | null
          title: string
          topics: string[]
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          embedding?: string | null
          end_date?: string | null
          estimated_duration?: number | null
          fashion_era?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          is_additional?: boolean | null
          knowledge_base?: string | null
          lesson_type?: string
          media_url?: string | null
          points_reward?: number | null
          quiz_config?: Json | null
          start_date?: string | null
          title?: string
          topics?: string[]
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          id: string
          incorrect_answers: number | null
          lesson_id: string | null
          points_earned: number | null
          questions: Json
          quiz_type: string
          score: number | null
          time_taken: number | null
          topics_covered: string[] | null
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          incorrect_answers?: number | null
          lesson_id?: string | null
          points_earned?: number | null
          questions?: Json
          quiz_type: string
          score?: number | null
          time_taken?: number | null
          topics_covered?: string[] | null
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          incorrect_answers?: number | null
          lesson_id?: string | null
          points_earned?: number | null
          questions?: Json
          quiz_type?: string
          score?: number | null
          time_taken?: number | null
          topics_covered?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category: string | null
          color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_difficulties: {
        Row: {
          category: string | null
          context: string | null
          created_at: string | null
          difficulty_level: string | null
          embedding: string | null
          error_count: number | null
          id: string
          last_error_at: string | null
          resolved: boolean | null
          resolved_at: string | null
          topic: string
          topic_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          context?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          embedding?: string | null
          error_count?: number | null
          id?: string
          last_error_at?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          topic: string
          topic_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          context?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          embedding?: string | null
          error_count?: number | null
          id?: string
          last_error_at?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          topic?: string
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_difficulties_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_profiles: {
        Row: {
          average_score: number | null
          badges: string[] | null
          completion_rate: number | null
          created_at: string | null
          id: string
          last_activity_date: string | null
          learning_style: string | null
          level: number | null
          points: number | null
          preferred_difficulty: string | null
          streak_days: number | null
          strengths: string[] | null
          total_lessons_completed: number | null
          total_quizzes_completed: number | null
          updated_at: string | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          average_score?: number | null
          badges?: string[] | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          learning_style?: string | null
          level?: number | null
          points?: number | null
          preferred_difficulty?: string | null
          streak_days?: number | null
          strengths?: string[] | null
          total_lessons_completed?: number | null
          total_quizzes_completed?: number | null
          updated_at?: string | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          average_score?: number | null
          badges?: string[] | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          learning_style?: string | null
          level?: number | null
          points?: number | null
          preferred_difficulty?: string | null
          streak_days?: number | null
          strengths?: string[] | null
          total_lessons_completed?: number | null
          total_quizzes_completed?: number | null
          updated_at?: string | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          ai_feedback: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          progress_percentage: number | null
          responses: Json | null
          started_at: string | null
          status: string | null
          time_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          progress_percentage?: number | null
          responses?: Json | null
          started_at?: string | null
          status?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          progress_percentage?: number | null
          responses?: Json | null
          started_at?: string | null
          status?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_super_admin: {
        Args: { admin_email: string; admin_password: string }
        Returns: Json
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
      app_role: "super_admin" | "user"
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
      app_role: ["super_admin", "user"],
    },
  },
} as const
