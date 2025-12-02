import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionContextType {
  subscription: any;
  isPremium: boolean;
  isTrialing: boolean;
  daysRemaining: number | null;
  isLoading: boolean;
  refetch: () => void;
}

const defaultValue: SubscriptionContextType = {
  subscription: null,
  isPremium: false,
  isTrialing: false,
  daysRemaining: null,
  isLoading: false,
  refetch: () => {},
};

const SubscriptionContext = createContext<SubscriptionContextType>(defaultValue);

export const useSubscriptionContext = () => {
  return useContext(SubscriptionContext);
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const { user } = useAuth();
  const subscriptionData = useSubscription();

  // If no user, return default values
  if (!user) {
    return (
      <SubscriptionContext.Provider value={defaultValue}>
        {children}
      </SubscriptionContext.Provider>
    );
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscription: subscriptionData.subscription,
        isPremium: subscriptionData.isPremium,
        isTrialing: subscriptionData.isTrialing,
        daysRemaining: subscriptionData.daysRemaining,
        isLoading: subscriptionData.isLoading,
        refetch: subscriptionData.refetch,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
