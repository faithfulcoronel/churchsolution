import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { hasAccess } from '../utils/access';

type PermissionGateProps = {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

function PermissionGate({ permission, role, children, fallback = null }: PermissionGateProps) {
  const { hasRole, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  const allowed =
    (permission ? hasAccess(permission, permission) : true) &&
    (role ? hasRole(role) : true);

  return allowed ? <>{children}</> : <>{fallback}</>;
}

export default PermissionGate;