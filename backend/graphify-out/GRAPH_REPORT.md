# Graph Report - backend  (2026-10-08)

## Corpus Check
- 39 files · ~7,977 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 7, .props 1)

## Summary
- 392 nodes · 619 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9c8c5f03`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RoadmapRule
- .PutBusinessProfile
- AsikaGo.Api.Data
- .GetStepDetails
- AssessmentTests.cs
- AssessmentTests
- AsikaGo.Tests.csproj
- HealthAndAuthTests
- Profile
- AppDbContext
- http
- RoadmapProgress
- BusinessProfile
- InitialSchema
- Core Concepts
- RequirementProgress
- .OnModelCreating
- UserRoadmap
- AuthExtensions.cs
- .BuildModel
- City

## God Nodes (most connected - your core abstractions)
1. `AppDbContext` - 35 edges
2. `BusinessProfile` - 23 edges
3. `AssessmentTests` - 21 edges
4. `RoadmapRule` - 20 edges
5. `AsikaGo.Api.Data.Entities` - 19 edges
6. `RoadmapProgress` - 16 edges
7. `Requirement` - 15 edges
8. `RequirementProgress` - 13 edges
9. `Profile` - 12 edges
10. `UserRoadmap` - 12 edges

## Surprising Connections (you probably didn't know these)
- `CustomWebApplicationFactory` --references--> `Program`  [EXTRACTED]
  tests/AsikaGo.Tests/CustomWebApplicationFactory.cs → src/AsikaGo.Api/Program.cs
- `HealthAndAuthTests` --references--> `Program`  [EXTRACTED]
  tests/AsikaGo.Tests/HealthAndAuthTests.cs → src/AsikaGo.Api/Program.cs
- `AppDbContext` --references--> `BusinessCategory`  [EXTRACTED]
  src/AsikaGo.Api/Data/AppDbContext.cs → src/AsikaGo.Api/Data/Entities/BusinessCategory.cs
- `AppDbContext` --references--> `BusinessProfile`  [EXTRACTED]
  src/AsikaGo.Api/Data/AppDbContext.cs → src/AsikaGo.Api/Data/Entities/BusinessProfile.cs
- `AppDbContext` --references--> `City`  [EXTRACTED]
  src/AsikaGo.Api/Data/AppDbContext.cs → src/AsikaGo.Api/Data/Entities/City.cs

## Import Cycles
- None detected.

## Communities (21 total, 5 thin omitted)

### Community 0 - "RoadmapRule"
Cohesion: 0.05
Nodes (34): AsikaGo.Api.Data.Entities, RoadmapRuleEffect, Exclude, Include, RegistrationStep, Agency, Description, Id (+26 more)

### Community 1 - ".PutBusinessProfile"
Cohesion: 0.09
Nodes (16): AsikaGo.Api.Features.Assessment, Current State Analysis, Decision, Decisions for US-001-BE-03: Build PUT /api/business-profile with validation, Next Steps, Open Questions, Ticket Summary, Validation Review (+8 more)

### Community 2 - "AsikaGo.Api.Data"
Cohesion: 0.11
Nodes (6): AsikaGo.Api.Features.Me, AsikaGo.Api.Data.Migrations, AsikaGo.Api.Features.Roadmap, AsikaGo.Api.Data, ScopeToPasig, MeResponse

### Community 3 - ".GetStepDetails"
Cohesion: 0.12
Nodes (11): RoadmapEndpoints, RequirementResponse, RoadmapResponse, RoadmapStepResponse, SourceResponse, StepDetailResponse, StepStatus, Completed (+3 more)

### Community 6 - "AsikaGo.Tests.csproj"
Cohesion: 0.11
Nodes (16): coverlet.collector (6.0.4), EFCore.NamingConventions (10.0.1), Microsoft.AspNetCore.Authentication.JwtBearer (10.0.12), Microsoft.AspNetCore.Mvc.Testing (10.0.12), Microsoft.AspNetCore.OpenApi (10.0.12), Microsoft.EntityFrameworkCore (10.0.12), Microsoft.EntityFrameworkCore.Design (10.0.12), Microsoft.EntityFrameworkCore.InMemory (10.0.12) (+8 more)

### Community 7 - "HealthAndAuthTests"
Cohesion: 0.16
Nodes (3): Program, CustomWebApplicationFactory, HealthAndAuthTests

### Community 8 - "Profile"
Cohesion: 0.11
Nodes (7): Profile, CreatedAt, DisplayName, Email, Id, IsAnonymous, MeEndpoints

### Community 9 - "AppDbContext"
Cohesion: 0.12
Nodes (12): AppDbContext, BusinessCategories, BusinessProfiles, Cities, Profiles, RegistrationSteps, RequirementProgress, Requirements (+4 more)

### Community 10 - "http"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 11 - "RoadmapProgress"
Cohesion: 0.13
Nodes (13): RoadmapStepStatus, Completed, InProgress, NotStarted, RoadmapProgress, CompletedAt, Id, Roadmap (+5 more)

### Community 12 - "BusinessProfile"
Cohesion: 0.14
Nodes (12): BusinessProfile, BusinessName, BusinessType, Category, CategoryId, City, CityId, CreatedAt (+4 more)

### Community 14 - "Core Concepts"
Cohesion: 0.17
Nodes (11): AsikaGo Backend Context, Assessment Module, Business Profile, City, Core Concepts, Glossary, Registration Status, Request DTOs (+3 more)

### Community 15 - "RequirementProgress"
Cohesion: 0.20
Nodes (7): RequirementProgress, IsPrepared, Requirement, RequirementId, Roadmap, RoadmapId, UpdatedAt

### Community 16 - ".OnModelCreating"
Cohesion: 0.25
Nodes (4): BusinessCategory, Description, Id, Name

### Community 17 - "UserRoadmap"
Cohesion: 0.25
Nodes (5): UserRoadmap, Business, BusinessId, CreatedAt, Id

### Community 20 - "City"
Cohesion: 0.33
Nodes (4): City, Id, Name, Region

## Knowledge Gaps
- **126 isolated node(s):** `Microsoft.AspNetCore.Authentication.JwtBearer (10.0.12)`, `Microsoft.AspNetCore.OpenApi (10.0.12)`, `Microsoft.EntityFrameworkCore.Design (10.0.12)`, `Microsoft.Extensions.ApiDescription.Server (10.0.12)`, `Npgsql.EntityFrameworkCore.PostgreSQL (10.0.3)` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 212 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppDbContext` connect `AppDbContext` to `RoadmapRule`, `.PutBusinessProfile`, `AsikaGo.Api.Data`, `AssessmentTests`, `HealthAndAuthTests`, `Profile`, `RoadmapProgress`, `BusinessProfile`, `RequirementProgress`, `.OnModelCreating`, `UserRoadmap`, `City`?**
  _High betweenness centrality (0.318) - this node is a cross-community bridge._
- **Why does `AsikaGo.Api.Data.Entities` connect `RoadmapRule` to `.PutBusinessProfile`, `AsikaGo.Api.Data`, `AssessmentTests.cs`, `Profile`, `RequirementProgress`, `.OnModelCreating`, `UserRoadmap`, `City`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `AsikaGo.Api.Data` connect `AsikaGo.Api.Data` to `AssessmentTests.cs`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **What connects `Microsoft.AspNetCore.Authentication.JwtBearer (10.0.12)`, `Microsoft.AspNetCore.OpenApi (10.0.12)`, `Microsoft.EntityFrameworkCore.Design (10.0.12)` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RoadmapRule` be split into smaller, more focused modules?**
  _Cohesion score 0.04830917874396135 - nodes in this community are weakly interconnected._
- **Should `.PutBusinessProfile` be split into smaller, more focused modules?**
  _Cohesion score 0.09009009009009009 - nodes in this community are weakly interconnected._
- **Should `AsikaGo.Api.Data` be split into smaller, more focused modules?**
  _Cohesion score 0.11051693404634581 - nodes in this community are weakly interconnected._