import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSuggestDifficulty = () => {
  const [isLoading, setIsLoading] = useState(false);

  const suggestDifficulty = async (
    question: string,
    type: 'dissertativa' | 'multipla_escolha',
    topicName: string,
    options?: { text: string; is_correct: boolean }[]
  ): Promise<number | null> => {
    if (!question.trim()) {
      toast.error('Digite a pergunta antes de solicitar sugestão');
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-question-difficulty', {
        body: { question, type, options, topicName }
      });

      if (error) {
        console.error('Error calling suggest-question-difficulty:', error);
        
        if (error.message?.includes('429')) {
          toast.error('Limite de requisições excedido. Tente novamente em alguns segundos.');
        } else if (error.message?.includes('402')) {
          toast.error('Créditos insuficientes. Adicione créditos ao workspace.');
        } else {
          toast.error('Erro ao sugerir dificuldade');
        }
        return null;
      }

      if (data?.difficulty) {
        toast.success(`IA sugeriu: Nível ${data.difficulty}`);
        return data.difficulty;
      }

      return null;
    } catch (error) {
      console.error('Error in useSuggestDifficulty:', error);
      toast.error('Erro ao sugerir dificuldade');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { suggestDifficulty, isLoading };
};
