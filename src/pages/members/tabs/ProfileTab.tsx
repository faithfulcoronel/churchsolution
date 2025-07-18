import React from 'react';
import { Member } from '../../../models/member.model';
import BasicInfoTab from './BasicInfoTab';
import MinistryInfoTab from './MinistryInfoTab';
import NotesTab from './NotesTab';

interface ProfileTabProps {
  member: Partial<Member>;
  onChange: (field: string, value: any) => void;
  mode?: 'view' | 'edit' | 'add';
}

function ProfileTab({ member, onChange, mode = 'view' }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <BasicInfoTab member={member} onChange={onChange} mode={mode} />
      <MinistryInfoTab member={member} onChange={onChange} mode={mode} />
      <NotesTab member={member} onChange={onChange} mode={mode} />
    </div>
  );
}

export default ProfileTab;
