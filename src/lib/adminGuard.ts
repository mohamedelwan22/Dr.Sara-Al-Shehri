import { requireSupabase } from '@/lib/supabase';

export class AdminGuardError extends Error {
  constructor() {
    super('admin-required');
    this.name = 'AdminGuardError';
  }
}

/**
 * Explicit, server-verified admin assertion for sensitive service-layer mutations.
 *
 * This is defense-in-depth: RLS remains the final enforcement layer. It reuses the
 * existing secure `is_admin()` mechanism (SECURITY DEFINER, reads `user_roles`), so
 * it never introduces a weaker or duplicated authorization path.
 *
 * Behavior:
 * - anon / non-admin  -> throws AdminGuardError (fail closed)
 * - rpc error         -> throws (fail closed)
 * - admin             -> resolves
 */
export async function assertAdmin(): Promise<void> {
  const { data, error } = await requireSupabase().rpc('is_admin');
  if (error) throw error;
  if (!data) throw new AdminGuardError();
}
