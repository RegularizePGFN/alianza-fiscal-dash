
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, Search } from "lucide-react";
import { ExtractedData, CompanyData } from '@/lib/types/proposals';
import { fetchCnpjData } from '@/lib/api';

interface DataFormProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
}

const DataForm = ({ formData, processing, onInputChange, onGenerateProposal }: DataFormProps) => {
  const [isSearchingCnpj, setIsSearchingCnpj] = useState<boolean>(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  
  // Auto-search CNPJ when the component loads and CNPJ is available
  useEffect(() => {
    if (formData.cnpj && !companyData && !isSearchingCnpj) {
      handleSearchCnpj();
    }
  }, [formData.cnpj]);
  
  const handleSearchCnpj = async () => {
    if (!formData.cnpj) return;
    
    setIsSearchingCnpj(true);
    
    try {
      const result = await fetchCnpjData(formData.cnpj);
      
      if (result) {
        setCompanyData(result);
        
        // Update form data with company information
        if (result.company?.name) {
          const event = {
            target: {
              name: 'clientName',
              value: result.company.name
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(event);
        }
        
        // If there's an email, use the first one
        if (result.emails && result.emails.length > 0) {
          const emailEvent = {
            target: {
              name: 'clientEmail',
              value: result.emails[0].address
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(emailEvent);
        }
        
        // If there's a phone, use the first one
        if (result.phones && result.phones.length > 0) {
          const phone = result.phones[0];
          const phoneEvent = {
            target: {
              name: 'clientPhone',
              value: `${phone.area}${phone.number}`
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(phoneEvent);
        }
        
        // If there's business activity, use the first side activity or main activity
        if (result.sideActivities && result.sideActivities.length > 0) {
          const activity = result.sideActivities[0];
          const activityEvent = {
            target: {
              name: 'businessActivity',
              value: `${activity.id} | ${activity.text}`
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(activityEvent);
        } else if (result.mainActivity) {
          const activityEvent = {
            target: {
              name: 'businessActivity',
              value: `${result.mainActivity.id} | ${result.mainActivity.text}`
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(activityEvent);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do CNPJ:", error);
    } finally {
      setIsSearchingCnpj(false);
    }
  };
  
  const formatAddress = (address?: CompanyData['address']): string => {
    if (!address) return "";
    
    const parts = [
      address.street,
      address.number ? `Nº ${address.number}` : "",
      address.details || "",
      address.district ? `${address.district}` : "",
      address.city && address.state ? `${address.city}/${address.state}` : "",
      address.zip ? `CEP: ${address.zip}` : ""
    ];
    
    return parts.filter(part => part).join(", ");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Dados da Proposta</CardTitle>
      </CardHeader>
      <CardContent>
        {processing ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Processando dados com IA...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {companyData && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded">
                <h3 className="font-medium text-base mb-3 text-af-blue-800 border-b pb-2">Dados do CNPJ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-af-blue-700">CNPJ:</p>
                    <p>{companyData.taxId}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-af-blue-700">Nome/Razão Social:</p>
                    <p>{companyData.company?.name}</p>
                  </div>
                  
                  {companyData.status && (
                    <div>
                      <p className="font-medium text-af-blue-700">Situação:</p>
                      <p className={`${companyData.status.text === "Ativa" ? "text-green-600 font-medium" : "text-red-600"}`}>
                        {companyData.status.text}
                      </p>
                    </div>
                  )}
                  
                  {companyData.founded && (
                    <div>
                      <p className="font-medium text-af-blue-700">Data de Abertura:</p>
                      <p>{new Date(companyData.founded).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  
                  {companyData.company?.nature && (
                    <div>
                      <p className="font-medium text-af-blue-700">Natureza Jurídica:</p>
                      <p>{companyData.company.nature.text}</p>
                    </div>
                  )}
                  
                  {companyData.company?.size && (
                    <div>
                      <p className="font-medium text-af-blue-700">Porte:</p>
                      <p>{companyData.company.size.text} ({companyData.company.size.acronym})</p>
                    </div>
                  )}
                  
                  {companyData.company?.equity !== undefined && (
                    <div>
                      <p className="font-medium text-af-blue-700">Capital Social:</p>
                      <p>R$ {companyData.company.equity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                  
                  {companyData.address && (
                    <div className="col-span-2">
                      <p className="font-medium text-af-blue-700">Endereço:</p>
                      <p>{formatAddress(companyData.address)}</p>
                    </div>
                  )}
                  
                  {companyData.phones && companyData.phones.length > 0 && (
                    <div>
                      <p className="font-medium text-af-blue-700">Telefones:</p>
                      <ul>
                        {companyData.phones.map((phone, idx) => (
                          <li key={idx}>({phone.area}) {phone.number} {phone.type ? `(${phone.type})` : ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {companyData.emails && companyData.emails.length > 0 && (
                    <div>
                      <p className="font-medium text-af-blue-700">Emails:</p>
                      <ul>
                        {companyData.emails.map((email, idx) => (
                          <li key={idx}>{email.address}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {companyData.mainActivity && (
                    <div className="col-span-2">
                      <p className="font-medium text-af-blue-700">Atividade Principal:</p>
                      <p>{companyData.mainActivity.id} | {companyData.mainActivity.text}</p>
                    </div>
                  )}
                  
                  {companyData.sideActivities && companyData.sideActivities.length > 0 && (
                    <div className="col-span-2">
                      <p className="font-medium text-af-blue-700">Atividades Secundárias:</p>
                      <ul className="list-disc pl-5">
                        {companyData.sideActivities.map((activity, idx) => (
                          <li key={idx}>{activity.id} | {activity.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <div className="flex gap-2">
                  <Input 
                    id="cnpj" 
                    name="cnpj"
                    value={formData.cnpj || ''}
                    onChange={onInputChange}
                    placeholder="00.000.000/0000-00"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={!formData.cnpj || isSearchingCnpj}
                    onClick={handleSearchCnpj}
                  >
                    {isSearchingCnpj ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="debtNumber">Número do Débito</Label>
                <Input 
                  id="debtNumber" 
                  name="debtNumber"
                  value={formData.debtNumber || ''}
                  onChange={onInputChange}
                  placeholder="00 0 00 000000-00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientName">Nome/Razão Social</Label>
                <Input 
                  id="clientName" 
                  name="clientName"
                  value={formData.clientName || ''}
                  onChange={onInputChange}
                  placeholder="Nome da Empresa"
                  className={companyData ? "bg-slate-50" : ""}
                  readOnly={!!companyData}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="businessActivity">Ramo de Atividade</Label>
                <Input 
                  id="businessActivity" 
                  name="businessActivity"
                  value={formData.businessActivity || ''}
                  onChange={onInputChange}
                  placeholder="Código | Descrição da Atividade"
                  className={companyData ? "bg-slate-50" : ""}
                  readOnly={!!companyData}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input 
                  id="clientPhone" 
                  name="clientPhone"
                  value={formData.clientPhone || ''}
                  onChange={onInputChange}
                  placeholder="(00) 00000-0000"
                  className={companyData?.phones?.length ? "bg-slate-50" : ""}
                  readOnly={!!companyData?.phones?.length}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input 
                  id="clientEmail" 
                  name="clientEmail"
                  value={formData.clientEmail || ''}
                  onChange={onInputChange}
                  placeholder="email@exemplo.com"
                  className={companyData?.emails?.length ? "bg-slate-50" : ""}
                  readOnly={!!companyData?.emails?.length}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="totalDebt">Valor Consolidado (R$)</Label>
                <Input 
                  id="totalDebt" 
                  name="totalDebt"
                  value={formData.totalDebt || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discountedValue">Valor com Reduções (R$)</Label>
                <Input 
                  id="discountedValue" 
                  name="discountedValue"
                  value={formData.discountedValue || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discountPercentage">Percentual de Desconto (%)</Label>
                <Input 
                  id="discountPercentage" 
                  name="discountPercentage"
                  value={formData.discountPercentage || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="entryValue">Valor da Entrada (R$)</Label>
                <Input 
                  id="entryValue" 
                  name="entryValue"
                  value={formData.entryValue || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="entryInstallments">Número de Parcelas da Entrada</Label>
                <Input 
                  id="entryInstallments" 
                  name="entryInstallments"
                  value={formData.entryInstallments || '1'}
                  onChange={onInputChange}
                  placeholder="1"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input 
                  id="installments" 
                  name="installments"
                  value={formData.installments || ''}
                  onChange={onInputChange}
                  placeholder="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="installmentValue">Valor da Parcela (R$)</Label>
                <Input 
                  id="installmentValue" 
                  name="installmentValue"
                  value={formData.installmentValue || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="feesValue">Honorários (R$)</Label>
                <Input 
                  id="feesValue" 
                  name="feesValue"
                  value={formData.feesValue || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                  className="border-2 border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Este valor será destacado na proposta como honorários da Aliança Fiscal.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button onClick={onGenerateProposal} disabled={processing || !formData.cnpj} variant="default">
          <FileText className="mr-2 h-4 w-4" />
          Gerar Proposta
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataForm;
