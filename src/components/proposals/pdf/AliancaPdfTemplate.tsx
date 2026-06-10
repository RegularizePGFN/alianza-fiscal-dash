import React from 'react';
import { ExtractedData, CompanyData } from '@/lib/types/proposals';
import { calculateEconomy } from '@/lib/pdf/utils';
import { getLastBusinessDayOfMonth, formatDateBR } from '@/hooks/proposals/useDatesHandling';

interface AliancaPdfTemplateProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

const fmtMoney = (value?: string) => {
  if (!value) return 'R$ 0,00';
  if (value.includes('R$')) return value;
  return `R$ ${value}`;
};

const formatCnpj = (cnpj?: string) => {
  if (!cnpj) return '';
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const MONTHS_SHORT_PT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

const formatShortDay = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

const AliancaPdfTemplate = React.forwardRef<HTMLDivElement, AliancaPdfTemplateProps>(
  ({ data, companyData }, ref) => {
    const today = new Date();
    const issueDate = formatDateBR(today);
    const validityDateLabel = (() => {
      const v = data.validityDate;
      if (v) {
        const m = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (m) return `${m[1]}/${m[2]}/${m[3]}`;
        const iso = new Date(String(v));
        if (!isNaN(iso.getTime())) return formatDateBR(iso);
      }
      const fb = new Date(today);
      fb.setDate(fb.getDate() + 1);
      return formatDateBR(fb);
    })();

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
    const installmentsCount = parseInt(data.installments || '0', 10) || 0;
    const discountPctNum = Math.round(
      parseFloat(String(data.discountPercentage || '0').replace(',', '.')) || 0,
    );

    // Datas
    const month1 = today;
    const month2 = addMonths(today, 1);
    const month3 = addMonths(today, 2);
    const due1 = getLastBusinessDayOfMonth(month1);
    const due2 = getLastBusinessDayOfMonth(month2);
    const month1Name = MONTHS_PT[month1.getMonth()];
    const month2Name = MONTHS_PT[month2.getMonth()];
    const monthFromShort = `${MONTHS_SHORT_PT[month3.getMonth()]}/${String(month3.getFullYear()).slice(-2)}`;

    const clientName = (companyData?.company?.name || data.clientName || '').toUpperCase();
    const cnpj = formatCnpj(data.cnpj);

    const installmentValueLabel = fmtMoney(data.installmentValue);
    const totalDebtLabel = fmtMoney(data.totalDebt);
    const discountedLabel = fmtMoney(data.discountedValue);
    const feesValueLabel = fmtMoney(data.feesValue);

    const addressLine = (() => {
      const a = companyData?.address;
      if (!a) return '';
      const parts = [
        a.street + (a.number ? `, ${a.number}` : ''),
        a.district ? `— ${a.district}` : '',
        a.city && a.state ? `${a.city}/${a.state}` : '',
        a.zip ? `CEP ${a.zip}` : '',
      ].filter(Boolean);
      return parts.join(', ');
    })();

    const cadastrais = [
      companyData?.status?.text ? `Situação ${companyData.status.text}` : '',
      companyData?.founded
        ? `Abertura ${new Date(companyData.founded).toLocaleDateString('pt-BR')}`
        : '',
      companyData?.mainActivity
        ? `CNAE ${companyData.mainActivity.id} ${companyData.mainActivity.text.split(' ').slice(0, 3).join(' ')}`
        : '',
      addressLine,
      data.debtNumber ? `Débito ${data.debtNumber}` : 'Débito a confirmar',
    ].filter(Boolean).join(' · ');

    const exec = data.includeExecutiveData === 'true' ? {
      name: data.executiveName || '',
      email: data.executiveEmail || '',
    } : {
      name: data.specialistName || data.sellerName || '',
      email: data.sellerEmail || '',
    };

    // Colors
    const DARK = '#0b1d3a';
    const DARK2 = '#0f2548';
    const GREEN = '#22c55e';
    const GREEN_DARK = '#16a34a';
    const BLUE = '#3b82f6';
    const MUTED = '#64748b';
    const BORDER = '#e2e8f0';

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          minHeight: '1123px',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          color: '#0f172a',
          background: '#ffffff',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HEADER */}
        <div style={{ padding: '24px 40px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/lovable-uploads/logo-alianca-fiscal.png"
                alt="Aliança Fiscal"
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: DARK, letterSpacing: '0.04em' }}>
                  ALIANÇA FISCAL
                </div>
                <div style={{ fontSize: '9px', color: MUTED, letterSpacing: '0.18em' }}>
                  Consultoria Tributária
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: MUTED, letterSpacing: '0.18em', fontWeight: 600 }}>
                PROPOSTA DE
              </div>
              <div style={{ fontSize: '14px', color: DARK, fontWeight: 700, letterSpacing: '0.06em' }}>
                REGULARIZAÇÃO PGFN
              </div>
              <div style={{ fontSize: '9px', color: MUTED, marginTop: '4px' }}>
                Emissão <span style={{ color: DARK, fontWeight: 600 }}>{issueDate}</span>
                <span style={{ margin: '0 4px' }}>·</span>
                Validade <span style={{ color: DARK, fontWeight: 600 }}>{validityDateLabel}</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '14px', height: '4px', borderRadius: '2px', background: `linear-gradient(90deg, ${BLUE} 0%, ${GREEN} 100%)` }} />
        </div>

        {/* PROPOSTA PARA */}
        <div style={{ padding: '20px 40px 0', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.18em', color: MUTED, fontWeight: 600 }}>
            PROPOSTA PARA
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: DARK }}>{clientName}</span>
          <span style={{ fontSize: '10px', color: MUTED, marginLeft: 'auto' }}>
            CNPJ <span style={{ color: DARK, fontWeight: 600 }}>{cnpj}</span>
          </span>
        </div>

        {/* DESTAQUE */}
        <div style={{ padding: '14px 40px 0' }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${DARK} 0%, ${DARK2} 100%)`,
              borderRadius: '12px',
              padding: '22px 26px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Chip */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: hasDiscount ? GREEN : BLUE,
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '999px',
                letterSpacing: '0.04em',
              }}
            >
              {hasDiscount ? `−${discountPctNum}%` : 'SEM JUROS'}
            </div>

            <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              {hasDiscount ? 'SUA ECONOMIA' : 'SEU BENEFÍCIO'}
            </div>

            {hasDiscount ? (
              <>
                <div style={{ fontSize: '34px', fontWeight: 800, color: GREEN, marginTop: '4px', letterSpacing: '-0.01em' }}>
                  R$ {economy}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                  em reduções de juros e multas concedidas pela PGFN
                </div>
                <div
                  style={{
                    marginTop: '14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.85)',
                    display: 'inline-block',
                  }}
                >
                  Dívida original{' '}
                  <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{totalDebtLabel}</span>
                  {' → você regulariza por '}
                  <span style={{ color: GREEN, fontWeight: 700 }}>{discountedLabel}</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '4px', letterSpacing: '-0.01em' }}>
                  Parcelamento sem juros
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', maxWidth: '520px' }}>
                  Regularize sua dívida em até {installmentsCount}x sem nenhum acréscimo e suspenda as cobranças.
                </div>
                <div
                  style={{
                    marginTop: '14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.85)',
                    display: 'inline-block',
                  }}
                >
                  Valor da dívida mantido{' '}
                  <span style={{ color: '#fff', fontWeight: 700 }}>{totalDebtLabel}</span>
                  {' · '}
                  {installmentsCount}x de <span style={{ color: '#fff', fontWeight: 700 }}>{installmentValueLabel}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PLANEJAMENTO */}
        <div style={{ padding: '22px 40px 0' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: MUTED, fontWeight: 700 }}>
            SEU PLANEJAMENTO DE PAGAMENTOS
          </div>
          <div style={{ marginTop: '8px', borderTop: `1px solid ${BORDER}` }} />

          <div
            style={{
              marginTop: '14px',
              background: '#f8fafc',
              border: `1px solid ${BORDER}`,
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '11px',
              color: '#334155',
              lineHeight: 1.55,
            }}
          >
            Hoje você paga <span style={{ color: GREEN_DARK, fontWeight: 700 }}>apenas os honorários da Aliança Fiscal.</span>{' '}
            A parcela da negociação com a PGFN só vence no último dia útil do mês — e segue assim nos meses seguintes.
          </div>

          {/* Linhas da timeline */}
          <div style={{ marginTop: '10px' }}>
            {/* Linha 1 - HOJE (destaque) */}
            <TimelineRow
              when={`Hoje · ${formatShortDay(today)}`}
              whenSub=""
              dotColor={GREEN}
              filled
            >
              <div
                style={{
                  background: '#ecfdf5',
                  border: `1px solid #a7f3d0`,
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                }}
              >
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: GREEN_DARK, fontWeight: 700 }}>
                    PAGUE HOJE
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: DARK, marginTop: '2px' }}>
                    Honorários Aliança Fiscal
                  </div>
                  <div style={{ fontSize: '10px', color: MUTED, marginTop: '2px' }}>
                    Único valor para iniciar a regularização agora
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: GREEN_DARK }}>
                  {feesValueLabel}
                </div>
              </div>
            </TimelineRow>

            <TimelineRow
              when={formatDateBR(due1)}
              whenSub={`último dia útil de ${month1Name}`}
              dotColor={BLUE}
              label="1ª parcela da negociação (PGFN)"
              value={installmentValueLabel}
            />

            <TimelineRow
              when={formatDateBR(due2)}
              whenSub={`último dia útil de ${month2Name}`}
              dotColor={BLUE}
              label="2ª parcela da negociação"
              value={installmentValueLabel}
            />

            {installmentsCount > 2 && (
              <TimelineRow
                when={`a partir de ${monthFromShort}`}
                whenSub="sempre no último dia útil"
                dotColor={BLUE}
                label={`demais parcelas (3ª a ${installmentsCount}ª)`}
                value={installmentValueLabel}
                last
              />
            )}
          </div>
        </div>

        {/* OPÇÕES */}
        <div style={{ padding: '22px 40px 0' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: MUTED, fontWeight: 700 }}>
            OPÇÕES PARA A NEGOCIAÇÃO
          </div>
          <div style={{ marginTop: '8px', borderTop: `1px solid ${BORDER}` }} />

          <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 18px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: MUTED, fontWeight: 700 }}>
                À VISTA
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: hasDiscount ? GREEN_DARK : DARK, marginTop: '4px' }}>
                {hasDiscount ? discountedLabel : totalDebtLabel}
              </div>
              <div style={{ fontSize: '10px', color: MUTED, marginTop: '2px' }}>
                {hasDiscount ? 'Parcela única · desconto máximo aplicado' : 'Pagamento único da dívida'}
              </div>
            </div>
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 18px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: MUTED, fontWeight: 700 }}>
                PARCELADO · {installmentsCount}X SEM JUROS
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginTop: '4px' }}>
                {installmentValueLabel}
                <span style={{ fontSize: '12px', fontWeight: 600, color: MUTED }}>/mês</span>
              </div>
              <div style={{ fontSize: '10px', color: MUTED, marginTop: '2px' }}>
                Entrada R$ 0,00 · 1ª parcela no último dia útil do mês
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '20px 40px 0' }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${DARK} 0%, ${DARK2} 100%)`,
              borderRadius: '10px',
              padding: '16px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Pronto para regularizar?</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '2px', maxWidth: '420px' }}>
                Confirme esta proposta e pague hoje apenas os honorários. Cuidamos de toda a formalização da adesão na PGFN.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>Para iniciar hoje</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: GREEN }}>{feesValueLabel}</div>
            </div>
          </div>
        </div>

        {/* DADOS CADASTRAIS */}
        {cadastrais && (
          <div style={{ padding: '16px 40px 0', fontSize: '9px', color: MUTED, lineHeight: 1.55 }}>
            <span style={{ color: '#334155', fontWeight: 600 }}>Dados cadastrais:</span> {cadastrais}
          </div>
        )}

        {/* SPACER */}
        <div style={{ flex: 1 }} />

        {/* FOOTER */}
        <div style={{ padding: '16px 40px 22px', marginTop: '20px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: DARK }}>Aliança Fiscal</div>
              {exec.name && (
                <div style={{ fontSize: '10px', color: MUTED, marginTop: '2px' }}>
                  Especialista <span style={{ color: DARK, fontWeight: 600 }}>{exec.name}</span>
                  {exec.email ? ` · ${exec.email}` : ''}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: MUTED, lineHeight: 1.55 }}>
              <div>
                <span style={{ color: DARK, fontWeight: 600 }}>Documento confidencial</span> — exclusivo ao contribuinte identificado.
              </div>
              <div>
                Valores conforme simulação de {issueDate}, sujeitos a atualização da PGFN.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AliancaPdfTemplate.displayName = 'AliancaPdfTemplate';

interface TimelineRowProps {
  when: string;
  whenSub: string;
  dotColor: string;
  filled?: boolean;
  last?: boolean;
  label?: string;
  value?: string;
  children?: React.ReactNode;
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  when, whenSub, dotColor, filled, last, label, value, children,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: '14px', minHeight: '46px' }}>
      <div style={{ width: '110px', textAlign: 'right', paddingTop: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>{when}</div>
        {whenSub && (
          <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: '1px' }}>{whenSub}</div>
        )}
      </div>
      <div style={{ width: '14px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '14px' }}>
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: filled ? dotColor : '#fff',
            border: `2px solid ${dotColor}`,
            zIndex: 1,
          }}
        />
        {!last && (
          <div style={{ width: '1px', flex: 1, background: '#e2e8f0', marginTop: '2px' }} />
        )}
      </div>
      <div style={{ flex: 1, padding: children ? 0 : '10px 0' }}>
        {children ? (
          children
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11.5px', color: '#0f172a' }}>{label}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{value}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AliancaPdfTemplate;
