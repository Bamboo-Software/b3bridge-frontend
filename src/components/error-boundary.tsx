import { type ReactNode, useCallback } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from './ui/button';
interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorFallback = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>Access Denied</h1>
      <Button>
        Reload
      </Button>
    </div>
  );
};

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const handleError = useCallback((error: Error) => {
    console.error('Error caught by ErrorBoundary:', error);
  }, []);

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
};
