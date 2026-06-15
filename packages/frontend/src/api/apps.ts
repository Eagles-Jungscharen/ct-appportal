import { API_BASE_URL } from '../config/api';
import { ApiResponseError, authFetch } from './client';
import type { AppDto, CreateUpdateAppData } from './types';

export const fetchApps = async (token: string): Promise<AppDto[]> => {
  return await authFetch<AppDto[]>('/api/apps', token);
};

export const fetchAllApps = async (token: string): Promise<AppDto[]> => {
  return await authFetch<AppDto[]>('/api/appmanagement/apps', token);
};

export const createApp = async (token: string, data: CreateUpdateAppData): Promise<AppDto> => {
  return await authFetch<AppDto>('/api/appmanagement/apps', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateApp = async (token: string, id: string, data: CreateUpdateAppData): Promise<AppDto> => {
  return await authFetch<AppDto>(`/api/appmanagement/apps/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteApp = async (token: string, id: string): Promise<void> => {
  return await authFetch<void>(`/api/appmanagement/apps/${id}`, token, {
    method: 'DELETE',
  });
};

export const uploadAppIcon = async (token: string, appId: string, file: File): Promise<void> => {
  // FormData: Content-Type wird vom Browser automatisch mit Boundary gesetzt
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/api/appmanagement/apps/${appId}/icon`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.error ?? body.message ?? message;
    } catch {
      // statusText beibehalten
    }
    throw new ApiResponseError({ status: response.status, message });
  }
};

export const fetchAppIconUrl = async (token: string, appId: string): Promise<string> => {
  const url = `${API_BASE_URL}/api/apps/${appId}/icon`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new ApiResponseError({ status: response.status, message: response.statusText });
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
