import React from 'react';
import MemberCardItem, { MemberCardItemData } from './MemberCardItem';

export interface DirectoryMember extends MemberCardItemData {
  address: string | null;
}

interface DirectoryMemberItemProps {
  member: DirectoryMember;
}

export function DirectoryMemberItem({ member }: DirectoryMemberItemProps) {
  return <MemberCardItem member={member} showAddress />;
}

export default DirectoryMemberItem;
