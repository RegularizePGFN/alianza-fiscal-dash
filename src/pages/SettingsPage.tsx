
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { MonthlyGoalsSettings } from "@/components/settings/MonthlyGoalsSettings";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("monthly-goals");

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      toast({
        title: "Acesso restrito",
        description: "Esta página é exclusiva para administradores.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <SettingsHeader />

        <Card className="border-0 shadow-sm overflow-hidden">
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <div className="border-b px-4 py-2">
              <TabsList className="dark:bg-gray-700/50 bg-gray-100">
                <TabsTrigger value="monthly-goals" className="dark:data-[state=active]:bg-gray-600 data-[state=active]:bg-white">
                  Metas Mensais
                </TabsTrigger>
                {/* Add more tabs here as needed */}
              </TabsList>
            </div>
            
            <TabsContent value="monthly-goals" className="space-y-4 p-4 sm:p-6">
              <MonthlyGoalsSettings />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}
