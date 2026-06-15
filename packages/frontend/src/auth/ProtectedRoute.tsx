import { useAppAuth } from '../hooks/useAppAuth';

export const ProtectedRoute: React.FunctionComponent<React.PropsWithChildren> = (props:React.PropsWithChildren) => {
  const { isAuthenticated, isLoading, login } = useAppAuth();
  const { children } = props;

  if (isLoading) return null;

  if (!isAuthenticated) {
    login();
    return null;
  }

  return <>{children}</>;
};
