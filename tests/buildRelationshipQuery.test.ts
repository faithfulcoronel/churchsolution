import { describe, it, expect } from 'vitest';
import { BaseAdapter, QueryOptions } from '../src/adapters/base.adapter';

class TestAdapter extends BaseAdapter<any> {
  public runBuildRelationshipQuery(rel: QueryOptions['relationships'] = []) {
    return this.buildRelationshipQuery(rel);
  }
}

describe('buildRelationshipQuery', () => {
  it('handles nested relationship objects', () => {
    const adapter = new TestAdapter();
    const query = adapter.runBuildRelationshipQuery([
      {
        table: 'role_permissions',
        foreignKey: 'role_id',
        nestedRelationships: [
          {
            table: 'permissions',
            foreignKey: 'permission_id',
            select: ['id', 'code']
          }
        ]
      }
    ]);
    expect(query).toBe('role_permissions!role_id(*,permissions!permission_id(id,code))');
  });

  it('handles nested relationship strings', () => {
    const adapter = new TestAdapter();
    const query = adapter.runBuildRelationshipQuery([
      {
        table: 'role_permissions',
        foreignKey: 'role_id',
        nestedRelationships: ['permissions']
      }
    ]);
    expect(query).toBe('role_permissions!role_id(*,permissions!id(*))');
  });
});
