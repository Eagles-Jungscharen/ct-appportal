import { createContext } from 'react';

export interface AppAuthContextValue {
    isAuthenticated: boolean
    isLoading: boolean
    isAdmin: boolean
    groups: string[]
    displayName: string
    token: string | null
    login: () => void
    logout: () => void
}

export const AppAuthContext = createContext<AppAuthContextValue | null>(null);
