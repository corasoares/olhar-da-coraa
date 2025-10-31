import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useActiveLessons } from '@/hooks/useActiveLessons';
import { LessonCard } from '@/components/lessons/LessonCard';
import { BookOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

const Lessons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    weeklyLessons,
    additionalLessons,
    upcomingLessons,
    pastLessons,
    weeklyProgress,
    additionalProgress,
    upcomingProgress,
    pastProgress,
    isLoading,
  } = useActiveLessons(user?.id);

  const handleStartLesson = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MemberSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Lições de Moda
              </h1>
              <p className="text-muted-foreground mt-2">
                Explore e aprenda sobre a história e tendências da moda
              </p>
            </div>
            <SidebarTrigger />
          </div>

          {isLoading ? (
            <div className="space-y-8">
              <Card className="animate-pulse h-64" />
              <div className="h-4 bg-muted rounded w-48 mb-4" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse h-48" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Weekly Lesson */}
              {weeklyLessons && weeklyLessons.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">📚 Lição da Semana</h2>
                  {weeklyLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      progress={weeklyProgress?.find((p) => p.lesson_id === lesson.id)}
                      onStart={() => handleStartLesson(lesson.id)}
                      variant="default"
                    />
                  ))}
                </div>
              )}

              {/* Additional Lessons */}
              {additionalLessons && additionalLessons.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">➕ Atividades Adicionais</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {additionalLessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        progress={additionalProgress?.find((p) => p.lesson_id === lesson.id)}
                        onStart={() => handleStartLesson(lesson.id)}
                        variant="compact"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Lessons */}
              {upcomingLessons && upcomingLessons.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">🔜 Próximas Lições</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingLessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        progress={upcomingProgress?.find((p) => p.lesson_id === lesson.id)}
                        onStart={() => handleStartLesson(lesson.id)}
                        variant="compact"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Lessons */}
              {pastLessons && pastLessons.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-xl font-bold mb-4 hover:text-primary transition-colors">
                    <ChevronDown className="h-5 w-5" />
                    📋 Lições Encerradas ({pastLessons.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {pastLessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          progress={pastProgress?.find((p) => p.lesson_id === lesson.id)}
                          onStart={() => handleStartLesson(lesson.id)}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Empty State */}
              {!weeklyLessons?.length &&
                !additionalLessons?.length &&
                !upcomingLessons?.length &&
                !pastLessons?.length && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Nenhuma lição disponível</h3>
                      <p className="text-muted-foreground text-center">
                        Novas lições serão adicionadas em breve. Fique atenta!
                      </p>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Lessons;
