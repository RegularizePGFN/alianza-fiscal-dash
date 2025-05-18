
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/lib/types';

interface SelectSpecialistProps {
  users: User[];
  selectedSpecialist: string;
  onChange: (specialist: string) => void;
  isAdmin: boolean;
}

const SelectSpecialist = ({ 
  users, 
  selectedSpecialist,
  onChange,
  isAdmin = false
}: SelectSpecialistProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Especialista Tributário</h3>
      <p className="text-xs text-slate-500">
        {isAdmin 
          ? "Como administrador, você pode selecionar outro especialista." 
          : "Este especialista será exibido como responsável na proposta."}
      </p>
      
      <Select 
        value={selectedSpecialist} 
        onValueChange={onChange}
        disabled={!isAdmin}
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
    </div>
  );
};

export default SelectSpecialist;
