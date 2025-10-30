import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lesson, UserLessonProgress } from '@/types/learning';
import { Calendar, Clock, Award, Image as ImageIcon, FileText, Video, FileAudio, File } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LessonCardProps {
  lesson: Lesson;
  progress?: UserLessonProgress | null;
  onStart: () => void;
  variant?: 'default' | 'compact';
}

export function LessonCard({ lesson, progress, onStart, variant = 'default' }: LessonCardProps) {
  const getFormatIcon = () => {
    switch (lesson.format) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <FileAudio className="h-4 w-4" />;
      case 'pdf': return <File className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatLabel = () => {
    const labels = {
      image: 'Imagem',
      text: 'Texto',
      video: 'Vídeo',
      audio: 'Áudio',
      pdf: 'PDF',
    };
    return labels[lesson.format || 'text'];
  };

  const getStatusBadge = () => {
    if (!lesson.start_date || !lesson.end_date) return null;

    const now = new Date();
    const startDate = new Date(lesson.start_date);
    const endDate = new Date(lesson.end_date);
    const daysLeft = differenceInDays(endDate, now);

    if (now < startDate) {
      return <Badge variant="secondary">Em breve</Badge>;
    }
    if (now > endDate) {
      return <Badge variant="outline">Encerrada</Badge>;
    }
    if (daysLeft <= 1) {
      return <Badge variant="destructive">Última chance!</Badge>;
    }
    if (progress?.status === 'completed') {
      return <Badge className="bg-green-500">Concluída</Badge>;
    }
    return <Badge>Ativa</Badge>;
  };

  const getButtonLabel = () => {
    if (progress?.status === 'completed') return 'Ver Resultado';
    if (progress?.status === 'in_progress') return 'Continuar';
    return 'Iniciar Lição';
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              {lesson.description && (
                <CardDescription className="mt-1 line-clamp-2">{lesson.description}</CardDescription>
              )}
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardFooter>
          <Button onClick={onStart} className="w-full">
            {getButtonLabel()}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getFormatIcon()}
              <span className="text-sm text-muted-foreground">{getFormatLabel()}</span>
            </div>
            <CardTitle>{lesson.title}</CardTitle>
            {lesson.description && (
              <CardDescription className="mt-2">{lesson.description}</CardDescription>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {lesson.start_date && lesson.end_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(lesson.start_date), "dd/MM", { locale: ptBR })} - {format(new Date(lesson.end_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        )}

        {lesson.estimated_duration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{lesson.estimated_duration} minutos</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>{lesson.points_reward} pontos</span>
        </div>

        {lesson.topics && lesson.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lesson.topics.map((topic, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {progress && progress.status !== 'completed' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{progress.progress_percentage}%</span>
            </div>
            <Progress value={progress.progress_percentage} />
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={onStart} className="w-full">
          {getButtonLabel()}
        </Button>
      </CardFooter>
    </Card>
  );
}
