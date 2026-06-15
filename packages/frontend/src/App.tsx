import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { router } from './router';
import { useEffect } from 'react';
import { APP_ICON_URL, APP_PORTAL_TITLE } from './config/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export const App: React.FunctionComponent = () => {
  useEffect(() => {
    document.title = APP_PORTAL_TITLE;
    if (!APP_ICON_URL) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = APP_ICON_URL;
  }, []);
  return (
    <FluentProvider theme={webLightTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </FluentProvider>
  );
};

