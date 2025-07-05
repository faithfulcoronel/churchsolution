import 'reflect-metadata';
import { injectable } from 'inversify';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { handleSupabaseError } from '../utils/supabaseErrorHandler';
import { handleError } from '../utils/errorHandler';
import { BaseModel } from '../models/base.model';
import { FilterOperator } from '../lib/repository/types';

export interface QueryOptions {
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
    alias?: string;
    select?: string[];
    nestedRelationships?: Array<string | {
      table: string;
      foreignKey: string;
      alias?: string;
      select?: string[];
    }>;
  }[];
  enabled?: boolean;
}

@injectable()
export class BaseAdapter<T extends BaseModel> {
  protected tableName: string = '';
  protected defaultSelect: string = '';
  protected defaultRelationships: QueryOptions['relationships'] = [];

  // Lifecycle hooks
  protected async onBeforeCreate(data: Partial<T>): Promise<Partial<T>> {
    return data;
  }

  protected async onAfterCreate(data: T): Promise<void> {
    // Default implementation
  }

  protected async onBeforeUpdate(id: string, data: Partial<T>): Promise<Partial<T>> {
    return data;
  }

  protected async onAfterUpdate(data: T): Promise<void> {
    // Default implementation
  }

  protected async onBeforeDelete(id: string): Promise<void> {
    // Default implementation
  }

  protected async onAfterDelete(id: string): Promise<void> {
    // Default implementation
  }

  protected buildFilterQuery(query: PostgrestFilterBuilder<any, any, any>, key: string, filter: any) {
    const applyFilter = (operator: FilterOperator, value: any, valueTo?: any) => {
      if (value === null || value === undefined) {
        return query;
      }

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
      return query.or(filter.map(f => `${key}.${f.operator}.${f.value}`).join(','));
    }

    return applyFilter(filter.operator, filter.value, filter.valueTo);
  }

  protected buildRelationshipQuery(
    relationships: QueryOptions['relationships'] = []
  ): string {
    const buildNestedSelect = (
      relationship: NonNullable<QueryOptions['relationships']>[0]
    ): string => {
      const baseSelect = relationship.select?.join(',') || '*';
      const alias = relationship.alias ? `${relationship.alias}:` : '';

      if (!relationship.nestedRelationships?.length) {
        return `${alias}${relationship.table}!${relationship.foreignKey}(${baseSelect})`;
      }

      const nestedSelects = relationship.nestedRelationships.map(nested =>
        buildNestedSelect(
          typeof nested === 'string'
            ? { table: nested, foreignKey: 'id' }
            : nested
        )
      );

      return `${alias}${relationship.table}!${relationship.foreignKey}(${baseSelect},${nestedSelects.join(',')})`;
    };

    return relationships.map(buildNestedSelect).join(',');
  }

  protected async buildSecureQuery(
    options: QueryOptions = {}
  ): Promise<{ query: PostgrestFilterBuilder<any, any, T[]> }> {
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) {
        throw new Error('No tenant context found');
      }

      const relationships = options.relationships || this.defaultRelationships || [];
      const relationshipQuery = this.buildRelationshipQuery(relationships);
      
