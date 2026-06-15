import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useOidcAuth } from 'react-oidc-context';

export const OidcCallback:React.FunctionComponent = () => {
  const oidc = useOidcAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!oidc.isLoading && !oidc.error) {
      navigate('/', { replace: true });
    }
  }, [oidc.isLoading, oidc.error, navigate]);

  if (oidc.error) {
    return <div>Authentifizierungsfehler: {oidc.error.message}</div>;
  }

  return <div>Anmeldung wird verarbeitet…</div>;
};
