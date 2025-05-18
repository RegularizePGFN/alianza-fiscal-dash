
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/lib/types';

interface SelectSpecialistProps {
  users: User[];
  selectedSpecialist: string;
  onChange: (specialist: string) => void;
}

export const SelectSpecialist = ({ 
  users, 
  selectedSpecialist,
  onChange 
}: SelectSpecialistProps) => {
  return (
    <div className="space-y-2">
      <Select 
        value={selectedSpecialist} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um Especialista" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.name}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <p className="text-xs text-slate-500">
        Este especialista será exibido como responsável na proposta.
      </p>
    </div>
  );
};
