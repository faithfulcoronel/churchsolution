import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { tenantUtils } from '../../utils/tenantUtils';
import { useMessageStore } from '../../components/MessageHandler';
import { Entity, EntityConfig, QueryOptions, QueryResult, RepositoryOptions, RepositoryError, UpdateOptions } from './types';
import { createEntityStore } from './store';
import { queryUtils } from '../../utils/queryUtils';

export class Repository<T extends Entity> {
  private readonly config: EntityConfig<T>;
  private readonly options: RepositoryOptions;
  private readonly store;
  private realtimeSubscription?: ReturnType<typeof supabase.channel>;

  constructor(config: EntityConfig<T>, options: RepositoryOptions = {}) {
    this.config = config;
    this.options = {
      enableRealtime: false,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000, // 30 seconds
      ...options
    };
    this.store = createEntityStore<T>();

    if (this.options.enableRealtime) {
      this.setupRealtimeSubscription();
    }
  }

  private async setupRealtimeSubscription() {
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) return;

      // Unsubscribe from any existing subscription
      await this.cleanupSubscription();

      // Create new subscription
      this.realtimeSubscription = supabase
        .channel(`${this.config.tableName}_changes`)
        .on(
          'postgres_changes',
          {
            event: this.options.realtimeConfig?.event || '*',
            schema: 'public',
            table: this.config.tableName,
            filter: this.options.realtimeConfig?.filter || `tenant_id=eq.${tenantId}`
          },
          (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            switch (eventType) {
              case 'INSERT':
                this.store.getState().addEntity(newRecord as T);
                break;
              case 'UPDATE':
                this.store.getState().updateEntity(oldRecord.id, newRecord as T);
                break;
              case 'DELETE':
                this.store.getState().removeEntity(oldRecord.id);
                break;
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.error(`Error setting up realtime subscription for ${this.config.tableName}:`, error);
    }
  }

  private async cleanupSubscription() {
    if (this.realtimeSubscription) {
      try {
        await this.realtimeSubscription.unsubscribe();
      } catch (error) {
        console.error(`Error unsubscribing from ${this.config.tableName} changes:`, error);
      }
    }
  }
  
  private handleError(error: any): RepositoryError {
    const repositoryError: RepositoryError = new Error(error.message);
    
    if ('code' in error) {
      repositoryError.code = error.code;
      repositoryError.details = error.details;
      repositoryError.hint = error.hint;
      
      // Get user-friendly message from config or use default
      repositoryError.userMessage = 
        this.config.errorMessages?.[error.code] ||
        'An error occurred while processing your request';
    } else {
      repositoryError.userMessage = error.message;
    }

    // Log error for debugging
    console.error(`Repository Error (${this.config.tableName}):`, {
      error: repositoryError,
      originalError: error
    });

    // Show user message
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'error',
      text: repositoryError.userMessage,
      duration: 5000
    });

    return repositoryError;
  }

  // Generalized sanitizeData method: Accept fields to remove dynamically
  private sanitizeData(data: any, fieldsToRemove: string[]): any {
    const sanitizedData = { ...data };
    
    fieldsToRemove.forEach((field) => {
      delete sanitizedData[field];
    });
    
    return sanitizedData;
  }

  public useQuery(options: QueryOptions = {}) {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);

    return useQuery({
      queryKey: [this.config.tableName, serializedOptions],
      queryFn: async (): Promise<QueryResult<T>> => {
        try {
          // Use queryUtils to fetch data
          const { data, count } = await queryUtils.fetch<T>(
            this.config.tableName,
            {
              select: this.config.defaultSelect,
              relationships: this.config.defaultRelationships,
              order: this.config.defaultOrder,
              ...rest
            }
          );

          // Update local store
          data?.forEach(entity => {
            this.store.getState().addEntity(entity);
          });

          return { data, count, error: null };
        } catch (error) {
          const repositoryError = this.handleError(error);
          return { data: [], count: 0, error: repositoryError };
        }
      },
      staleTime: this.options.staleTime,
      cacheTime: this.options.cacheTime,
      enabled: enabled !== false,
    });
  }

  public useCreate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data: Partial<T>): Promise<T> => {
        try {
          // Run pre-create hook
          let processedData = data;
          if (this.config.onBeforeCreate) {
            processedData = await this.config.onBeforeCreate(data);
          }

          // Create record using queryUtils
          const created = await queryUtils.create<T>(
            this.config.tableName, 
            processedData
          );

          // Update local store
          this.store.getState().addEntity(created);

          // Run post-create hook
          if (this.config.onAfterCreate) {
            await this.config.onAfterCreate(created);
          }

          // Show success message
          const { addMessage } = useMessageStore.getState();
          addMessage({
            type: 'success',
            text: 'Record created successfully',
            duration: 3000
          });

          return created;
        } catch (error) {
          throw this.handleError(error);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [this.config.tableName] });
      }
    });
  }

  public useUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ id, data, relations, fieldsToRemove }: UpdateOptions<T>): Promise<T> => {
        try {
          // Run pre-update hook
          let processedData = data;
          if (this.config.onBeforeUpdate) {
            processedData = await this.config.onBeforeUpdate(id, data);
          }

          // Sanitize the processed data to remove nested objects before passing to queryUtils.update
          // Make fieldsToRemove optional
          if (fieldsToRemove) {
            processedData = this.sanitizeData(processedData, fieldsToRemove);
          }

          // Update record using queryUtils
          const updated = await queryUtils.update<T>(
            this.config.tableName,
            id,
            processedData,
            relations
          );

          // Update local store
          this.store.getState().updateEntity(id, updated);

          // Run post-update hook
          if (this.config.onAfterUpdate) {
            await this.config.onAfterUpdate(updated);
          }

          // Show success message
          const { addMessage } = useMessageStore.getState();
          addMessage({
            type: 'success',
            text: 'Record updated successfully',
            duration: 3000
          });

          return updated;
        } catch (error) {
          throw this.handleError(error);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [this.config.tableName] });
      }
    });
  }

  public useDelete() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: string): Promise<void> => {
        try {
          // Run pre-delete hook
          if (this.config.onBeforeDelete) {
            await this.config.onBeforeDelete(id);
          }

          // Delete record using queryUtils
          await queryUtils.delete(this.config.tableName, id);

          // Update local store
          this.store.getState().removeEntity(id);

          // Run post-delete hook
          if (this.config.onAfterDelete) {
            await this.config.onAfterDelete(id);
          }

          // Show success message
          const { addMessage } = useMessageStore.getState();
          addMessage({
            type: 'success',
            text: 'Record deleted successfully',
            duration: 3000
          });
        } catch (error) {
          throw this.handleError(error);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [this.config.tableName] });
      }
    });
  }

  public useStore() {
    return this.store;
  }

  public async destroy() {
    await this.cleanupSubscription();
    this.store.getState().clear();
  }
}