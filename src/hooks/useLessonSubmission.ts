import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserResponse {
  question_id: string;
  answer: string;
}

export function useLessonSubmission(lessonId: string, userId: string) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const isAllAnswered = (totalQuestions: number) => {
    return Object.keys(answers).length === totalQuestions && 
           Object.values(answers).every(a => a.trim().length > 0);
  };

  const submitResponses = async () => {
    setIsSubmitting(true);
    try {
      const responses: UserResponse[] = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }));

      const { data, error } = await supabase.functions.invoke('evaluate-lesson-responses', {
        body: {
          lesson_id: lessonId,
          user_id: userId,
          responses,
        },
      });

      if (error) throw error;

      toast.success('Respostas enviadas com sucesso!');
      return data;
    } catch (error) {
      console.error('Error submitting responses:', error);
      toast.error('Erro ao enviar respostas. Tente novamente.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    answers,
    setAnswer,
    isAllAnswered,
    submitResponses,
    isSubmitting,
  };
}
