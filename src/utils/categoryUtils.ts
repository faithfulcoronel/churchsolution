import { supabase } from '../lib/supabase';
import { tenantUtils } from './tenantUtils';

export type Category = {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CategoryType =
  | 'membership'
  | 'member_status'
  | 'income_transaction'
  | 'expense_transaction'
  | 'budget'
  | 'relationship_type';

export interface CategoryDataProvider {
  fetchCategories(tenantId: string, type: CategoryType): Promise<Category[]>;
}

class SupabaseCategoryDataProvider implements CategoryDataProvider {
  async fetchCategories(tenantId: string, type: CategoryType): Promise<Category[]> {
    const table = {
      membership: 'membership_type',
      member_status: 'membership_status',
      income_transaction: 'income_categories',
      expense_transaction: 'expense_categories',
      budget: 'budget_categories',
      relationship_type: 'relationship_categories'
    }[type];

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }
}

export class CategoryUtils {
  private static instance: CategoryUtils;
  private categories: Map<string, Category[]> = new Map();
  private lastFetch: Map<string, number> = new Map();
  private readonly CACHE_DURATION =
    parseInt(import.meta.env.VITE_CATEGORY_CACHE_DURATION_MS) || 5 * 60 * 1000; // default 5 minutes

  private constructor(private provider: CategoryDataProvider = new SupabaseCategoryDataProvider()) {}

  public static getInstance(provider: CategoryDataProvider = new SupabaseCategoryDataProvider()): CategoryUtils {
    if (!CategoryUtils.instance) {
      CategoryUtils.instance = new CategoryUtils(provider);
    }
    return CategoryUtils.instance;
  }

  public async getCategories(
    type: CategoryType,
    forceRefresh = false
  ): Promise<Category[]> {
    const now = Date.now();
    const lastFetch = this.lastFetch.get(type) || 0;
    const cached = this.categories.get(type);

    if (
      !forceRefresh &&
      cached &&
      now - lastFetch < this.CACHE_DURATION
    ) {
      return cached;
    }

    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) throw new Error('No tenant found');

      const data = await this.provider.fetchCategories(tenantId, type);

      this.categories.set(type, data);
      this.lastFetch.set(type, now);

      return data;
    } catch (error) {
      console.error(`Error fetching ${type} categories:`, error);
      return [];
    }
  }

  public async getCategoryById(type: CategoryType, id: string): Promise<Category | null> {
    const categories = await this.getCategories(type);
    return categories.find(c => c.id === id) || null;
  }

  public async getCategoryByCode(type: CategoryType, code: string): Promise<Category | null> {
    const categories = await this.getCategories(type);
    return categories.find(c => c.code === code) || null;
  }

  public async getActiveCategoriesAsOptions(type: CategoryType): Promise<{ value: string; label: string }[]> {
    const categories = await this.getCategories(type);
    return categories
      .filter(c => c.is_active)
      .map(c => ({
        value: c.id,
        label: c.name
      }));
  }

  public async clearCache(type?: CategoryType): Promise<void> {
    if (type) {
      this.categories.delete(type);
      this.lastFetch.delete(type);
    } else {
      this.categories.clear();
      this.lastFetch.clear();
    }
  }
}

// Export a singleton instance
export const categoryUtils = CategoryUtils.getInstance();