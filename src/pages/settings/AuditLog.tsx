import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Calendar,
  Filter,
  Search,
  Loader2,
  History,
  FileText,
  Users,
  Settings,
  Database,
  DollarSign,
} from 'lucide-react';

type AuditLogEntry = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  created_at: string;
  performed_by: string;
  user: {
    email: string;
    raw_user_meta_data: {
      first_name?: string;
      last_name?: string;
    };
  };
};

function AuditLog() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', dateRange, actionFilter, entityFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:performed_by (
            email,
            raw_user_meta_data
          )
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false });

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });

  const filteredLogs = auditLogs?.filter(log => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entity_type.toLowerCase().includes(searchLower) ||
      log.entity_id.toLowerCase().includes(searchLower) ||
      log.user?.email.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.changes).toLowerCase().includes(searchLower)
    );
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <History className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'member':
        return <Users className="h-4 w-4 text-primary-500" />;
      case 'transaction':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'budget':
        return <Database className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatEntityType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatChanges = (changes: Record<string, any>) => {
    return (
      <div className="space-y-1">
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-medium">{key}:</span>{' '}
            <span className="text-gray-600">{JSON.stringify(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Audit Log</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Track all changes and activities in your church administration system.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="mt-1 flex space-x-2">
                <div className="relative rounded-md shadow-sm flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="relative rounded-md shadow-sm flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Entity Type</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Entities</option>
                  <option value="member">Members</option>
                  <option value="transaction">Transactions</option>
                  <option value="budget">Budgets</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log List */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className="ml-2 text-sm text-gray-900">
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getEntityIcon(log.entity_type)}
                        <span className="ml-2 text-sm text-gray-900">
                          {formatEntityType(log.entity_type)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {log.entity_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatChanges(log.changes)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.user?.raw_user_meta_data?.first_name
                        ? `${log.user.raw_user_meta_data.first_name} ${log.user.raw_user_meta_data.last_name}`
                        : log.user?.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || actionFilter !== 'all' || entityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No activities have been logged yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditLog;