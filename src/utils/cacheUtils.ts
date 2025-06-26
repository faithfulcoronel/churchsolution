import { queryClient } from '../lib/queryClient';
import { tenantUtils } from './tenantUtils';
import { categoryUtils } from './categoryUtils';

export function clearAppCaches(): void {
  queryClient.clear();
  tenantUtils.clearCache();
  categoryUtils.clearCache();
}
