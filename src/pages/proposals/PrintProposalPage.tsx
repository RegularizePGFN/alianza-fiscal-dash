
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { ProposalPages } from '@/components/proposals/card';
import { fetchCnpjData } from "@/lib/api";
import { supabase } from '@/integrations/supabase/client';

const PrintProposalPage = () => {
  const { id } = useParams<{ id: string }>();
  const [proposalData, setProposalData] = useState<Partial<ExtractedData>>({});
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // If ID is 'preview', we're in preview mode (no data fetching)
        if (id === 'preview') {
          // Get data from sessionStorage for preview
          const storedData = sessionStorage.getItem('proposalPrintData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setProposalData(parsedData);
            
            // If we have CNPJ, fetch company data
            if (parsedData.cnpj) {
              try {
                const compData = await fetchCnpjData(parsedData.cnpj);
                if (compData) {
                  setCompanyData(compData);
                }
              } catch (err) {
                console.error("Error fetching company data:", err);
              }
            }
          }
        } else {
          // Fetch actual proposal data by ID
          const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) {
            console.error('Error fetching proposal:', error);
            return;
          }
          
          // Format proposal data to match ExtractedData structure
          if (data) {
            const formattedData: Partial<ExtractedData> = {
              cnpj: data.cnpj,
              totalDebt: data.total_debt?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
              discountedValue: data.discounted_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
              discountPercentage: data.discount_percentage?.toString().replace('.', ',') || '0',
              entryValue: data.entry_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
              entryInstallments: data.entry_installments?.toString() || '1',
              installments: data.installments?.toString() || '0',
              installmentValue: data.installment_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
              debtNumber: data.debt_number || '',
              feesValue: data.fees_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
              clientName: data.client_name,
              clientEmail: data.client_email,
              clientPhone: data.client_phone,
              businessActivity: data.business_activity,
              creationDate: new Date(data.creation_date).toLocaleDateString('pt-BR'),
              validityDate: new Date(data.validity_date).toLocaleDateString('pt-BR'),
            };
            
            setProposalData(formattedData);
            
            // Fetch company data
            if (data.cnpj) {
              try {
                const compData = await fetchCnpjData(data.cnpj);
                if (compData) {
                  setCompanyData(compData);
                }
              } catch (err) {
                console.error("Error fetching company data:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error in data fetching:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <ProposalPages 
        data={proposalData}
        companyData={companyData}
      />
    </div>
  );
};

export default PrintProposalPage;
