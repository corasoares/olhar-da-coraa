import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lesson } from "@/types/learning";

export function useActiveLessons(userId?: string) {
  return useQuery({
    queryKey: ['active-lessons', userId],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      // Buscar lição principal da semana
      const { data: weeklyLesson, error: weeklyError } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_active', true)
        .eq('is_additional', false)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (weeklyError && weeklyError.code !== 'PGRST116') {
        console.error('Error fetching weekly lesson:', weeklyError);
      }

      // Buscar atividades adicionais
      const { data: additionalLessons, error: additionalError } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_active', true)
        .eq('is_additional', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: false });

      if (additionalError) {
        console.error('Error fetching additional lessons:', additionalError);
      }

      // Buscar lições futuras
      const { data: upcomingLessons, error: upcomingError } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_active', true)
        .gt('start_date', now)
        .order('start_date', { ascending: true })
        .limit(3);

      if (upcomingError) {
        console.error('Error fetching upcoming lessons:', upcomingError);
      }

      // Buscar lições encerradas (últimas 5)
      const { data: pastLessons, error: pastError } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_active', true)
        .lt('end_date', now)
        .order('end_date', { ascending: false })
        .limit(5);

      if (pastError) {
        console.error('Error fetching past lessons:', pastError);
      }

      // Se tiver userId, buscar progresso
      let weeklyProgress = null;
      let additionalProgress: any[] = [];
      let pastProgress: any[] = [];

      if (userId) {
        if (weeklyLesson) {
          const { data: progress } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', weeklyLesson.id)
            .maybeSingle();
          weeklyProgress = progress;
        }

        if (additionalLessons && additionalLessons.length > 0) {
          const { data: addProgress } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .in('lesson_id', additionalLessons.map(l => l.id));
          additionalProgress = addProgress || [];
        }

        if (pastLessons && pastLessons.length > 0) {
          const { data: pProgress } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .in('lesson_id', pastLessons.map(l => l.id));
          pastProgress = pProgress || [];
        }
      }

      return {
        weeklyLesson: weeklyLesson as any,
        weeklyProgress,
        additionalLessons: (additionalLessons || []) as any[],
        additionalProgress,
        upcomingLessons: (upcomingLessons || []) as any[],
        pastLessons: (pastLessons || []) as any[],
        pastProgress,
      };
    },
    enabled: true,
  });
}
