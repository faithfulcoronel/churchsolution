import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { supabase } from '../lib/supabase';
import { tenantUtils } from './tenantUtils';
import { handleSupabaseError } from './supabaseErrorHandler';
import { FilterOperator } from '../lib/repository/types';

export type QueryOptions = {
  select?: string;
  filters?: Record<string, any>;
  order?: {
    column: string;
    ascending?: boolean;
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
  relationships?: {
    table: string;
    foreignKey: string;
    select?: string[];
    nestedRelationships?: Array<string | {
      table: string;
      foreignKey: string;
      select?: string[];
    }>;
  }[];
  enabled?: boolean;
};

export class QueryUtils {
  private static instance: QueryUtils;
  
  private constructor() {}

  public static getInstance(): QueryUtils {
    if (!QueryUtils.instance) {
      QueryUtils.instance = new QueryUtils();
    }
    return QueryUtils.instance;
  }

  private buildFilterQuery(query: PostgrestFilterBuilder<any, any, any>, key: string, filter: any) {
    const applyFilter = (operator: FilterOperator, value: any, valueTo?: any) => {
      // Handle null values
      if (value === null || value === undefined) {
        return query;
      }

      // Convert operator from MUI Data Grid to Supabase
      switch (operator) {
        case 'equals':
        case 'eq':
          return query.eq(key, value);
        case 'notEquals':
        case 'neq':
          return query.neq(key, value);
        case 'greaterThan':
        case 'gt':
          return query.gt(key, value);
        case 'greaterThanOrEqual':
        case 'gte':
          return query.gte(key, value);
        case 'lessThan':
        case 'lt':
          return query.lt(key, value);
        case 'lessThanOrEqual':
        case 'lte':
          return query.lte(key, value);
        case 'contains':
          return query.ilike(key, `%${value}%`);
        case 'notContains':
          return query.not(key, 'ilike', `%${value}%`);
        case 'startsWith':
          return query.ilike(key, `${value}%`);
        case 'endsWith':
          return query.ilike(key, `%${value}`);
        case 'isEmpty':
          return query.is(key, null);
        case 'isNotEmpty':
          return query.not(key, 'is', null);
        case 'isAnyOf':
          return query.in(key, Array.isArray(value) ? value : [value]);
        case 'between':
          if (value !== null && valueTo !== null) {
            return query.gte(key, value).lte(key, valueTo);
          }
          return query;
        default:
          return query;
      }
    };

    if (key === 'or') {
      if (Array.isArray(filter)) {
        return query.or(
          filter
            .map(f =>
              f.field
                ? `${f.field}.${f.operator}.${f.value}`
                : `${key}.${f.operator}.${f.value}`
            )
            .join(',')
        );
      } else if (typeof filter === 'string') {
        return query.or(filter);
      } else if (filter?.field) {
        return query.or(`${filter.field}.${filter.operator}.${filter.value}`);
      }
    }

    if (Array.isArray(filter)) {
      // Handle OR conditions for same column
      return query.or(filter.map(f => `${key}.${f.operator}.${f.value}`).join(','));
    }

    return applyFilter(filter.operator, filter.value, filter.valueTo);
  }

  private buildRelationshipQuery(relationships: QueryOptions['relationships'] = []): string {
    const buildNestedSelect = (relationship: NonNullable<QueryOptions['relationships']>[0]): string => {
      const baseSelect = relationship.select?.join(',') || '*';
      
      if (!relationship.nestedRelationships?.length) {
        return `${relationship.table}:${relationship.foreignKey}(${baseSelect})`;
      }

      const nestedSelects = relationship.nestedRelationships.map(nested => 
        buildNestedSelect(typeof nested === 'string' 
          ? { table: nested, foreignKey: 'id' }
          : nested
        )
      );

      return `${relationship.table}:${relationship.foreignKey}(${baseSelect},${nestedSelects.join(',')})`;
    };

    return relationships.map(buildNestedSelect).join(',');
  }

  /**
   * Builds a secure, tenant-scoped query
   */
  private async buildSecureQuery<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<{ query: PostgrestFilterBuilder<any, any, T[]> }> {
    // Get current tenant
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) {
      throw new Error('No tenant context found');
    }

    // Build select statement with relationships
    const relationships = options.relationships || [];
    const relationshipQuery = this.buildRelationshipQuery(relationships);
    
    let query = supabase
      .from(table)
      .select(
        relationshipQuery 
          ? `${options.select || '*'}, ${relationshipQuery}`
          : (options.select || '*'),
        { count: 'exact' }
      )
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    // Add filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, filter]) => {
        if (filter !== undefined && filter !== null) {
          query = this.buildFilterQuery(query, key, filter);
        }
      });
    }

    // Add ordering
    if (options.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true
      });
    }

    // Add pagination
    if (options.pagination) {
      const { page, pageSize } = options.pagination;
      const start = (page - 1) * pageSize;
      query = query.range(start, start + pageSize - 1);
    }

    return { query };
  }

  /**
   * Fetches records with tenant isolation
   */
  public async fetch<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<{ data: T[]; count: number | null }> {
    try {
      if (options.enabled === false) {
        return { data: [], count: null };
      }

      const { query } = await this.buildSecureQuery<T>(table, options);
      const { data, error, count } = await query;

      if (error) {
        handleSupabaseError(error);
        throw error;
      }

      return { data: data || [], count };
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }
  }

  /**
   * Fetches a single record by ID with tenant isolation
   */
  public async fetchById<T>(
    table: string,
    id: string,
    options: Omit<QueryOptions, 'pagination'> = {}
  ): Promise<T | null> {
    try {
      const { query } = await this.buildSecureQuery<T>(table, options);
      const { data, error } = await query
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        handleSupabaseError(error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${table} by ID:`, error);
      throw error;
    }
  }

  /**
   * Creates a new record with tenant association
   */
  public async create<T>(
    table: string,
    data: Partial<T>,
    relations?: Record<string, any[]>
  ): Promise<T> {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) {
      throw new Error('No tenant context found');
    }

    try {
      // Start a transaction
      const { data: created, error: createError } = await supabase
        .from(table)
        .insert([{
          ...data,
          tenant_id: tenantId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Handle relations if provided
      if (relations && created) {
        await this.updateRelations(table, created.id, relations);
      }

      return created;
    } catch (error) {
      console.error(`Error creating ${table}:`, error);
      throw error;
    }
  }

  /**
   * Updates a record with tenant validation
   */
  public async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    relations?: Record<string, any[]>
  ): Promise<T> {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) {
      throw new Error('No tenant context found');
    }

    try {
      // Update main record
      const { data: updated, error: updateError } = await supabase
        .from(table)
        .update({
          ...data,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Handle relations if provided
      if (relations) {
        await this.updateRelations(table, id, relations);
      }

      return updated;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  }

  /**
   * Updates relations for a record
   */
  private async updateRelations(
    table: string,
    id: string,
    relations: Record<string, any[]>
  ): Promise<void> {
    const tenantId = await tenantUtils.getTenantId();
    
    // Process each relation
    for (const [relationKey, relationIds] of Object.entries(relations)) {
      // Skip if no IDs provided
      if (!relationIds || !relationIds.length) continue;

      // Get relation config
      const relationConfig = await this.getRelationConfig(table, relationKey);
      if (!relationConfig) continue;

      try {
        if (relationConfig.type === 'many-to-many' && relationConfig.joinTable) {
          // Handle many-to-many relations
          // First delete existing relations
          await supabase
            .from(relationConfig.joinTable)
            .delete()
            .eq(relationConfig.foreignKey, id)
            .eq('tenant_id', tenantId);

          // Then insert new relations
          const user = await supabase.auth.getUser();
          const relationData = relationIds.map(relationId => ({
            [relationConfig.foreignKey]: id,
            [relationConfig.joinForeignKey!]: relationId,
            tenant_id: tenantId,
            created_by: user.data.user?.id,
            created_at: new Date().toISOString()
          }));

          const { error } = await supabase
            .from(relationConfig.joinTable)
            .insert(relationData);

          if (error) throw error;
        } else {
          // Handle one-to-many relations
          const { error } = await supabase
            .from(relationConfig.table)
            .update({ [relationConfig.foreignKey]: id })
            .in('id', relationIds)
            .eq('tenant_id', tenantId);

          if (error) throw error;
        }
      } catch (error) {
        console.error(`Error updating relation ${relationKey}:`, error);
        throw error;
      }
    }
  }

  /**
   * Gets relation configuration
   */
  private async getRelationConfig(table: string, relationKey: string) {
    // This would typically come from your EntityConfig
    // For now returning null as placeholder
    return null;
  }

  /**
   * Soft deletes a record with tenant validation
   */
  public async delete(
    table: string,
    id: string
  ): Promise<void> {
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) {
        throw new Error('No tenant context found');
      }

      const { error } = await supabase
        .from(table)
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) {
        handleSupabaseError(error);
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting ${table}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a record exists with tenant validation
   */
  public async exists(
    table: string,
    filters: Record<string, any>
  ): Promise<boolean> {
    try {
      const { query } = await this.buildSecureQuery(table, { filters });
      const { count, error } = await query.select('*', { count: 'exact', head: true });

      if (error) {
        handleSupabaseError(error);
        throw error;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error(`Error checking existence in ${table}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const queryUtils = QueryUtils.getInstance();