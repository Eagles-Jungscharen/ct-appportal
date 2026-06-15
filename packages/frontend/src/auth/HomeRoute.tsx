import { Spinner } from '@fluentui/react-components';
import { useAppAuth } from '../hooks/useAppAuth';
import { PageShell } from '../components/PageShell';
import { AppPortal } from '../pages/AppPortal';
import { LandingPage } from '../pages/LandingPage';

export const HomeRoute: React.FunctionComponent = () => {
  const { isAuthenticated, isLoading } = useAppAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spinner size="large" label="Wird geladen…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <PageShell>
      <AppPortal />
    </PageShell>
  );
};
