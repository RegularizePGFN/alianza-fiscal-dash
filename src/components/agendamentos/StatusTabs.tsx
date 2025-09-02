import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle } from "lucide-react";

export type MessageStatusFilter = 'scheduled' | 'sent' | 'all';

interface StatusTabsProps {
  currentStatus: MessageStatusFilter;
  onStatusChange: (status: MessageStatusFilter) => void;
  counts: {
    scheduled: number;
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
    <div className="space-y-6">
      <Tabs value={currentStatus} onValueChange={onStatusChange as (value: string) => void}>
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-1 border border-blue-200/50 dark:border-blue-700/50">
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-blue-700"
          >
            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium">Todas</span>
            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="scheduled" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 data-[state=active]:border data-[state=active]:border-orange-200 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-orange-700"
          >
            <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-medium">Agendadas</span>
            <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600">
              {counts.scheduled}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="sent" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 data-[state=active]:border data-[state=active]:border-green-200 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-green-700"
          >
            <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium">Enviadas</span>
            <Badge className="text-xs bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600">
              {counts.sent}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value={currentStatus} className="mt-6">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
};