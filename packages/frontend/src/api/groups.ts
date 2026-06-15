import { authFetch } from './client';
import type { GroupDto } from './types';

export const fetchGroups = async (token: string): Promise<GroupDto[]> => {
  return await authFetch<GroupDto[]>('/api/appmanagement/groups', token);
};
