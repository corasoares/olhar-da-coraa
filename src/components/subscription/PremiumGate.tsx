import { ReactNode } from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  featureName?: string;
}

export const PremiumGate = ({ 
  children, 
  fallback, 
  showUpgradePrompt = true,
  featureName = 'este conteúdo'
}: PremiumGateProps) => {
  const { isPremium, isTrialing, isLoading } = useSubscriptionContext();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Verificando acesso...</div>
      </div>
    );
  }

  if (isPremium || isTrialing) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Conteúdo Premium
        </CardTitle>
        <CardDescription>
          Assine para acessar {featureName}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Desbloqueie todos os recursos premium e acelere seu aprendizado.
        </p>
        <Button 
          onClick={() => navigate('/checkout')}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
};

// Helper function to check if user can access content
export const canAccessPremiumContent = (isPremium: boolean, isTrialing: boolean, contentIsPremium: boolean): boolean => {
  if (!contentIsPremium) return true;
  return isPremium || isTrialing;
};
