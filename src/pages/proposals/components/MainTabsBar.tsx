import React from 'react';
import { Sparkles, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MainProposalTab = 'generate' | 'history';

interface MainTabsBarProps {
  activeTab: MainProposalTab;
  onChange: (tab: MainProposalTab) => void;
}

const tabs: { id: MainProposalTab; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'generate', label: 'Gerar Proposta', hint: 'Upload, dados e personalização', icon: Sparkles },
  { id: 'history', label: 'Histórico de Propostas', hint: 'Dashboard, filtros e propostas anteriores', icon: History },
];

const MainTabsBar: React.FC<MainTabsBarProps> = ({ activeTab, onChange }) => {
  return (
    <div className="inline-flex w-full md:w-auto rounded-xl border border-border bg-muted/40 p-1 shadow-sm">
      {tabs.map((t) => {
        const isActive = t.id === activeTab;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-left transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-foreground hover:bg-background/80',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                isActive ? 'bg-white/15' : 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{t.label}</div>
              <div
                className={cn(
                  'text-[10px]',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                )}
              >
                {t.hint}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MainTabsBar;
