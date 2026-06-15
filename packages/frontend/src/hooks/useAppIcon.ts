import { useEffect, useState } from 'react';
import { fetchAppIconUrl } from '../api/apps';
import { useAppAuth } from './useAppAuth';

export const useAppIcon = (appId: string, hasIcon: boolean): string | undefined => {
  const { token } = useAppAuth();
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!hasIcon || !token) {
      return;
    }

    let blobUrl: string | undefined;
    let cancelled = false;

    fetchAppIconUrl(token, appId)
      .then((url) => {
        if (cancelled) {
          // Komponente wurde inzwischen unmounted oder Dependencies haben sich geändert
          URL.revokeObjectURL(url);
          return;
        }
        blobUrl = url;
        setIconUrl(url);
      })
      .catch(() => {});

    // Blob-URL beim Unmount oder Dependency-Änderung freigeben
    return () => {
      cancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [appId, hasIcon, token]);

  // Wenn kein Icon vorhanden oder nicht authentifiziert, undefined zurückgeben
  return hasIcon && token ? iconUrl : undefined;
};
