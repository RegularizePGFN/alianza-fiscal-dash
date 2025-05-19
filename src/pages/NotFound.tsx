
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";

const NotFound = () => {
  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">Página não encontrada</p>
          <Button asChild>
            <Link to="/">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
