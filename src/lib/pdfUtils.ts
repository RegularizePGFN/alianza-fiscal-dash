import { supabase } from '@/integrations/supabase/client';
import { ExtractedData } from './types/proposals';

// Helper function to format dates as dd/mm/yyyy
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

/**
 * Generate a proposal PDF using Puppeteer via edge function and store in MinIO
 */
export async function generateProposalPdf(
  proposalData: Partial<ExtractedData>, 
  accessToken?: string
): Promise<string> {
  try {
    // Get seller name for filename
    const seller = proposalData.sellerName ? 
      proposalData.sellerName.replace(/[^\w]/g, '_').toLowerCase() : 'vendedor';
    
    // Create file name
    const fileName = `proposta_pgfn_${proposalData.cnpj?.replace(/\D/g, '') || 'cliente'}_${seller}_${Date.now()}.pdf`;
    
    // Get the current origin to build the print URL
    const origin = window.location.origin;
    const printUrl = `${origin}/propostas/print/${proposalData.cnpj || 'preview'}`;
    
    // Call the edge function to render the PDF
    const { data, error } = await supabase.functions.invoke('render-pdf', {
      body: {
        url: printUrl,
        format: 'pdf',
        fileName,
        accessToken: accessToken || (supabase.auth.getSession && (await supabase.auth.getSession())?.data?.session?.access_token)
      }
    });

    if (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }

    if (!data?.url) {
      throw new Error('PDF generation failed: No URL returned');
    }

    return data.url;
  } catch (error) {
    console.error('Error in generateProposalPdf:', error);
    throw error;
  }
}

/**
 * Generate a proposal PNG using Puppeteer via edge function and store in MinIO
 */
export async function generateProposalPng(
  proposalData: Partial<ExtractedData>,
  accessToken?: string
): Promise<string> {
  try {
    // Get seller name for filename
    const seller = proposalData.sellerName ? 
      proposalData.sellerName.replace(/[^\w]/g, '_').toLowerCase() : 'vendedor';
    
    // Create file name
    const fileName = `proposta_pgfn_${proposalData.cnpj?.replace(/\D/g, '') || 'cliente'}_${seller}_${Date.now()}.png`;
    
    // Get the current origin to build the print URL
    const origin = window.location.origin;
    const printUrl = `${origin}/propostas/print/${proposalData.cnpj || 'preview'}`;
    
    // Call the edge function to render the PNG
    const { data, error } = await supabase.functions.invoke('render-pdf', {
      body: {
        url: printUrl,
        format: 'png',
        fileName,
        accessToken: accessToken || (supabase.auth.getSession && (await supabase.auth.getSession())?.data?.session?.access_token)
      }
    });

    if (error) {
      console.error('Error generating PNG:', error);
      throw new Error(`Failed to generate PNG: ${error.message}`);
    }

    if (!data?.url) {
      throw new Error('PNG generation failed: No URL returned');
    }

    return data.url;
  } catch (error) {
    console.error('Error in generateProposalPng:', error);
    throw error;
  }
}

// Keep the download functions for backward compatibility
export async function downloadProposalPdf(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `proposta-pgfn-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

export async function downloadProposalPng(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `proposta-pgfn-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading PNG:', error);
    throw error;
  }
}
