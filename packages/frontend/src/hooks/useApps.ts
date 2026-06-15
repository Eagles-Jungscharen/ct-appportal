import { useQuery } from '@tanstack/react-query';
import { fetchApps } from '../api/apps';
import { useAppAuth } from './useAppAuth';

export const useApps = () => {
  const { token, isAuthenticated } = useAppAuth();

  return useQuery({
    queryKey: ['apps'],
    queryFn: () => fetchApps(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 2 * 60 * 1000,
  });
};
