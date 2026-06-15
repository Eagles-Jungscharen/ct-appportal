// --- Me ---
export interface MeDto {
  userId: string
  displayName: string
  isAdmin: boolean
  groups: string[]
}

// --- Groups ---
export interface GroupDto {
  id: string
  title: string
}

// --- Apps ---
export interface AppDto {
  id: string
  name: string
  description?: string
  url: string
  hasIcon: boolean
  redirectUris: string[]
}

// Typ für Create- und Update-Requests (hasIcon ist serverseitig abgeleitet)
export type CreateUpdateAppData = Omit<AppDto, 'id' | 'hasIcon'>

// --- Assignments ---
export interface GroupAssignmentDto {
  appId: string
  groupIds: string[]
}

// --- Clients ---
export interface ClientDto {
  clientId: string
  name: string
  owner: string
  redirectUris: string[]
}

export interface ClientRegistrationDto {
  name: string
  redirectUris: string[]
}

export interface ClientRegistrationResultDto {
  clientId: string
}

export interface UpdateClientDto {
  name?: string
  owner?: string
  redirectUris?: string[]
}

// --- API Errors ---
export interface ApiError {
  status: number
  message: string
}
