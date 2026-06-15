import { useQuery } from '@tanstack/react-query';
import { fetchAppAssignments } from '../api/assignments';
import { useAppAuth } from './useAppAuth';

export const useAppAssignments = (appId: string) => {
  const { token, isAuthenticated } = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'assignments', appId],
    queryFn: () => fetchAppAssignments(token!, appId),
    enabled: isAuthenticated && !!token && !!appId,
    staleTime: 2 * 60 * 1000,
  });
};
