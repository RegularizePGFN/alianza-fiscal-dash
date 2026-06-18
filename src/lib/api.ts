
import { toast } from 'sonner';
import { CompanyData } from './types/proposals';

// Mapeia resposta da BrasilAPI pro formato CompanyData (mesmo shape do CNPJÁ)
const mapBrasilApiToCompanyData = (b: any): CompanyData => {
  const phones = b.ddd_telefone_1
    ? [{
        area: String(b.ddd_telefone_1).slice(0, 2),
        number: String(b.ddd_telefone_1).slice(2),
      }]
    : [];

  return {
    taxId: b.cnpj,
    company: {
      name: b.razao_social ?? '',
      equity: b.capital_social ?? undefined,
      nature: b.codigo_natureza_juridica
        ? { id: b.codigo_natureza_juridica, text: b.natureza_juridica ?? '' }
        : undefined,
      size: b.codigo_porte
        ? { id: b.codigo_porte, acronym: '', text: b.porte ?? '' }
        : undefined,
    },
    alias: b.nome_fantasia || null,
    founded: b.data_inicio_atividade ?? undefined,
    status: b.situacao_cadastral
      ? { id: b.situacao_cadastral, text: b.descricao_situacao_cadastral ?? '' }
      : undefined,
    statusDate: b.data_situacao_cadastral ?? undefined,
    address: {
      street: [b.descricao_tipo_de_logradouro, b.logradouro].filter(Boolean).join(' ').trim(),
      number: b.numero ?? '',
      details: b.complemento || null,
      district: b.bairro ?? '',
      city: b.municipio ?? '',
      state: b.uf ?? '',
      zip: b.cep ?? '',
      municipality: b.codigo_municipio_ibge ?? undefined,
    },
    phones,
    emails: b.email ? [{ address: b.email }] : [],
    mainActivity: b.cnae_fiscal
      ? { id: b.cnae_fiscal, text: b.cnae_fiscal_descricao ?? '' }
      : undefined,
    sideActivities: Array.isArray(b.cnaes_secundarios)
      ? b.cnaes_secundarios
          .filter((c: any) => c && c.codigo)
          .map((c: any) => ({ id: c.codigo, text: c.descricao ?? '' }))
      : [],
  };
};

const fetchFromCnpja = async (cleanCnpj: string): Promise<CompanyData> => {
  const apiKey = 'e1d73329-4463-4969-8f0d-a878a97c4ee7-d5d65ba2-8a49-46c3-9e68-ec9e2e4ff557';
  const response = await fetch(`https://api.cnpja.com/office/${cleanCnpj}`, {
    method: 'GET',
    headers: { 'Authorization': apiKey },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `CNPJÁ HTTP ${response.status}`);
  }
  return (await response.json()) as CompanyData;
};

const fetchFromBrasilApi = async (cleanCnpj: string): Promise<CompanyData> => {
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
  if (!response.ok) {
    throw new Error(`BrasilAPI HTTP ${response.status}`);
  }
  return mapBrasilApiToCompanyData(await response.json());
};

export const fetchCnpjData = async (cnpj: string): Promise<CompanyData | null> => {
  if (!cnpj || cnpj.length < 8) {
    toast.error('CNPJ inválido');
    return null;
  }

  const cleanCnpj = cnpj.replace(/[^\d]/g, '');

  try {
    return await fetchFromCnpja(cleanCnpj);
  } catch (cnpjaError) {
    console.warn('CNPJÁ falhou, tentando BrasilAPI:', cnpjaError);
    try {
      return await fetchFromBrasilApi(cleanCnpj);
    } catch (brasilApiError) {
      console.error('BrasilAPI também falhou:', brasilApiError);
      toast.error('Não foi possível consultar o CNPJ. Tente novamente em alguns instantes.');
      return null;
    }
  }
};
