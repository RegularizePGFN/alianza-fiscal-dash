
interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ 
  className, 
  size = 'md'  
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-t-2 border-b-2',
    lg: 'h-12 w-12 border-t-3 border-b-3'
  };
  
  return (
    <div className={`flex justify-center py-8 ${className || ''}`}>
      <div className={`animate-spin rounded-full ${sizeClass[size]} border-primary`}></div>
    </div>
  );
}
