import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Please set it in your .env file.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_stripe_key', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-06-24.dahlia' as any,
  appInfo: {
    name: 'USMLE QBank Marketplace',
    version: '0.1.0',
  },
});
