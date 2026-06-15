import { useQuery } from '@tanstack/react-query';
import { fetchGroups } from '../api/groups';
import { useAppAuth } from './useAppAuth';

export const useGroups = () => {
  const { token, isAuthenticated } = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'groups'],
    queryFn: () => fetchGroups(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000,
  });
};
