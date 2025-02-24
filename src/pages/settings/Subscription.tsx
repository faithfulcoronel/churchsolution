import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { stripe } from '../../lib/stripe';
import { PricingTable } from '../../components/ui/PricingTable';
import { Crown, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useMessageStore } from '../../components/MessageHandler';
import Usage from './Usage';

function Subscription() {
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_current_tenant');

      if (error) throw error;
      return data?.[0];
    },
  });

  const createPaymentSession = async (tier: string, cycle: 'monthly' | 'annual') => {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        tier,
        cycle,
        tenantId: tenant?.id,
        returnUrl: window.location.origin + '/settings/subscription'
      }
    });

    if (error) throw error;
    return data.sessionId;
  };

  const upgradeMutation = useMutation({
    mutationFn: async ({ tier, cycle }: { tier: string; cycle: 'monthly' | 'annual' }) => {
      setIsProcessing(true);
      try {
        // For free tier, directly update subscription
        if (tier.toLowerCase() === 'free') {
          const { data, error } = await supabase
            .rpc('update_tenant_subscription', {
              p_subscription_tier: tier.toLowerCase(),
              p_billing_cycle: cycle
            });

          if (error) throw error;
          return data;
        }

        // For paid tiers, create Stripe checkout session
        const sessionId = await createPaymentSession(tier, cycle);
        const stripeInstance = await stripe;
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }

        // Redirect to Stripe checkout
        const { error: stripeError } = await stripeInstance.redirectToCheckout({
          sessionId
        });

        if (stripeError) {
          throw stripeError;
        }
      } finally {
        setIsProcessing(false);
      }
    },
    onError: (error: Error) => {
      addMessage({
        type: 'error',
        text: error.message,
        duration: 5000,
      });
      setShowUpgradeModal(false);
    }
  });

  const handleUpgrade = (tier: string, cycle: 'monthly' | 'annual') => {
    setSelectedTier(tier);
    setBillingCycle(cycle);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedTier) return;
    try {
      await upgradeMutation.mutateAsync({
        tier: selectedTier,
        cycle: billingCycle
      });
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const getButtonCaption = (tierName: string) => {
    const currentTier = tenant?.subscription_tier?.toLowerCase() || 'free';
    const tiers = ['free', 'basic', 'advanced', 'premium', 'enterprise'];
    const currentIndex = tiers.indexOf(currentTier);
    const selectedIndex = tiers.indexOf(tierName.toLowerCase());

    if (currentTier === tierName.toLowerCase()) {
      return 'Current Plan';
    } else if (selectedIndex > currentIndex) {
      return 'Upgrade';
    } else {
      return 'Downgrade';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Current Subscription */}
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">Current Subscription</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Review and manage your subscription details.
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <dt className="flex items-center text-sm font-medium text-gray-500">
              <Crown className="h-5 w-5 text-primary-500 mr-2" />
              Current Plan
            </dt>
            <dd className="mt-2">
              <span className="text-3xl font-medium tracking-tight text-gray-900">
                {tenant?.subscription_tier || 'Free'}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({tenant?.subscription_status || 'active'})
              </span>
            </dd>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <dt className="flex items-center text-sm font-medium text-gray-500">
              <CreditCard className="h-5 w-5 text-primary-500 mr-2" />
              Billing Cycle
            </dt>
            <dd className="mt-2">
              <span className="text-3xl font-medium tracking-tight text-gray-900">
                {tenant?.billing_cycle === 'annual' ? 'Annual' : 'Monthly'}
              </span>
            </dd>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <dt className="flex items-center text-sm font-medium text-gray-500">
              <Calendar className="h-5 w-5 text-primary-500 mr-2" />
              Next Billing Date
            </dt>
            <dd className="mt-2">
              <span className="text-3xl font-medium tracking-tight text-gray-900">
                {tenant?.subscription_end_date
                  ? new Date(tenant.subscription_end_date).toLocaleDateString()
                  : 'N/A'}
              </span>
            </dd>
          </div>
        </dl>

        {/* Usage Warning */}
        {tenant?.subscription_tier === 'free' && (
          <div className="mt-6 rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  You're on the Free Plan
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Upgrade to a paid plan to unlock more features and increase your member and transaction limits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Section */}
      <Usage />

      {/* Available Plans */}
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">Available Plans</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Choose the plan that best fits your church's needs.
        </p>

        <div className="mt-6">
          <PricingTable
            currentTier={tenant?.subscription_tier}
            onUpgrade={handleUpgrade}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
          />
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setSelectedTier(null);
        }}
        title="Confirm Subscription Change"
      >
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {getButtonCaption(selectedTier || '')} to {selectedTier} Plan
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to {getButtonCaption(selectedTier || '').toLowerCase()} to the {selectedTier} plan with {billingCycle} billing?
              {selectedTier?.toLowerCase() !== 'free' && ' You will be redirected to our secure payment processor.'}
            </p>
            {billingCycle === 'annual' && selectedTier?.toLowerCase() !== 'free' && (
              <p className="mt-2 text-sm text-green-600">
                You'll save 17% with annual billing!
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpgradeModal(false);
                setSelectedTier(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUpgrade}
              loading={isProcessing}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Change'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Subscription;