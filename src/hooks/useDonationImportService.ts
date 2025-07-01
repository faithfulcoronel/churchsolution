import { useMutation } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import { DonationImportService, DonationImportRow } from '../services/DonationImportService';
import { NotificationService } from '../services/NotificationService';

export function useDonationImportService() {
  const service = container.get<DonationImportService>(TYPES.DonationImportService);

  const mutation = useMutation({
    mutationFn: (rows: DonationImportRow[]) => service.import(rows),
    onSuccess: () => {
      NotificationService.showSuccess('Donations imported successfully');
    },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    },
  });

  const importDonations = async (rows: DonationImportRow[]) => mutation.mutateAsync(rows);

  return { importDonations, mutation };
}
