import { authFetch } from './client';
import type { ClientDto, ClientRegistrationDto, ClientRegistrationResultDto, UpdateClientDto } from './types';

export const fetchClients = async (token: string): Promise<ClientDto[]> => {
  return await authFetch<ClientDto[]>('/api/appmanagement/clients', token);
};

export const registerClient = async (
  token: string,
  data: ClientRegistrationDto,
): Promise<ClientRegistrationResultDto> => {
  return await authFetch<ClientRegistrationResultDto>('/api/appmanagement/clients', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateClient = async (
  token: string,
  clientId: string,
  data: UpdateClientDto,
): Promise<ClientDto> => {
  return await authFetch<ClientDto>(`/api/appmanagement/clients/${clientId}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteClient = async (token: string, clientId: string): Promise<void> => {
  await authFetch<undefined>(`/api/appmanagement/clients/${clientId}`, token, {
    method: 'DELETE',
  });
};
