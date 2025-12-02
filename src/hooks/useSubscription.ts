import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  is_active: boolean;
  trial_days: number | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: string;
  billing_cycle: string | null;
  amount: number | null;
  currency: string | null;
  started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  cancel_at_period_end: boolean | null;
  plan?: SubscriptionPlan;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_type: string;
  payment_method: string | null;
  created_at: string;
  processed_at: string | null;
}

interface SubscriptionData {
  subscription: Subscription | null;
  transactions: Transaction[];
  isPremium: boolean;
  isTrialing: boolean;
  daysRemaining: number | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<SubscriptionData>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          subscription: null,
          transactions: [],
          isPremium: false,
          isTrialing: false,
          daysRemaining: null,
        };
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('mercadopago-get-subscription', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error fetching subscription:', error);
        // Return default values on error
        return {
          subscription: null,
          transactions: [],
          isPremium: false,
          isTrialing: false,
          daysRemaining: null,
        };
      }

      return data as SubscriptionData;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createSubscription = useMutation({
    mutationFn: async ({ planId, billingCycle }: { planId: string; billingCycle: 'monthly' | 'yearly' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('mercadopago-create-subscription', {
        body: { planId, billingCycle },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar assinatura',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async ({ subscriptionId, cancelAtPeriodEnd = true }: { subscriptionId: string; cancelAtPeriodEnd?: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('mercadopago-cancel-subscription', {
        body: { subscriptionId, cancelAtPeriodEnd },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Assinatura cancelada',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cancelar assinatura',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  return {
    subscription: data?.subscription || null,
    transactions: data?.transactions || [],
    isPremium: data?.isPremium || false,
    isTrialing: data?.isTrialing || false,
    daysRemaining: data?.daysRemaining || null,
    isLoading,
    error,
    refetch,
    createSubscription,
    cancelSubscription,
  };
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
};
