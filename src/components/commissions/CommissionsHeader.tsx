
interface CommissionsHeaderProps {
  isAdmin: boolean;
}

export function CommissionsHeader({ isAdmin }: CommissionsHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden print:hidden transition-colors duration-300">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isAdmin ? "Comissões" : "Minhas Comissões"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {isAdmin 
                ? "Histórico e informações detalhadas de comissões dos vendedores"
                : "Histórico e informações detalhadas das suas comissões"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
