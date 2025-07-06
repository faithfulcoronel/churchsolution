import { usePermissions } from '../hooks/usePermissions';
import { useFeatures } from '../hooks/useFeatures';

export function hasAccess(permissionKey: string, featureKey: string): boolean {
  const { hasPermission } = usePermissions();
  const { isEnabled } = useFeatures();

  const permissionAllowed = permissionKey ? hasPermission(permissionKey) : true;
  const featureAllowed = featureKey ? isEnabled(featureKey) : true;

  return permissionAllowed && featureAllowed;
}
