
interface CommissionsInfoCardProps {
  isAdmin?: boolean;
}

export function CommissionsInfoCard({ isAdmin = false }: CommissionsInfoCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Informações sobre Comissões
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Estrutura de Comissões
          </h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-300">
            <li>• Até R$ 10.000: 20% de comissão</li>
            <li>• Acima de R$ 10.000: 25% de comissão</li>
            {!isAdmin && <li>• Meta individual baseada em dias úteis</li>}
          </ul>
        </div>
        {isAdmin && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Bonificação Gestora
            </h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li>• R$ 50k - R$ 70k: R$ 500</li>
              <li>• R$ 70k - R$ 100k: R$ 1.000</li>
              <li>• Acima R$ 100k: R$ 2.000</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
