import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserLearningProfile } from '@/types/learning';

export const useLearningProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['learning-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_learning_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data as UserLearningProfile;
    },
    enabled: !!userId,
  });
};
