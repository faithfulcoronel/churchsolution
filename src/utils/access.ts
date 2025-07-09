import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useFeatures } from '../hooks/useFeatures';

export function computeAccess(
  hasPermission: (key: string) => boolean,
  isEnabled: (key: string) => boolean,
  permissionKey: string,
  featureKey: string,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;

  const permissionAllowed = permissionKey ? hasPermission(permissionKey) : true;
  const featureAllowed = featureKey ? isEnabled(featureKey) : true;

  return permissionAllowed && featureAllowed;
}

export function useAccess() {
  const { hasPermission, isAdmin } = usePermissions();
  const { isEnabled } = useFeatures();

  const hasAccess = React.useCallback(
    (permissionKey: string, featureKey: string) =>
      computeAccess(hasPermission, isEnabled, permissionKey, featureKey, isAdmin()),
    [hasPermission, isEnabled, isAdmin]
  );

  return { hasAccess };
}
