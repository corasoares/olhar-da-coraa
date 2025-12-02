import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Crown, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface SubscriptionBannerProps {
  variant?: 'default' | 'compact';
}

export const SubscriptionBanner = ({ variant = 'default' }: SubscriptionBannerProps) => {
  const { isPremium, isTrialing, daysRemaining, isLoading } = useSubscriptionContext();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || dismissed) return null;

  // Show trial ending warning
  if (isTrialing && daysRemaining !== null && daysRemaining <= 3) {
    return (
      <div className="relative bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-yellow-700 dark:text-yellow-400">
              Seu período de teste termina em {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              Continue aproveitando todos os recursos premium.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/checkout')}
            variant="default"
            size="sm"
          >
            Assinar Agora
          </Button>
        </div>
      </div>
    );
  }

  // Don't show banner for premium users
  if (isPremium || isTrialing) return null;

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Desbloqueie todos os recursos</span>
        </div>
        <Button 
          onClick={() => navigate('/checkout')}
          size="sm"
          variant="default"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-6">
      <button 
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
          <Crown className="h-7 w-7 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">
            Turbine seu aprendizado com o Premium
          </h3>
          <p className="text-sm text-muted-foreground">
            Acesse todas as lições, quizzes avançados, recomendações personalizadas por IA e muito mais.
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/checkout')}
          size="lg"
          className="gap-2 shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          Ver Planos
        </Button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
};
