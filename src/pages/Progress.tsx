import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLearningProfile } from '@/hooks/useLearningProfile';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Award, Zap } from 'lucide-react';

const Progress = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useLearningProfile(user?.id);

  const getNextLevelPoints = (currentLevel: number) => {
    return currentLevel * 1000;
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const pointsForCurrentLevel = (profile.level - 1) * 1000;
    const pointsInCurrentLevel = profile.points - pointsForCurrentLevel;
    const pointsNeededForNextLevel = 1000;
    return (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <MemberSidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MemberSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Seu Progresso
              </h1>
              <p className="text-muted-foreground mt-2">
                Acompanhe sua evolução no estudo da moda
              </p>
            </div>
            <SidebarTrigger />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Nível</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{profile?.level || 1}</div>
                <ProgressBar value={getLevelProgress()} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round(getLevelProgress())}% para o próximo nível
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profile?.points || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {getNextLevelPoints(profile?.level || 1) - (profile?.points || 0)} para o próximo nível
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pontuação Média</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profile?.average_score.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  em {profile?.total_quizzes_completed || 0} quizzes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sequência</CardTitle>
                <Award className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profile?.streak_days || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">dias consecutivos</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Pontos Fortes</CardTitle>
                <CardDescription>Tópicos que você domina</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.strengths && profile.strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.strengths.map((strength) => (
                      <Badge key={strength} variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Complete mais quizzes para identificar seus pontos fortes
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Áreas de Melhoria</CardTitle>
                <CardDescription>Tópicos que requerem mais atenção</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.weaknesses && profile.weaknesses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.weaknesses.map((weakness) => (
                      <Badge key={weakness} variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Suas dificuldades serão identificadas automaticamente
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Badges Conquistados</CardTitle>
              <CardDescription>Suas conquistas no aprendizado</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.badges && profile.badges.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {profile.badges.map((badge) => (
                    <div key={badge} className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <span className="text-xs text-center">{badge}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Complete lições e quizzes para conquistar badges!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Progress;
