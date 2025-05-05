import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CheckboxItemProps {
  id: string;
  label: string;
  value: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const CheckboxItem: React.FC<CheckboxItemProps> = ({
  id,
  label,
  value,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={id} 
        value={value}
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
};

interface CheckboxGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {children}
    </div>
  );
};