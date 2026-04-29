import React from 'react';
import { Upload, FileSearch, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProposalStep = 'upload' | 'data' | 'proposal';

interface ProposalsStepperProps {
  activeStep: ProposalStep;
  onStepChange: (step: ProposalStep) => void;
  canGoToData: boolean;
  canGoToProposal: boolean;
}

const steps: { id: ProposalStep; label: string; icon: React.ElementType; hint: string }[] = [
  { id: 'upload', label: 'Upload', icon: Upload, hint: 'Envie a simulação' },
  { id: 'data', label: 'Dados Extraídos', icon: FileSearch, hint: 'Revise e ajuste' },
  { id: 'proposal', label: 'Proposta', icon: FileText, hint: 'Personalize e baixe' },
];

const ProposalsStepper: React.FC<ProposalsStepperProps> = ({
  activeStep,
  onStepChange,
  canGoToData,
  canGoToProposal,
}) => {
  const activeIndex = steps.findIndex((s) => s.id === activeStep);

  const isDisabled = (step: ProposalStep) => {
    if (step === 'data' && !canGoToData) return true;
    if (step === 'proposal' && !canGoToProposal) return true;
    return false;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 sm:gap-4">
        {steps.map((step, idx) => {
          const isActive = step.id === activeStep;
          const isCompleted = idx < activeIndex;
          const disabled = isDisabled(step.id);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => !disabled && onStepChange(step.id)}
                disabled={disabled}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  isActive && 'bg-primary text-primary-foreground shadow-md shadow-primary/20',
                  !isActive && !disabled && 'hover:bg-muted text-foreground',
                  disabled && 'opacity-40 cursor-not-allowed text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border transition-all',
                    isActive && 'border-white/40 bg-white/15',
                    !isActive && isCompleted && 'border-success/40 bg-success/10 text-success',
                    !isActive && !isCompleted && 'border-border bg-background',
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <div className="hidden sm:block text-left leading-tight">
                  <div
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wider',
                      isActive ? 'opacity-90' : 'text-muted-foreground',
                    )}
                  >
                    Passo {idx + 1}
                  </div>
                  <div className="text-sm font-semibold">{step.label}</div>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px transition-colors',
                    idx < activeIndex ? 'bg-success/60' : 'bg-border',
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalsStepper;
