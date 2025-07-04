import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { SettingService } from '../services/SettingService';

export type Currency = {
  code: 'USD' | 'PHP' | 'MYR';
  symbol: string;
};

export const currencies: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$' },
  PHP: { code: 'PHP', symbol: '₱' },
  MYR: { code: 'MYR', symbol: 'RM' },
};

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const settingService = container.get<SettingService>(TYPES.SettingService);

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: currencies.USD,
      setCurrency: (currency) => {
        set({ currency });
        settingService.setTenantCurrency(currency.code).catch(() => {});
      },
    }),
    {
      name: 'currency-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currency: state.currency }),
      onRehydrateStorage: () => (state) => {
        if (state?.currency && !currencies[state.currency.code]) {
          state.currency = currencies.USD;
        }
        settingService.getTenantCurrency().then(code => {
          if (code && currencies[code]) {
            useCurrencyStore.setState({ currency: currencies[code] });
          }
        }).catch(() => {});
      },
    }
  )
);