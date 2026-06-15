// ============================================
// AUTOMATISCH GENERIERT — NICHT MANUELL EDITIEREN
// ============================================
// Diese Datei wird automatisch aus C# DTOs generiert via:
// npm run generate:types
//
// Quelle: packages/backend/Models/Dtos/
// Generator: packages/backend/Tools/DtoTypeGenerator/
// Generiert: 2026-06-15 17:11:24 UTC
// ============================================

/**
 * AppDto
 * C# Type: EaglesJungscharen.Azure.AppPortal.Models.Dtos.AppDto
 */
export interface AppDto {
  description?: string | null;
  hasIcon: boolean;
  id?: string | null;
  name?: string | null;
  redirectUris?: string | null[] | null;
  url?: string | null;
}


/**
 * ClientInfoDto
 * C# Type: EaglesJungscharen.Azure.AppPortal.Models.Dtos.ClientInfoDto
 */
export interface ClientInfoDto {
  clientId?: string | null;
  name?: string | null;
  owner?: string | null;
  redirectUris?: string | null[] | null;
}


/**
 * ClientRegistrationDto
 * C# Type: EaglesJungscharen.Azure.AppPortal.Models.Dtos.ClientRegistrationDto
 */
export interface ClientRegistrationDto {
  name?: string | null;
  owner?: string | null;
  redirectUris?: string | null[] | null;
}


/**
 * ClientRegistrationResultDto
 * C# Type: EaglesJungscharen.Azure.AppPortal.Models.Dtos.ClientRegistrationResultDto
 */
export interface ClientRegistrationResultDto {
  clientId?: string | null;
  clientSecret?: string | null;
}


/**
 * ErrorRecord
 * C# Type: EaglesJungscharen.Azure.AppPortal.Models.Dtos.ErrorRecord
 */
export interface ErrorRecord {
  error?: string | null;
  errorNumber: number;
}


/**
 * GroupAssignmentDto
 * C# Type: EaglesJungscharen.Azure.AppPortal.Models.Dtos.GroupAssignmentDto
 */
export interface GroupAssignmentDto {
  appId?: string | null;
  groupId?: string | null;
}


/**
 * GroupDto
 * C# Type: EaglesJungscharen.Azure.AppPortal.Models.Dtos.GroupDto
 */
export interface GroupDto {
  id?: string | null;
  title?: string | null;
}


/**
 * MeDto
 * C# Type: EaglesJungscharen.Azure.AppPortal.Models.Dtos.MeDto
 */
export interface MeDto {
  displayName?: string | null;
  groups?: GroupDto | null[] | null;
  isAdmin: boolean;
  userId?: string | null;
}


