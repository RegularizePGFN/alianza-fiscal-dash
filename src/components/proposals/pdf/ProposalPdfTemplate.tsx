import React from 'react';
import { ExtractedData, CompanyData } from '@/lib/types/proposals';
import { calculateEconomy } from '@/lib/pdf/utils';
import { getLastBusinessDayOfMonth, formatDateBR } from '@/hooks/proposals/useDatesHandling';

interface ProposalPdfTemplateProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  showWatermark?: boolean;
}

const fmtMoney = (value?: string) => {
  if (!value) return 'R$ 0,00';
  if (value.includes('R$')) return value;
  return `R$ ${value}`;
};

const formatCnpj = (cnpj?: string) => {
  if (!cnpj) return '-';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

/**
 * Template dedicado para geração de PDF.
 * Largura fixa A4 @ 96dpi (794px). Renderizado fora da tela e capturado pelo html2canvas.
 */
const ProposalPdfTemplate = React.forwardRef<HTMLDivElement, ProposalPdfTemplateProps>(
  ({ data, companyData, showWatermark = true }, ref) => {
    const hasDiscount = (() => {
      if (!data.totalDebt || !data.discountedValue) return false;
      try {
        const td = parseFloat(data.totalDebt.replace(/\./g, '').replace(',', '.'));
        const dv = parseFloat(data.discountedValue.replace(/\./g, '').replace(',', '.'));
        return td > dv && data.discountPercentage !== '0' && data.discountPercentage !== '0,00';
      } catch {
        return false;
      }
    })();

    const economy = calculateEconomy(data.totalDebt, data.discountedValue);
    const today = new Date();
    const dueDate = formatDateBR(getLastBusinessDayOfMonth(today));
    const issueDate = formatDateBR(today);

    const entryInstallments = parseInt(data.entryInstallments || '1', 10) || 1;
    const installmentsCount = parseInt(data.installments || '0', 10) || 0;

    const entryInstallmentValue = (() => {
      if (!data.entryValue) return '0,00';
      if (entryInstallments <= 1) return data.entryValue;
      try {
        const v = parseFloat(data.entryValue.replace(/\./g, '').replace(',', '.'));
        return (v / entryInstallments).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } catch {
        return data.entryValue;
      }
    })();

    const showFeesInstallments =
      data.showFeesInstallments === 'true' &&
      data.feesInstallmentValue &&
      data.feesInstallments &&
      parseInt(data.feesInstallments) > 0;

    const formatAddr = (addr?: CompanyData['address']) => {
      if (!addr) return '';
      return [
        addr.street,
        addr.number ? `Nº ${addr.number}` : '',
        addr.details || '',
        addr.district,
        addr.city && addr.state ? `${addr.city}/${addr.state}` : '',
        addr.zip ? `CEP: ${addr.zip}` : '',
      ]
        .filter(Boolean)
        .join(', ');
    };

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          color: '#0f172a',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Marca d'água */}
        {showWatermark && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <span
              style={{
                fontSize: '120px',
                fontWeight: 800,
                color: '#0f172a',
                opacity: 0.03,
                transform: 'rotate(-30deg)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
              }}
            >
              ALIANÇA FISCAL
            </span>
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* HEADER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0b1d3a 0%, #14305c 100%)',
              color: '#ffffff',
              padding: '28px 36px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #d4c5a0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src="/lovable-uploads/logo-alianca-fiscal.png"
                alt="Aliança Fiscal"
                style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.18em', fontWeight: 500, color: '#d4c5a0' }}>
                  ALIANÇA FISCAL • CONSULTORIA TRIBUTÁRIA
                </div>
                <div style={{ fontSize: '22px', fontWeight: 600, marginTop: '2px', letterSpacing: '-0.01em', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Proposta de Regularização PGFN
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: 1.5 }}>
              <div style={{ opacity: 0.8 }}>Emissão</div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>{issueDate}</div>
              <div style={{ opacity: 0.8, marginTop: '6px' }}>Validade</div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>{dueDate}</div>
            </div>
          </div>

          {/* BODY */}
          <div style={{ padding: '28px 36px 24px' }}>
            {/* DADOS DO CONTRIBUINTE */}
            <Section title="Dados do Contribuinte">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                <Field label="CNPJ" value={formatCnpj(data.cnpj)} />
                <Field label="Número do Débito" value={data.debtNumber || '-'} />
                {companyData?.company?.name && (
                  <Field label="Razão Social" value={companyData.company.name} full />
                )}
                {companyData?.status?.text && (
                  <Field label="Situação" value={companyData.status.text} />
                )}
                {companyData?.founded && (
                  <Field
                    label="Data de Abertura"
                    value={new Date(companyData.founded).toLocaleDateString('pt-BR')}
                  />
                )}
                {companyData?.address && (
                  <Field label="Endereço" value={formatAddr(companyData.address)} full />
                )}
                {companyData?.mainActivity && (
                  <Field
                    label="Atividade Principal"
                    value={`${companyData.mainActivity.id} • ${companyData.mainActivity.text}`}
                    full
                  />
                )}
              </div>
            </Section>

            {/* RESUMO DA NEGOCIAÇÃO */}
            {hasDiscount && (
              <Section title="Resumo da Negociação">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <SummaryCard
                    label="Valor Consolidado"
                    value={fmtMoney(data.totalDebt)}
                    tone="neutral"
                  />
                  <SummaryCard
                    label="Valor com Reduções"
                    value={fmtMoney(data.discountedValue)}
                    tone="primary"
                  />
                  <SummaryCard
                    label="Economia"
                    value={`R$ ${economy}`}
                    tone="success"
                    badge={`${data.discountPercentage}% off`}
                  />
                </div>
              </Section>
            )}

            {/* OPÇÕES DE PAGAMENTO */}
            <Section title="Opções de Pagamento">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                {/* À vista */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
                    À VISTA
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: '#0c9847',
                      marginTop: '8px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmtMoney(data.discountedValue)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    Pagamento em parcela única
                  </div>
                </div>

                {/* Parcelado */}
                <div
                  style={{
                    border: '1px solid #c1d7f7',
                    borderRadius: '10px',
                    padding: '16px',
                    background: '#f0f5fd',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#274697', fontWeight: 600, letterSpacing: '0.05em' }}>
                    PARCELADO
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>ENTRADA</div>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#1e293b',
                          marginTop: '2px',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {entryInstallments > 1
                          ? `${entryInstallments}x de R$ ${entryInstallmentValue}`
                          : `R$ ${data.entryValue || '0,00'}`}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        Total: {fmtMoney(data.entryValue)}
                      </div>
                    </div>
                    {installmentsCount > 0 && (
                      <div style={{ borderLeft: '1px solid #c1d7f7', paddingLeft: '14px' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                          PARCELAS RESTANTES
                        </div>
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginTop: '2px',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {installmentsCount}x de {fmtMoney(data.installmentValue)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: '#fef9c3',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#713f12',
                  lineHeight: 1.55,
                }}
              >
                <strong>Importante:</strong> a 1ª parcela da entrada deve ser paga até{' '}
                <strong>{dueDate}</strong> às 20h. Demais parcelas: último dia útil de cada mês.
              </div>
            </Section>

            {/* HONORÁRIOS */}
            {data.feesValue && (
              <Section title="Honorários">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: showFeesInstallments ? '1fr 1fr' : '1fr',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      borderRadius: '10px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                      border: '1px solid #ddd6fe',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#6b21a8',
                          letterSpacing: '0.05em',
                        }}
                      >
                        À VISTA
                      </div>
                      <div style={{ fontSize: '10px', color: '#7c3aed', marginTop: '2px' }}>
                        Pagamento imediato
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#581c87',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {fmtMoney(data.feesValue)}
                    </div>
                  </div>

                  {showFeesInstallments && (
                    <div
                      style={{
                        borderRadius: '10px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                        border: '1px solid #ddd6fe',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#6b21a8',
                          letterSpacing: '0.05em',
                        }}
                      >
                        PARCELADO
                      </div>
                      <div
                        style={{
                          fontSize: '17px',
                          fontWeight: 700,
                          color: '#581c87',
                          marginTop: '4px',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {data.feesInstallments}x de {fmtMoney(data.feesInstallmentValue)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#7c3aed', marginTop: '2px' }}>
                        Total: {fmtMoney(data.feesTotalInstallmentValue)}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* OBSERVAÇÕES */}
            {data.additionalComments && (
              <Section title="Observações">
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '12px',
                    color: '#334155',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {data.additionalComments}
                </div>
              </Section>
            )}

            {/* RODAPÉ - Especialista / Executivo */}
            {(data.includeExecutiveData === 'true' || data.sellerName || data.specialistName) && (
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '24px',
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '60%', lineHeight: 1.6 }}>
                  Esta proposta é confidencial e destina-se exclusivamente ao contribuinte
                  identificado. Os valores apresentados refletem a simulação realizada na data de
                  emissão e podem sofrer alterações conforme atualizações do PGFN.
                </div>
                {data.includeExecutiveData === 'true' && data.executiveName && (
                  <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.08em' }}>
                      ESPECIALISTA RESPONSÁVEL
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {data.executiveName}
                    </div>
                    {data.executiveEmail && <div>{data.executiveEmail}</div>}
                    {data.executivePhone && <div>{data.executivePhone}</div>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div
            style={{
              background: '#0f172a',
              color: '#cbd5e1',
              padding: '12px 36px',
              fontSize: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              letterSpacing: '0.04em',
            }}
          >
            <span>Aliança Fiscal • Consultoria Tributária</span>
            <span>Documento gerado em {issueDate}</span>
          </div>
        </div>
      </div>
    );
  }
);

ProposalPdfTemplate.displayName = 'ProposalPdfTemplate';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
    <div
      style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        color: '#1e3a8a',
        marginBottom: '10px',
        paddingBottom: '6px',
        borderBottom: '2px solid #1e3a8a',
        textTransform: 'uppercase',
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; value: string; full?: boolean }> = ({ label, value, full }) => (
  <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
      {label.toUpperCase()}
    </div>
    <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 500, marginTop: '2px' }}>
      {value || '-'}
    </div>
  </div>
);

const SummaryCard: React.FC<{
  label: string;
  value: string;
  tone: 'neutral' | 'primary' | 'success';
  badge?: string;
}> = ({ label, value, tone, badge }) => {
  const palettes = {
    neutral: { bg: '#f8fafc', border: '#e2e8f0', text: '#0f172a', label: '#64748b' },
    primary: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', label: '#3b82f6' },
    success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', label: '#0c9847' },
  } as const;
  const p = palettes[tone];
  return (
    <div
      style={{
        background: p.bg,
        border: `1px solid ${p.border}`,
        borderRadius: '10px',
        padding: '14px',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: p.label,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: p.text,
          marginTop: '6px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: '7px',
            right: '8px',
            fontSize: '9px',
            fontWeight: 700,
            background: p.text,
            color: '#ffffff',
            padding: '0 9px',
            borderRadius: '999px',
            height: '18px',
            lineHeight: '18px',
            display: 'block',
            textAlign: 'center',
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

export default ProposalPdfTemplate;
