
interface TopPerformerCardProps {
  topPerformer: {
    name: string;
    projectedCommission: number;
  };
}

export function TopPerformerCard({ topPerformer }: TopPerformerCardProps) {
  if (topPerformer.projectedCommission <= 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Maior Comissão do Período
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {topPerformer.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {topPerformer.projectedCommission.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
          <p className="text-sm text-gray-500">
            Comissão projetada
          </p>
        </div>
      </div>
    </div>
  );
}
