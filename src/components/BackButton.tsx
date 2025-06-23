import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui2/button';

export interface BackButtonProps {
  label: string;
  fallbackPath?: string;
}

export function performGoBack(
  navigate: (to: any) => void,
  fallbackPath: string = '/'
) {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallbackPath);
  }
}

export default function BackButton({ label, fallbackPath = '/' }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      onClick={() => performGoBack(navigate, fallbackPath)}
      className="flex items-center"
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      {label}
    </Button>
  );
}
