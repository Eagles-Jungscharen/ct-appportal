import { authFetch } from './client';
import type { GroupAssignmentDto } from './types';

export const assignGroups = async(
  token: string,
  appId: string,
  data: GroupAssignmentDto,
): Promise<void> => {
  return await authFetch<void>(`/api/appmanagement/apps/${appId}/assignments`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const fetchAppAssignments = async (
  token: string,
  appId: string,
): Promise<string[]> => {
  return await authFetch<string[]>(`/api/appmanagement/apps/${appId}/assignments`, token);
};
