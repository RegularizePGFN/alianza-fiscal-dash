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

const parseNum = (v?: string) => {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

const formatBR = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
      const td = parseNum(data.totalDebt);
      const dv = parseNum(data.discountedValue);
      return td > dv && data.discountPercentage !== '0' && data.discountPercentage !== '0,00';
    })();

    const economy = calculateEconomy(data.totalDebt, data.discountedValue);
    const installmentsCount = parseInt(data.installments || '0', 10) || 0;
    const entryInstallments = parseInt(data.entryInstallments || '1', 10) || 1;
    const entryValueNum = parseNum(data.entryValue);
    const hasEntry = entryValueNum > 0;
    const totalInstallmentsCount = (hasEntry ? entryInstallments : 0) + installmentsCount;

    const entryInstallmentValueLabel = (() => {
      if (!hasEntry) return '0,00';
      if (entryInstallments <= 1) return data.entryValue || '0,00';
      return formatBR(entryValueNum / entryInstallments);
    })();

    const discountPctNum = Math.round(
      parseFloat(String(data.discountPercentage || '0').replace(',', '.')) || 0,
    );

    // Datas — timeline reflete entrada (se houver) + parcelas restantes
    const due1 = getLastBusinessDayOfMonth(today);
    const due2 = getLastBusinessDayOfMonth(addMonths(today, 1));
    const due3 = getLastBusinessDayOfMonth(addMonths(today, 2));
    const month1Name = MONTHS_PT[today.getMonth()];
    const month2Name = MONTHS_PT[addMonths(today, 1).getMonth()];
    const month3Name = MONTHS_PT[addMonths(today, 2).getMonth()];
    const tailMonth = addMonths(today, hasEntry ? 3 : 2);
    const tailShort = `${MONTHS_SHORT_PT[tailMonth.getMonth()]}/${String(tailMonth.getFullYear()).slice(-2)}`;

    const clientName = (companyData?.company?.name || data.clientName || '').toUpperCase();
    const cnpj = formatCnpj(data.cnpj);

    const installmentValueLabel = fmtMoney(data.installmentValue);
    const totalDebtLabel = fmtMoney(data.totalDebt);
    const discountedLabel = fmtMoney(data.discountedValue);
    const feesValueLabel = fmtMoney(data.feesValue);
    const entryValueLabel = fmtMoney(data.entryValue);

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

    const logoSrc = '/lovable-uploads/logo-alianca-fiscal.png';

    // Breakdown line for the hero
    const heroBreakdown = hasEntry
      ? `${entryInstallments > 1 ? `entrada ${entryInstallments}x de R$ ${entryInstallmentValueLabel}` : `entrada de R$ ${entryInstallmentValueLabel}`} + ${installmentsCount}x de R$ ${data.installmentValue || '0,00'}`
      : `${installmentsCount}x de R$ ${data.installmentValue || '0,00'}`;

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          minHeight: '1123px',
          fontFamily: "'Nunito', system-ui, -apple-system, sans-serif",
          color: '#0f172a',
          background: '#ffffff',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HEADER */}
        <div style={{ padding: '28px 44px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img
              src={logoSrc}
              alt="Aliança Fiscal"
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
              crossOrigin="anonymous"
            />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: MUTED, letterSpacing: '0.18em', fontWeight: 700 }}>
                PROPOSTA DE
              </div>
              <div style={{ fontSize: '15px', color: DARK, fontWeight: 800, letterSpacing: '0.06em' }}>
                REGULARIZAÇÃO PGFN
              </div>
              <div style={{ fontSize: '9px', color: MUTED, marginTop: '4px' }}>
                Emissão <span style={{ color: DARK, fontWeight: 700 }}>{issueDate}</span>
                <span style={{ margin: '0 4px' }}>·</span>
                Validade <span style={{ color: DARK, fontWeight: 700 }}>{validityDateLabel}</span>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: '18px',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(90deg, ${BLUE} 0%, ${GREEN} 100%)`,
            }}
          />
        </div>

        {/* PROPOSTA PARA */}
        <div style={{ padding: '26px 44px 0', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.18em', color: MUTED, fontWeight: 700 }}>
            PROPOSTA PARA
          </span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: DARK }}>{clientName}</span>
          <span style={{ fontSize: '10px', color: MUTED, marginLeft: 'auto' }}>
            CNPJ <span style={{ color: DARK, fontWeight: 700 }}>{cnpj}</span>
          </span>
        </div>

        {/* DESTAQUE */}
        <div style={{ padding: '20px 44px 0' }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${DARK} 0%, ${DARK2} 100%)`,
              borderRadius: '14px',
              padding: '28px 32px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '22px',
                right: '26px',
                background: hasDiscount ? GREEN : BLUE,
                color: '#fff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '5px 12px',
                borderRadius: '999px',
                letterSpacing: '0.04em',
              }}
            >
              {hasDiscount ? `−${discountPctNum}%` : 'SEM JUROS'}
            </div>

            <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
              {hasDiscount ? 'SUA ECONOMIA' : 'SEU BENEFÍCIO'}
            </div>

            {hasDiscount ? (
              <>
                <div style={{ fontSize: '36px', fontWeight: 800, color: GREEN, marginTop: '6px', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                  R$ {economy}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                  em reduções de juros e multas concedidas pela PGFN
                </div>
                <div
                  style={{
                    marginTop: '18px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: '10px 14px',
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
                <div style={{ fontSize: '30px', fontWeight: 800, color: '#fff', marginTop: '6px', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
                  Parcelamento sem juros
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '6px', maxWidth: '540px' }}>
                  Regularize sua dívida em até {totalInstallmentsCount}x sem nenhum acréscimo e suspenda as cobranças.
                </div>
                <div
                  style={{
                    marginTop: '18px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.85)',
                    display: 'inline-block',
                  }}
                >
                  Valor da dívida mantido{' '}
                  <span style={{ color: '#fff', fontWeight: 700 }}>{totalDebtLabel}</span>
                  {' · '}
                  {totalInstallmentsCount}x · <span style={{ color: '#fff', fontWeight: 700 }}>{heroBreakdown}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PLANEJAMENTO */}
        <div style={{ padding: '30px 44px 0' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: MUTED, fontWeight: 800 }}>
            SEU PLANEJAMENTO DE PAGAMENTOS
          </div>
          <div style={{ marginTop: '10px', borderTop: `1px solid ${BORDER}` }} />

          <div
            style={{
              marginTop: '16px',
              background: '#f8fafc',
              border: `1px solid ${BORDER}`,
              borderRadius: '10px',
              padding: '14px 18px',
              fontSize: '11px',
              color: '#334155',
              lineHeight: 1.55,
            }}
          >
            Hoje você paga <span style={{ color: GREEN_DARK, fontWeight: 700 }}>apenas os honorários da Aliança Fiscal.</span>{' '}
            {hasEntry
              ? <>A entrada da negociação{entryInstallments > 1 ? ` (em ${entryInstallments}x)` : ''} e as parcelas restantes vencem no último dia útil de cada mês.</>
              : <>A parcela da negociação com a PGFN só vence no último dia útil do mês — e segue assim nos meses seguintes.</>}
          </div>

          {/* Timeline com mais respiro */}
          <div style={{ marginTop: '16px' }}>
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
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                }}
              >
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: GREEN_DARK, fontWeight: 800 }}>
                    PAGUE HOJE
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: DARK, marginTop: '2px' }}>
                    Honorários Aliança Fiscal
                  </div>
                  <div style={{ fontSize: '10px', color: MUTED, marginTop: '2px' }}>
                    Único valor para iniciar a regularização agora
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: GREEN_DARK }}>
                  {feesValueLabel}
                </div>
              </div>
            </TimelineRow>

            {hasEntry ? (
              <>
                <TimelineRow
                  when={formatDateBR(due1)}
                  whenSub={`último dia útil de ${month1Name}`}
                  dotColor={BLUE}
                  label={
                    entryInstallments > 1
                      ? `Entrada da negociação · 1ª de ${entryInstallments}x`
                      : 'Entrada da negociação (PGFN)'
                  }
                  value={`R$ ${entryInstallmentValueLabel}`}
                />
                <TimelineRow
                  when={formatDateBR(due2)}
                  whenSub={`último dia útil de ${month2Name}`}
                  dotColor={BLUE}
                  label={
                    entryInstallments > 1
                      ? `Entrada · 2ª de ${entryInstallments}x`
                      : '1ª parcela restante'
                  }
                  value={entryInstallments > 1 ? `R$ ${entryInstallmentValueLabel}` : installmentValueLabel}
                />
                <TimelineRow
                  when={`a partir de ${tailShort}`}
                  whenSub="sempre no último dia útil"
                  dotColor={BLUE}
                  label={
                    entryInstallments > 1
                      ? `${installmentsCount} parcelas restantes (após a entrada)`
                      : `demais ${installmentsCount - 1} parcelas restantes`
                  }
                  value={installmentValueLabel}
                  last
                />
              </>
            ) : (
              <>
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
                  last={installmentsCount <= 2}
                />
                {installmentsCount > 2 && (
                  <TimelineRow
                    when={`a partir de ${tailShort}`}
                    whenSub="sempre no último dia útil"
                    dotColor={BLUE}
                    label={`demais parcelas (3ª a ${installmentsCount}ª)`}
                    value={installmentValueLabel}
                    last
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* OPÇÕES */}
        <div style={{ padding: '30px 44px 0' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: MUTED, fontWeight: 800 }}>
            OPÇÕES PARA A NEGOCIAÇÃO
          </div>
          <div style={{ marginTop: '10px', borderTop: `1px solid ${BORDER}` }} />

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: MUTED, fontWeight: 800 }}>
                À VISTA
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: hasDiscount ? GREEN_DARK : DARK, marginTop: '6px' }}>
                {hasDiscount ? discountedLabel : totalDebtLabel}
              </div>
              <div style={{ fontSize: '10px', color: MUTED, marginTop: '4px' }}>
                {hasDiscount ? 'Parcela única · desconto máximo aplicado' : 'Pagamento único da dívida'}
              </div>
            </div>
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: MUTED, fontWeight: 800 }}>
                PARCELADO · {totalInstallmentsCount}X SEM JUROS
              </div>
              {hasEntry ? (
                <div style={{ marginTop: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '9.5px', color: MUTED, fontWeight: 700, letterSpacing: '0.05em' }}>ENTRADA</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: DARK, marginTop: '2px' }}>
                      {entryInstallments > 1
                        ? `${entryInstallments}x de R$ ${entryInstallmentValueLabel}`
                        : entryValueLabel}
                    </div>
                    <div style={{ fontSize: '9.5px', color: MUTED, marginTop: '2px' }}>
                      Total: {entryValueLabel}
                    </div>
                  </div>
                  <div style={{ borderLeft: `1px solid ${BORDER}`, paddingLeft: '14px' }}>
                    <div style={{ fontSize: '9.5px', color: MUTED, fontWeight: 700, letterSpacing: '0.05em' }}>PARCELAS RESTANTES</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: DARK, marginTop: '2px' }}>
                      {installmentsCount}x de {installmentValueLabel}
                    </div>
                    <div style={{ fontSize: '9.5px', color: MUTED, marginTop: '2px' }}>
                      Último dia útil de cada mês
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginTop: '6px' }}>
                    {installmentValueLabel}
                    <span style={{ fontSize: '12px', fontWeight: 700, color: MUTED }}>/mês</span>
                  </div>
                  <div style={{ fontSize: '10px', color: MUTED, marginTop: '4px' }}>
                    {installmentsCount}x · 1ª parcela no último dia útil do mês
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '28px 44px 0' }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${DARK} 0%, ${DARK2} 100%)`,
              borderRadius: '12px',
              padding: '20px 26px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>Pronto para regularizar?</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '4px', maxWidth: '440px' }}>
                Confirme esta proposta e pague hoje apenas os honorários. Cuidamos de toda a formalização da adesão na PGFN.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>Para iniciar hoje</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: GREEN }}>{feesValueLabel}</div>
            </div>
          </div>
        </div>

        {/* DADOS CADASTRAIS */}
        {cadastrais && (
          <div style={{ padding: '20px 44px 0', fontSize: '9px', color: MUTED, lineHeight: 1.6 }}>
            <span style={{ color: '#334155', fontWeight: 700 }}>Dados cadastrais:</span> {cadastrais}
          </div>
        )}

        {/* SPACER */}
        <div style={{ flex: 1 }} />

        {/* FOOTER */}
        <div style={{ padding: '20px 44px 26px', marginTop: '24px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={logoSrc}
                alt="Aliança Fiscal"
                style={{ height: '26px', width: 'auto', objectFit: 'contain', opacity: 0.9 }}
                crossOrigin="anonymous"
              />
              {exec.name && (
                <div style={{ fontSize: '10px', color: MUTED }}>
                  Especialista <span style={{ color: DARK, fontWeight: 700 }}>{exec.name}</span>
                  {exec.email ? ` · ${exec.email}` : ''}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: MUTED, lineHeight: 1.6 }}>
              <div>
                <span style={{ color: DARK, fontWeight: 700 }}>Documento confidencial</span> — exclusivo ao contribuinte identificado.
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
    <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px', minHeight: '54px' }}>
      <div style={{ width: '110px', textAlign: 'right', paddingTop: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>{when}</div>
        {whenSub && (
          <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: '2px' }}>{whenSub}</div>
        )}
      </div>
      <div style={{ width: '14px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px' }}>
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
      <div style={{ flex: 1, padding: children ? '4px 0' : '12px 0' }}>
        {children ? (
          children
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11.5px', color: '#0f172a' }}>{label}</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{value}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AliancaPdfTemplate;
