import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApp, deleteApp, fetchAllApps, updateApp, uploadAppIcon } from '../api/apps';
import type { CreateUpdateAppData } from '../api/types';
import { useAppAuth } from './useAppAuth';

export function useAdminApps() {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'apps'],
    queryFn: () => fetchAllApps(token!),
    enabled: !!token,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateApp() {
  const { token } = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUpdateAppData) => createApp(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'apps'] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });
}

export function useUpdateApp() {
  const { token } = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateUpdateAppData }) =>
      updateApp(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'apps'] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });
}

export function useDeleteApp() {
  const { token } = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApp(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'apps'] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });
}

export function useUploadAppIcon() {
  const { token } = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, file }: { appId: string; file: File }) =>
      uploadAppIcon(token!, appId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'apps'] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });
}
