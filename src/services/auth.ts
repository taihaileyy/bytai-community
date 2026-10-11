/**
 * Auth — DEMO ONLY. Signing in just picks one of the fictional sample
 * accounts; no credentials are checked, sent or stored.
 *
 * Later: replace with Supabase Auth (`supabase.auth.signInWithOtp` or
 * `signInWithPassword`) and map the auth user id to a row in `members`.
 */
import { DEMO_ADMIN_ID, DEMO_MEMBER_ID } from '@/data/seed';

export type DemoRole = 'member' | 'admin';

export const DEMO_ACCOUNTS: Record<DemoRole, { memberId: string; email: string; label: string }> = {
  member: { memberId: DEMO_MEMBER_ID, email: 'taylor.reed@example.org', label: 'Community member' },
  admin: { memberId: DEMO_ADMIN_ID, email: 'avery@crescentcity.example.org', label: 'Program director (admin)' },
};

export async function demoSignIn(role: DemoRole): Promise<string> {
  await new Promise((r) => setTimeout(r, 700));
  return DEMO_ACCOUNTS[role].memberId;
}
