import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { useSubscription, useSubscriptionPlans } from '@/hooks/useSubscription';
import { PricingCard } from '@/components/subscription/PricingCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Shield, Zap, Heart } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { subscription, createSubscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const navigate = useNavigate();

  // Handle success callback from Mercado Pago
  if (status === 'success') {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <MemberSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                <Heart className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Pagamento Confirmado!</h1>
              <p className="text-muted-foreground mb-8">
                Obrigado por assinar! Sua assinatura está sendo processada e em breve você terá acesso a todos os recursos premium.
              </p>
              <Button onClick={() => navigate('/subscription')}>
                Ver Minha Assinatura
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const isLoading = subscriptionLoading || plansLoading;

  const handleSelectPlan = (planId: string) => {
    createSubscription.mutate({ planId, billingCycle });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <MemberSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="mb-4 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">Escolha seu Plano</h1>
                <p className="text-muted-foreground text-lg">
                  Desbloqueie todo o potencial da plataforma
                </p>
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <Tabs 
                value={billingCycle} 
                onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}
              >
                <TabsList className="grid w-[300px] grid-cols-2">
                  <TabsTrigger value="monthly">Mensal</TabsTrigger>
                  <TabsTrigger value="yearly" className="relative">
                    Anual
                    <span className="absolute -top-2 -right-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                      -20%
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Plans */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {plans?.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    name={plan.name}
                    description={plan.description}
                    priceMonthly={plan.price_monthly}
                    priceYearly={plan.price_yearly}
                    currency={plan.currency}
                    features={plan.features as string[]}
                    isPopular={plan.slug === 'premium'}
                    isCurrentPlan={subscription?.plan_id === plan.id}
                    billingCycle={billingCycle}
                    onSelect={() => handleSelectPlan(plan.id)}
                    isLoading={createSubscription.isPending}
                    disabled={plan.price_monthly === 0}
                  />
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="border-t pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Pagamento Seguro</h3>
                  <p className="text-sm text-muted-foreground">
                    Processado pelo Mercado Pago com total segurança
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Acesso Imediato</h3>
                  <p className="text-sm text-muted-foreground">
                    Após a confirmação do pagamento
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Cancele Quando Quiser</h3>
                  <p className="text-sm text-muted-foreground">
                    Sem multas ou taxas de cancelamento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Checkout;
