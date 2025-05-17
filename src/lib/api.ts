
import { toast } from 'sonner';

interface CompanyData {
  taxId: string;
  company: {
    name: string;
  };
  phones?: {
    areacode: string;
    number: string;
  }[];
  emails?: string[];
}

export const fetchCnpjData = async (cnpj: string): Promise<CompanyData | null> => {
  if (!cnpj || cnpj.length < 8) {
    toast.error('CNPJ inválido');
    return null;
  }

  // Remover caracteres especiais do CNPJ
  const cleanCnpj = cnpj.replace(/[^\d]/g, '');
  
  try {
    const apiKey = 'e1d73329-4463-4969-8f0d-a878a97c4ee7-d5d65ba2-8a49-46c3-9e68-ec9e2e4ff557';
    const response = await fetch(`https://api.cnpja.com/office/${cleanCnpj}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na consulta CNPJ:', errorData);
      toast.error(`Erro na consulta: ${errorData.message || 'Não foi possível consultar o CNPJ'}`);
      return null;
    }

    const data = await response.json();
    return data as CompanyData;
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error);
    toast.error('Não foi possível consultar o CNPJ. Verifique sua conexão.');
    return null;
  }
};
