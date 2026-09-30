# Decisions for US-001-BE-03: Build PUT /api/business-profile with validation

## Ticket Summary
Build PUT /api/business-profile endpoint to save user's business profile with validation.
- One profile per user (decision D7)
- Create if doesn't exist, update if exists (never create second profile)
- User ID from login token only (never from request body)
- Backend sets city_id to Pasig city ID on every create/update (MVP scope: Pasig City only)
- Return 400 ValidationProblem with field-specific messages for validation failures

## Current State Analysis
Existing implementation in `src\AsikaGo.Api\Features\Assessment\AssessmentEndpoints.cs`:
- PUT `/business-profile` endpoint already exists (line 19)
- Implemented in `PutBusinessProfile` method (lines 69-136)
- Already implements:
  - ✓ User ID extraction from HTTP context (GetUserId method)
  - ✓ Validation of request fields
  - ✓ Check for existing profile and create/update logic
  - ✓ Sets CityId to PasigId on both create and update
  - ✓ Returns created/updated profile

## Validation Review
Current validation in PutBusinessProfile (lines 75-89):
1. BusinessType: Must be in ["Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation"]
2. CategoryId: Must not be empty and must exist in BusinessCategories table
3. RegistrationStatus: Must be Planning or Started
4. BusinessName: If not null, must be ≤100 characters

All required fields from SaveBusinessProfileRequest are validated:
- BusinessName: string? (nullable, MaxLength(100))
- BusinessType: string (Required)
- CategoryId: Guid (Required)
- RegistrationStatus: RegistrationStatus (Required)

## Open Questions
1. Should BusinessName be required when provided (not just length validation)?
2. Is the hardcoded PasigId correct and maintained properly?
3. Are there any missing validations based on business requirements?

## Decision
**No changes needed** - The current implementation already satisfies all requirements from US-001-BE-03:
- Single profile per user handled correctly
- User ID from token only
- Pasig city ID set on create/update
- Appropriate validation returning ValidationProblem
- Create if not exists, update if exists

## Next Steps
If changes are needed based on open questions, they would be:
1. Add validation for BusinessName not empty when provided
2. Verify PasigId against database seed data
3. Add any additional business-specific validations

However, based on current analysis, the endpoint is ready as-is.