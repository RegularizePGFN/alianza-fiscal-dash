
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, Mail, User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SellerInfoFieldsProps {
  value: {
    sellerName: string;
    sellerPhone: string;
    sellerEmail: string;
  };
  onChange: (field: string, value: string) => void;
}

const SellerInfoFields = ({ value, onChange }: SellerInfoFieldsProps) => {
  const { toast } = useToast();
  const [sellerInfo, setSellerInfo] = useState({
    sellerName: value.sellerName || '',
    sellerPhone: value.sellerPhone || '',
    sellerEmail: value.sellerEmail || '',
  });

  // Load saved seller info from local storage on component mount
  useEffect(() => {
    const savedSellerInfo = localStorage.getItem('sellerInfo');
    if (savedSellerInfo) {
      try {
        const parsedInfo = JSON.parse(savedSellerInfo);
        setSellerInfo(prev => ({ 
          ...prev, 
          ...parsedInfo 
        }));
        
        // Update parent component with saved values
        Object.entries(parsedInfo).forEach(([key, value]) => {
          onChange(key, value as string);
        });
      } catch (error) {
        console.error('Error loading saved seller info:', error);
      }
    }
  }, []);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSellerInfo(prev => ({
      ...prev,
      [field]: newValue
    }));
    onChange(field, newValue);
  };

  const handleSaveInfo = () => {
    try {
      localStorage.setItem('sellerInfo', JSON.stringify(sellerInfo));
      toast({
        title: "Informações salvas",
        description: "Os dados do vendedor foram salvos para uso futuro.",
      });
    } catch (error) {
      console.error('Error saving seller info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações do vendedor.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Informações do Vendedor</h3>
      <p className="text-xs text-slate-500">
        Estas informações serão exibidas na assinatura da proposta.
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-500" />
          <Input
            placeholder="Nome do Vendedor"
            value={sellerInfo.sellerName}
            onChange={handleInputChange('sellerName')}
            className="flex-1"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-slate-500" />
          <Input
            placeholder="Telefone do Vendedor"
            value={sellerInfo.sellerPhone}
            onChange={handleInputChange('sellerPhone')}
            className="flex-1"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-500" />
          <Input
            placeholder="Email do Vendedor"
            value={sellerInfo.sellerEmail}
            onChange={handleInputChange('sellerEmail')}
            className="flex-1"
          />
        </div>

        <Button 
          onClick={handleSaveInfo}
          variant="outline" 
          className="w-full mt-2"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar para Próximas Propostas
        </Button>
      </div>
    </div>
  );
};

export default SellerInfoFields;
