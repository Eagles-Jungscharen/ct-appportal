import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerClient } from '../api/clients';
import type { ClientRegistrationDto } from '../api/types';
import { useAppAuth } from './useAppAuth';

export const useClientRegistration = () => {
  const { token } = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClientRegistrationDto) => registerClient(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
    },
  });
};

