import { useCallback } from 'react';
import { useNotificationRepository } from './useNotificationRepository';
import { useAuthStore } from '../stores/authStore';
import { useSnackbar, VariantType } from 'notistack';

export function useNotifications() {
  const { user } = useAuthStore();
  const { useCreate } = useNotificationRepository();
  const createNotification = useCreate();
  const { enqueueSnackbar } = useSnackbar();

  const notify = useCallback(async ({
    title,
    message,
    type = 'info',
    actionUrl,
    actionText,
    metadata,
    expiresAt,
    showSnackbar = true,
    snackbarDuration = 5000,
  }: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    actionUrl?: string;
    actionText?: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
    showSnackbar?: boolean;
    snackbarDuration?: number;
  }) => {
    if (!user) return;

    try {
      // Create persistent notification in database
      await createNotification.mutateAsync({
        data: {
          user_id: user.id,
          title,
          message,
          type,
          action_url: actionUrl,
          action_text: actionText,
          metadata,
          expires_at: expiresAt?.toISOString(),
          read: false
        }
      });

      // Show snackbar if requested
      if (showSnackbar) {
        enqueueSnackbar(message, {
          variant: type as VariantType,
          autoHideDuration: snackbarDuration,
          action: actionUrl ? () => {
            window.location.href = actionUrl;
          } : undefined
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      
      // Show error snackbar
      enqueueSnackbar('Failed to create notification', {
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  }, [user, createNotification, enqueueSnackbar]);

  const notifyError = useCallback(async (error: Error | string, metadata?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    // Create error notification
    await notify({
      title: 'Error',
      message: errorMessage,
      type: 'error',
      metadata: {
        ...metadata,
        stack: errorStack,
      },
      showSnackbar: true,
      snackbarDuration: 8000 // Show errors longer
    });
  }, [notify]);

  const notifySuccess = useCallback((message: string, duration = 3000) => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: duration
    });
  }, [enqueueSnackbar]);

  const notifyWarning = useCallback((message: string, duration = 5000) => {
    enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: duration
    });
  }, [enqueueSnackbar]);

  const notifyInfo = useCallback((message: string, duration = 3000) => {
    enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: duration
    });
  }, [enqueueSnackbar]);

  return {
    notify,
    notifyError,
    notifySuccess,
    notifyWarning,
    notifyInfo
  };
}