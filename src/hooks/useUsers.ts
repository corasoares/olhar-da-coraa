import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string;
  level: number;
  points: number;
  streak_days: number;
  total_lessons_completed: number;
  total_quizzes_completed: number;
  completion_rate: number;
  strengths: string[];
  weaknesses: string[];
}

export interface UserStats {
  total: number;
  active: number;
  superAdmins: number;
  newUsers: number;
}

export function useUsers(searchTerm: string = '', roleFilter: string = 'all') {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', searchTerm, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          full_name,
          created_at,
          user_roles!inner(role),
          user_learning_profiles(
            level,
            points,
            streak_days,
            total_lessons_completed,
            total_quizzes_completed,
            completion_rate,
            strengths,
            weaknesses
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      // Note: Filtering by role on nested relation doesn't work well in PostgREST
      // We'll filter in memory after fetching

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data;
      if (roleFilter !== 'all') {
        filteredData = data.filter((user: any) => user.user_roles[0]?.role === roleFilter);
      }

      return filteredData.map((user: any) => ({
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
        role: user.user_roles[0]?.role || 'user',
        level: user.user_learning_profiles[0]?.level || 1,
        points: user.user_learning_profiles[0]?.points || 0,
        streak_days: user.user_learning_profiles[0]?.streak_days || 0,
        total_lessons_completed: user.user_learning_profiles[0]?.total_lessons_completed || 0,
        total_quizzes_completed: user.user_learning_profiles[0]?.total_quizzes_completed || 0,
        completion_rate: user.user_learning_profiles[0]?.completion_rate || 0,
        strengths: user.user_learning_profiles[0]?.strengths || [],
        weaknesses: user.user_learning_profiles[0]?.weaknesses || [],
      })) as User[];
    },
  });

  const { data: stats = { total: 0, active: 0, superAdmins: 0, newUsers: 0 } } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data: allUsers, error: allError } = await supabase
        .from('profiles')
        .select('user_id, created_at, user_roles(role), user_learning_profiles(streak_days)');

      if (allError) throw allError;

      const total = allUsers?.length || 0;
      const active = allUsers?.filter((u: any) => u.user_learning_profiles?.[0]?.streak_days > 0).length || 0;
      const superAdmins = allUsers?.filter((u: any) => u.user_roles?.[0]?.role === 'super_admin').length || 0;
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newUsers = allUsers?.filter((u: any) => new Date(u.created_at) > sevenDaysAgo).length || 0;

      return { total, active, superAdmins, newUsers };
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { email: string; fullName: string; password: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('create-user-admin', {
        body: userData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar usuário');
    },
  });

  return {
    users,
    isLoading,
    stats,
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending,
  };
}
