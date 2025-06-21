import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Entity, EntityStore } from './types';

export function createEntityStore<T extends Entity>() {
  return create<EntityStore<T>>()(
    immer((set, get) => ({
      entities: {},
      
      addEntity: (entity) => {
        set((state) => {
          state.entities[entity.id] = entity;
        });
      },
      
      updateEntity: (id, updates) => {
        set((state) => {
          if (state.entities[id]) {
            state.entities[id] = { ...state.entities[id], ...updates };
          }
        });
      },
      
      removeEntity: (id) => {
        set((state) => {
          delete state.entities[id];
        });
      },
      
      getEntity: (id) => {
        return get().entities[id];
      },
      
      clear: () => {
        set((state) => {
          state.entities = {};
        });
      },
    }))
  );
}