# AsikaGo Backend Context

## Core Concepts

### User vs Profile
- **User**: Authentication entity, identified by `sub` or `auth.uid` from JWT token
- **Profile**: User profile entity, with Guid Id = auth.users.id
- Relationship: One User ↔ One Profile (one-to-one)

### Business Profile
- **BusinessProfile**: Business information linked to a User via UserId
- **One profile per user**: Decided D7 - create if doesn't exist, update if exists
- **UserId** always comes from login token, never from request body
- **CityId** always set to Pasig city id on create/update (MVP scope: Pasig City only)

### Assessment Module
- Contains business profile endpoints
- Validation logic for business profile data
- Returns ValidationProblem for validation failures

### Registration Status
- Planning: Initial state when user starts
- Started: Active state when user has begun the process
- Enum defined in AsikaGo.Api.Data.Entities.Enums.cs

## Glossary

### Request DTOs
- **SaveBusinessProfileRequest**: DTO for PUT /business-profile
  - BusinessName (string?, MaxLength(100)): Optional, nullable
  - BusinessType (string): Required enum from predefined list
  - CategoryId (Guid): Required, must reference existing BusinessCategory
  - RegistrationStatus (RegistrationStatus): Required, must be Planning or Started

### Response DTOs
- **BusinessProfileResponse**: DTO returned by GET/PUT business-profile
  - Id, BusinessName, BusinessType, CategoryId, CategoryName
  - CityId, CityName, RegistrationStatus, CreatedAt

### Validation Rules
- BusinessType: Must be in ["Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation"]
- CategoryId: Must not be empty and must exist in BusinessCategories table
- RegistrationStatus: Must be Planning or Started
- BusinessName: If not null, must be ≤100 characters

### City
- Pasig City Id: "11111111-1111-1111-1111-111111111103" (hardcoded in AssessmentEndpoints.cs)
- Other cities may be added in future expansions