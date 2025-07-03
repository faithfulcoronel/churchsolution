import React from 'react';
import MemberCardItem, { MemberCardItemData } from './MemberCardItem';

export interface RecentMember extends MemberCardItemData {}

interface RecentMemberItemProps {
  member: RecentMember;
}

export function RecentMemberItem({ member }: RecentMemberItemProps) {
  return <MemberCardItem member={member} />;
}

export default RecentMemberItem;
