import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export type MessageStatusFilter = 'scheduled' | 'pending_approval' | 'sent' | 'all';

interface StatusTabsProps {
  currentStatus: MessageStatusFilter;
  onStatusChange: (status: MessageStatusFilter) => void;
  counts: {
    scheduled: number;
    pending_approval: number;
    sent: number;
    all: number;
  };
  children: React.ReactNode;
}

export const StatusTabs = ({ 
  currentStatus, 
  onStatusChange, 
  counts, 
  children 
}: StatusTabsProps) => {
  return (
    <Tabs value={currentStatus} onValueChange={onStatusChange as (value: string) => void}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all" className="flex items-center gap-2">
          Todas
          <Badge variant="secondary" className="text-xs">
            {counts.all}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="flex items-center gap-2">
          Agendadas
          <Badge variant="outline" className="text-xs">
            {counts.scheduled}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="pending_approval" className="flex items-center gap-2">
          Aprovação
          <Badge variant="destructive" className="text-xs">
            {counts.pending_approval}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex items-center gap-2">
          Enviadas
          <Badge variant="default" className="text-xs">
            {counts.sent}
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value={currentStatus} className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};