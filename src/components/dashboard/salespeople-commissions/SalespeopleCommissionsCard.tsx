
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { LoadingSpinner } from "../../ui/loading-spinner";
import { TableHeader } from "./TableHeader";
import { SalespersonRow } from "./SalespersonRow";
import { SummaryRow } from "./SummaryRow";
import { useSalespeopleCommissions } from "./useSalespeopleCommissions";
import { Users, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function SalespeopleCommissionsCard() {
  const { user } = useAuth();
  const { 
    salespeople, 
    summaryTotals, 
    loading, 
    sortColumn, 
    sortDirection, 
    handleSort 
  } = useSalespeopleCommissions();
  
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }
  
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <TrendingUp className="h-4 w-4" />
              </div>
              Consolidado Vendedores
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground">Carregando dados dos vendedores...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="w-full border-0 shadow-sm bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <motion.div
              className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <TrendingUp className="h-4 w-4" />
            </motion.div>
            <span className="text-gray-900 dark:text-white">Consolidado Vendedores</span>
            {salespeople.length > 0 && (
              <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                {salespeople.length} vendedores
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <table className="w-full text-sm">
              <TableHeader 
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                handleSort={handleSort}
              />
              <tbody>
                {salespeople.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">Nenhum vendedor encontrado</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Verifique se existem vendedores cadastrados no sistema
                          </p>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {salespeople.map((person, index) => (
                      <motion.tr
                        key={person.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SalespersonRow person={person} />
                      </motion.tr>
                    ))}
                    
                    {/* Summary row */}
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <SummaryRow summaryTotals={summaryTotals} />
                    </motion.tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {salespeople.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Dados atualizados em tempo real</span>
              </div>
              <span>Total: {salespeople.length} vendedores</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
