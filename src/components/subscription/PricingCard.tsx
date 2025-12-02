import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  billingCycle: 'monthly' | 'yearly';
  onSelect: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const PricingCard = ({
  name,
  description,
  priceMonthly,
  priceYearly,
  currency,
  features,
  isPopular = false,
  isCurrentPlan = false,
  billingCycle,
  onSelect,
  isLoading = false,
  disabled = false,
}: PricingCardProps) => {
  const price = billingCycle === 'yearly' ? priceYearly : priceMonthly;
  const monthlyEquivalent = billingCycle === 'yearly' ? priceYearly / 12 : priceMonthly;
  const savings = billingCycle === 'yearly' ? Math.round(((priceMonthly * 12 - priceYearly) / (priceMonthly * 12)) * 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  return (
    <Card 
      className={cn(
        "relative flex flex-col transition-all duration-200",
        isPopular && "border-primary shadow-lg scale-105",
        isCurrentPlan && "border-green-500 bg-green-500/5"
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
          <Sparkles className="h-3 w-3" />
          Mais Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white">
          Plano Atual
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">{name}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">
              {formatCurrency(monthlyEquivalent)}
            </span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          
          {billingCycle === 'yearly' && (
            <div className="mt-1 space-y-1">
              <p className="text-sm text-muted-foreground">
                {formatCurrency(price)} cobrado anualmente
              </p>
              {savings > 0 && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                  Economize {savings}%
                </Badge>
              )}
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={onSelect}
          disabled={disabled || isCurrentPlan || isLoading}
          className="w-full"
          variant={isPopular ? 'default' : 'outline'}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : isCurrentPlan ? (
            'Plano Atual'
          ) : price === 0 ? (
            'Começar Grátis'
          ) : (
            'Assinar Agora'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
