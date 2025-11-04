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
      // Fetch profiles first (server-side search when provided)
      let profilesQuery = supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        profilesQuery = profilesQuery.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;
      if (!profilesData || profilesData.length === 0) return [] as User[];

      const userIds = profilesData.map((p: any) => p.user_id);

      // Fetch roles and learning profiles in parallel and merge on client
      const [rolesRes, lpRes] = await Promise.all([
        supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds),
        supabase
          .from('user_learning_profiles')
          .select('user_id, level, points, streak_days, total_lessons_completed, total_quizzes_completed, completion_rate, strengths, weaknesses')
          .in('user_id', userIds),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (lpRes.error) throw lpRes.error;

      const rolesByUser = new Map<string, string>();
      (rolesRes.data || []).forEach((r: any) => {
        const current = rolesByUser.get(r.user_id);
        // Prefer super_admin if user has multiple roles
        const role = r.role;
        if (!current || role === 'super_admin') rolesByUser.set(r.user_id, role);
      });

      const lpByUser = new Map<string, any>();
      (lpRes.data || []).forEach((lp: any) => lpByUser.set(lp.user_id, lp));

      let result = profilesData.map((p: any) => {
        const role = rolesByUser.get(p.user_id) || 'user';
        const lp = lpByUser.get(p.user_id) || {};
        return {
          user_id: p.user_id,
          email: p.email,
          full_name: p.full_name,
          created_at: p.created_at,
          role,
          level: lp.level || 1,
          points: lp.points || 0,
          streak_days: lp.streak_days || 0,
          total_lessons_completed: lp.total_lessons_completed || 0,
          total_quizzes_completed: lp.total_quizzes_completed || 0,
          completion_rate: lp.completion_rate || 0,
          strengths: lp.strengths || [],
          weaknesses: lp.weaknesses || [],
        } as User;
      });

      if (roleFilter !== 'all') {
        result = result.filter((u) => u.role === roleFilter);
      }

      return result;
    },
  });

  const { data: stats = { total: 0, active: 0, superAdmins: 0, newUsers: 0 } } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const [profilesRes, rolesRes, lpRes] = await Promise.all([
        supabase.from('profiles').select('user_id, created_at'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('user_learning_profiles').select('user_id, streak_days'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (lpRes.error) throw lpRes.error;

      const profiles = profilesRes.data || [];
      const total = profiles.length;
      const active = (lpRes.data || []).filter((lp: any) => (lp.streak_days || 0) > 0).length;

      const superAdminUsers = new Set<string>();
      (rolesRes.data || []).forEach((r: any) => { if (r.role === 'super_admin') superAdminUsers.add(r.user_id); });
      const superAdmins = superAdminUsers.size;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newUsers = profiles.filter((p: any) => new Date(p.created_at) > sevenDaysAgo).length;

      return { total, active, superAdmins, newUsers } as UserStats;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { email: string; fullName: string; password: string; role: string }) => {
      // Pre-check: block duplicate emails for clearer UX
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', userData.email)
        .limit(1);
      if (checkError) throw checkError;
      if (existing && (existing as any[]).length > 0) {
        throw new Error('Este email já está cadastrado.');
      }

      const { data, error } = await supabase.functions.invoke('create-user-admin', {
        body: userData,
      });

      if (error) throw new Error(data?.error || 'Falha ao criar usuário');
      if (data?.error) throw new Error(data.error);
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
