import React from 'react';
import { Card, CardContent } from '../ui2/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';

export interface DonationItem {
  id: string;
  transaction_date: string;
  amount: number;
  member?: {
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
  } | null;
  category?: {
    name: string;
  } | null;
}

interface Props {
  donation: DonationItem;
}

export default function RecentDonationItem({ donation }: Props) {
  const { currency } = useCurrencyStore();
  const name = donation.member
    ? `${donation.member.first_name} ${donation.member.last_name}`
    : 'Anonymous';

  return (
    <Card size="sm" hoverable className="dark:bg-gray-600">
      <CardContent className="flex justify-between items-center gap-4 py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar size="md">
            {donation.member?.profile_picture_url && (
              <AvatarImage
                src={donation.member.profile_picture_url}
                alt={name}
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 font-semibold">
              {donation.member
                ? `${donation.member.first_name.charAt(0)}${donation.member.last_name.charAt(0)}`
                : '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">
              {donation.category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground">
            {formatCurrency(donation.amount, currency)}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(donation.transaction_date).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
