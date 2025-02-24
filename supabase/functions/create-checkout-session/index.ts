import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@13.10.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  tier: string;
  cycle: 'monthly' | 'annual';
  tenantId: string;
  returnUrl: string;
}

const TIER_PRICES = {
  basic: {
    monthly: 'price_basic_monthly', // Replace with actual Stripe price IDs
    annual: 'price_basic_annual',
  },
  advanced: {
    monthly: 'price_advanced_monthly',
    annual: 'price_advanced_annual',
  },
  premium: {
    monthly: 'price_premium_monthly',
    annual: 'price_premium_annual',
  },
  enterprise: {
    monthly: 'price_enterprise_monthly',
    annual: 'price_enterprise_annual',
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { tier, cycle, tenantId, returnUrl } = await req.json() as RequestBody;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    // Get user from auth context
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify tenant access
    const { data: tenant, error: tenantError } = await supabaseClient
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      throw new Error('Tenant not found');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16', // Use latest API version
    });

    // Get price ID based on tier and cycle
    const priceId = TIER_PRICES[tier.toLowerCase()]?.[cycle];
    if (!priceId) {
      throw new Error('Invalid tier or billing cycle');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: tenantId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?success=false`,
      subscription_data: {
        metadata: {
          tenant_id: tenantId,
          tier: tier,
          cycle: cycle,
        },
      },
      metadata: {
        tenant_id: tenantId,
        tier: tier,
        cycle: cycle,
      },
    });

    // Return session ID
    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});