import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ userId, open, onOpenChange }: UserDetailsDialogProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          full_name,
          created_at,
          user_roles(role),
          user_learning_profiles(
            level,
            points,
            streak_days,
            total_lessons_completed,
            total_quizzes_completed,
            completion_rate,
            strengths,
            weaknesses,
            badges
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const userRoles = data.user_roles as any;
      const userProfile = data.user_learning_profiles as any;
      
      return {
        user_id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        created_at: data.created_at,
        role: userRoles?.[0]?.role || 'user',
        profile: userProfile?.[0] || {
          level: 1,
          points: 0,
          streak_days: 0,
          total_lessons_completed: 0,
          total_quizzes_completed: 0,
          completion_rate: 0,
          strengths: [],
          weaknesses: [],
          badges: [],
        },
      };
    },
    enabled: open,
  });

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações completas e métricas de aprendizado
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.full_name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  {user.role === 'super_admin' ? (
                    <Badge variant="default">
                      <Shield className="h-3 w-3 mr-1" />
                      Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Usuário</Badge>
                  )}
                  <Badge variant="outline">
                    Cadastro: {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Learning Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Progresso</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">Nível {user.profile.level || 1}</p>
                  <p className="text-sm text-muted-foreground">{user.profile.points || 0} pontos</p>
                  <p className="text-sm text-muted-foreground">🔥 {user.profile.streak_days || 0} dias seguidos</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Atividades</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">{user.profile.total_lessons_completed || 0}</span> lições
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{user.profile.total_quizzes_completed || 0}</span> quizzes
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{user.profile.completion_rate || 0}%</span> conclusão
                  </p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            {user.profile.strengths && user.profile.strengths.length > 0 && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Forças</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.profile.strengths.map((strength: string) => (
                    <Badge key={strength} variant="outline" className="bg-green-50">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses */}
            {user.profile.weaknesses && user.profile.weaknesses.length > 0 && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Dificuldades</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.profile.weaknesses.map((weakness: string) => (
                    <Badge key={weakness} variant="outline" className="bg-amber-50">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {user.profile.badges && user.profile.badges.length > 0 && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Conquistas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.profile.badges.map((badge: string) => (
                    <Badge key={badge} variant="outline" className="bg-purple-50">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Usuário não encontrado
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
