import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '../api/me';
import { useAppAuth } from './useAppAuth';

export const useMe = () => {
  const { token, isAuthenticated } = useAppAuth();

  return useQuery({
    queryKey: ['me'],
    queryFn: () => fetchMe(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000,
  });
};
