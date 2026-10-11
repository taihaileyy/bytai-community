/**
 * Payments — DEMO ONLY. Nothing here talks to a payment processor and no card
 * data is ever collected. The simulated provider just waits and returns a
 * fake receipt.
 *
 * Later: implement `PaymentProvider` with Stripe (e.g. a Supabase Edge
 * Function that creates a PaymentIntent / Checkout Session) and swap
 * `paymentProvider` below. Screens only call `paymentProvider.charge`.
 */
import type { DonationFrequency } from '@/data/types';

export interface ChargeRequest {
  amount: number;
  frequency: DonationFrequency;
  fund: string;
  method: 'apple-pay' | 'card' | 'bank';
}

export interface ChargeResult {
  ok: boolean;
  receipt: string;
  processedAt: string;
}

export interface PaymentProvider {
  readonly isDemo: boolean;
  charge(req: ChargeRequest): Promise<ChargeResult>;
}

export const demoPaymentProvider: PaymentProvider = {
  isDemo: true,
  async charge() {
    await new Promise((r) => setTimeout(r, 1600));
    return {
      ok: true,
      receipt: `DEMO-${Math.floor(100000 + Math.random() * 899999)}`,
      processedAt: new Date().toISOString(),
    };
  },
};

export const paymentProvider: PaymentProvider = demoPaymentProvider;