      let query = supabase
        .from(this.tableName)
        .select(
          relationshipQuery 
            ? `${options.select || this.defaultSelect || '*'}, ${relationshipQuery}`
            : (options.select || this.defaultSelect || '*'),
          { count: 'exact' }
        )
        .eq('tenant_id', tenantId)
        .is('deleted_at', null);

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, filter]) => {
          if (filter !== undefined && filter !== null) {
            query = this.buildFilterQuery(query, key, filter);
          }
        });
      }

      if (options.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? true
        });
      }

      if (options.pagination) {
        const { page, pageSize } = options.pagination;
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);
      }

      return { query };
    } catch (error) {
      throw handleError(error, {
        context: 'buildSecureQuery',
        tableName: this.tableName,
        options
      });
    }
  }

  public async fetch(options: QueryOptions = {}): Promise<{ data: T[]; count: number | null }> {
    try {
      if (options.enabled === false) {
        return { data: [], count: null };
      }

      const { query } = await this.buildSecureQuery(options);
      const { data, error, count } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      return { data: data || [], count };
    } catch (error) {
      throw handleError(error, {
        context: 'fetch',
        tableName: this.tableName,
        options
      });
    }
  }

  public async fetchById(id: string, options: Omit<QueryOptions, 'pagination'> = {}): Promise<T | null> {
    try {
      const { query } = await this.buildSecureQuery(options);
      const { data, error } = await query
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      throw handleError(error, {
        context: 'fetchById',
        tableName: this.tableName,
        id,
        options
      });
    }
  }

  public async create(data: Partial<T>, 
                     relations?: Record<string, any[]>, 
                     fieldsToRemove: string[] = []): Promise<T> {
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) {
        throw new Error('No tenant context found');
      }

      // Run pre-create hook
      let processedData = await this.onBeforeCreate(data);
      
      // Remove specified fields
      if (fieldsToRemove) {
        processedData = this.sanitizeData(processedData, fieldsToRemove);
      }

      // Create record
      const { data: created, error: createError } = await supabase
        .from(this.tableName)
        .insert([{
          ...processedData,
          tenant_id: tenantId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) {
        handleSupabaseError(createError);
      }

      // Handle relations if provided
      if (relations) {
        await this.updateRelations(created.id, relations);
      }

      // Run post-create hook
      await this.onAfterCreate(created);

      return created;
    } catch (error) {
      throw handleError(error, {
        context: 'create',
        tableName: this.tableName,
        data
      });
    }
  }

  public async update(id: string, data: Partial<T>, 
                     relations?: Record<string, any[]>, 
                     fieldsToRemove: string[] = []): Promise<T> {
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) {
        throw new Error('No tenant context found');
      }

      // Run pre-update hook
      let processedData = await this.onBeforeUpdate(id, data);

      // Remove specified fields
      if (fieldsToRemove) {
        processedData = this.sanitizeData(processedData, fieldsToRemove);
      }

      // Update record
      const { data: updated, error: updateError } = await supabase
        .from(this.tableName)
        .update({
          ...processedData,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (updateError) {
        handleSupabaseError(updateError);
      }

      // Handle relations if provided
      if (relations) {
        await this.updateRelations(id, relations);
      }

      // Run post-update hook
      await this.onAfterUpdate(updated);

      return updated;
    } catch (error) {
      throw handleError(error, {
        context: 'update',
        tableName: this.tableName,
        id,
        data
      });
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) {
        throw new Error('No tenant context found');
      }

      // Run pre-delete hook
      await this.onBeforeDelete(id);

      // Soft delete the record
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) {
        handleSupabaseError(error);
      }

      // Run post-delete hook
      await this.onAfterDelete(id);
    } catch (error) {
      throw handleError(error, {
        context: 'delete',
        tableName: this.tableName,
        id
      });
    }
  }

  protected async updateRelations(id: string, relations: Record<string, any[]>): Promise<void> {
    const tenantId = await tenantUtils.getTenantId();
    
    for (const [relationKey, relationIds] of Object.entries(relations)) {
      if (!relationIds || !relationIds.length) continue;

      const relationConfig = await this.getRelationConfig(relationKey);
      if (!relationConfig) continue;

      try {
        if (relationConfig.type === 'many-to-many' && relationConfig.joinTable) {
          await supabase
            .from(relationConfig.joinTable)
            .delete()
            .eq(relationConfig.foreignKey, id)
            .eq('tenant_id', tenantId);

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
          const { error } = await supabase
            .from(relationConfig.table)
            .update({ [relationConfig.foreignKey]: id })
            .in('id', relationIds)
            .eq('tenant_id', tenantId);

          if (error) throw error;
        }
      } catch (error) {
        throw handleError(error, {
          context: 'updateRelations',
          tableName: this.tableName,
          relationKey,
          id
        });
      }
    }
  }

  protected async getRelationConfig(relationKey: string): Promise<{
    table: string;
    foreignKey: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    joinTable?: string;
    joinForeignKey?: string;
  } | null> {
    return null;
  }

  // Generalized sanitizeData method: Accept fields to remove dynamically
  private sanitizeData(data: any, fieldsToRemove: string[]): any {
    const sanitizedData = { ...data };
    
    fieldsToRemove.forEach((field) => {
      delete sanitizedData[field];
    });
    
    return sanitizedData;
  }
}