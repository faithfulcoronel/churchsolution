// src/lib/givingImport.ts
import { supabase } from './supabase';
import { tenantUtils } from '../utils/tenantUtils';
import type { Member } from '../models/member.model';

/**
 * Map of normalized giving category keys to possible header aliases.
 */
export const givingCategoryAliases: Record<string, string[]> = {
  tithe: ['tithe', 'tithes'],
  first_fruit_offering: ['first fruit', 'firstfruit', 'first fruit offering'],
  love_offering: ['love offering', 'love'],
  mission_offering: ['mission offering', 'missions offering', 'missions'],
  mission_pledge: ['mission pledge', 'missions pledge', 'pledge'],
  building_offering: ['building offering', 'building'],
  lot_offering: ['lot offering', 'lot'],
  other_income: ['other income', 'other'],
};

/**
 * Normalize column headers from an imported file to the canonical
 * category keys used by the application.
 */
export function normalizeColumns(headers: string[]): string[] {
  const clean = (h: string) => h.trim().toLowerCase().replace(/[_\s]+/g, ' ');
  return headers.map((h) => {
    const normalized = clean(h);
    for (const [key, aliases] of Object.entries(givingCategoryAliases)) {
      if (aliases.some((a) => clean(a) === normalized)) {
        return key;
      }
    }
    return normalized.replace(/\s+/g, '_');
  });
}

/**
 * Compute the Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Attempt to find the best matching member by full name for the current tenant.
 * Uses a simple Levenshtein distance check for fuzzy matching.
 */
export async function findMemberByName(name: string): Promise<Member | null> {
  const tenantId = await tenantUtils.getTenantId();
  if (!tenantId) return null;

  const { data, error } = await supabase
    .from('members')
    .select('id, first_name, last_name')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null);

  if (error) throw error;
  if (!data) return null;

  const target = name.trim().toLowerCase();
  let best: { member: Member; score: number } | null = null;

  for (const m of data) {
    const full = `${m.first_name} ${m.last_name}`.trim().toLowerCase();
    const distance = levenshtein(target, full);
    if (!best || distance < best.score) {
      best = { member: m as Member, score: distance };
    }
  }

  return best?.member || null;
}
