import type { AuthProviderProps } from 'react-oidc-context';

export const oidcConfig: AuthProviderProps = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI ?? `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri:
    import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ?? window.location.origin,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  onSigninCallback: () => {
    // Remove OIDC query params from URL after callback without full reload
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
