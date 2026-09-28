# AsikaGo Technical Architecture Document v1.0

## Document Information

**Project:** AsikaGo\
**Document Type:** Technical Architecture Document\
**Version:** v1.0 Draft\
**Architecture Style:** Client-Server Web Application\
**Technology Direction:** React + ASP.NET Core + Supabase PostgreSQL +
Gemini Flash

------------------------------------------------------------------------

# 1. System Overview

AsikaGo is a web application that guides Filipino micro-entrepreneurs
through business registration by generating personalized registration
roadmaps.

The system combines:

-   React frontend for user interaction
-   ASP.NET Core backend for business logic
-   Supabase PostgreSQL for data storage
-   Gemini Flash for AI-assisted understanding and explanation
-   Research-curated knowledge base for accurate registration
    information

The system follows the principle:

> AI assists understanding, while the backend roadmap engine controls
> the registration logic.

------------------------------------------------------------------------

# 2. High-Level Architecture

                        USER

                         |

                  React Frontend

                         |

                ASP.NET Core Web API

                         |

     ------------------------------------------------

     |                    |                         |

    Roadmap Engine     AI Service              Auth Service

     |                    |                         |

     |                    |                         |

    Supabase DB       Gemini Flash             OAuth

     |

    Registration Knowledge Base

     |

    Research Data

------------------------------------------------------------------------

# 3. Technology Stack

## Frontend

Technology: - React

Responsibilities: - User interface - Business assessment forms -
Dashboard - Roadmap visualization - Progress tracking - AI interaction
interface

------------------------------------------------------------------------

## Backend

Technology: - ASP.NET Core Web API

Responsibilities: - Application logic - API endpoints - Authentication
handling - Roadmap generation - User progress management - Database
communication

------------------------------------------------------------------------

## Database

Technology: - Supabase PostgreSQL

Responsibilities: - Store user information - Store business profiles -
Store registration requirements - Store roadmap rules - Store research
sources

------------------------------------------------------------------------

## Artificial Intelligence

Technology: - Gemini Flash

Responsibilities: - Extract business information from natural language -
Explain registration steps - Answer contextual questions

AI does not: - Generate official requirements independently - Replace
the roadmap engine

------------------------------------------------------------------------

# 4. Component Responsibilities

## React Frontend

The frontend manages the user experience.

Main modules:

### Business Assessment

Allows users to describe:

-   Business type
-   Category
-   Location
-   Registration status

------------------------------------------------------------------------

### Roadmap Dashboard

Displays:

-   Registration steps
-   Completion status
-   Requirements

------------------------------------------------------------------------

### AI Assistant Interface

Allows users to ask questions about their journey.

------------------------------------------------------------------------

# ASP.NET Core Backend

The backend acts as the main application controller.

Responsibilities:

-   Process user requests
-   Validate information
-   Execute roadmap rules
-   Retrieve knowledge base data
-   Return responses to frontend

------------------------------------------------------------------------

# Roadmap Engine

The roadmap engine is the core product logic.

It uses:

-   Business category
-   Location
-   Registration status

to determine applicable registration steps.

Example:

    Food Business + Pasig

    ↓

    DTI
    Barangay Clearance
    Sanitary Permit
    Mayor's Permit
    BIR

------------------------------------------------------------------------

# 5. Roadmap Engine Design

## Input

Business Profile:

    Business Category
    Business Type
    City
    Registration Status

------------------------------------------------------------------------

## Processing

The backend checks:

-   Business rules
-   City-specific requirements
-   Registration conditions

------------------------------------------------------------------------

## Output

Generated roadmap:

    Step 1
    Step 2
    Step 3
    ...

------------------------------------------------------------------------

# 6. Database Design (Initial ERD)

## User

Stores account information.

Fields:

-   UserID
-   Name
-   Email
-   Authentication Provider

------------------------------------------------------------------------

## Business Profile

Stores business information.

Fields:

-   BusinessID
-   UserID
-   Business Name
-   Category
-   City
-   Status

Relationship:

User 1:M Business Profile

------------------------------------------------------------------------

## Registration Step

Stores registration process information.

Fields:

-   StepID
-   Step Name
-   Agency
-   Description

------------------------------------------------------------------------

## Requirement

Stores requirements.

Fields:

-   RequirementID
-   StepID
-   Requirement Name
-   Description
-   Source

------------------------------------------------------------------------

## Roadmap Rule

Stores dynamic roadmap logic.

Fields:

-   RuleID
-   Category
-   City
-   Condition
-   Action

------------------------------------------------------------------------

Relationship:

    Business Profile

            |

    Roadmap Rule

            |

    Registration Steps

            |

    Requirements

------------------------------------------------------------------------

# 7. AI Integration Flow

## Step 1: User Input

Example:

"I want to open a coffee shop in Pasig."

------------------------------------------------------------------------

## Step 2: Gemini Extraction

AI extracts:

    Business Type:
    Coffee Shop

    Category:
    Food

    City:
    Pasig

------------------------------------------------------------------------

## Step 3: Backend Validation

ASP.NET Core receives the extracted information.

------------------------------------------------------------------------

## Step 4: Roadmap Generation

Backend queries:

-   Knowledge base
-   Rules

------------------------------------------------------------------------

## Step 5: AI Explanation

Gemini explains:

-   Why a step exists
-   What documents are needed
-   What the user should do next

------------------------------------------------------------------------

# 8. Authentication Architecture

Decision:

OAuth authentication.

Recommended provider:

Google OAuth

Flow:

    User

    ↓

    Google Login

    ↓

    Authentication Provider

    ↓

    AsikaGo Account

    ↓

    User Dashboard

------------------------------------------------------------------------

# 9. Deployment Architecture

Target:

Public deployed web application.

Proposed deployment:

    React Frontend

    ↓

    Vercel

    ↓

    ASP.NET Core API

    ↓

    Cloud Hosting

    ↓

    Supabase PostgreSQL

    ↓

    Gemini API

------------------------------------------------------------------------

# 10. Security Considerations

## User Data Protection

Consider:

-   Secure authentication
-   Protected API endpoints
-   Input validation
-   Safe document handling

------------------------------------------------------------------------

## AI Safety

The system should:

-   Use verified knowledge sources
-   Avoid unsupported claims
-   Clearly separate AI explanations from official requirements

------------------------------------------------------------------------

# 11. Scalability Considerations

Future expansion:

## Additional Cities

Current:

-   Quezon City
-   Manila
-   Pasig

Future:

Additional LGUs can be added through the knowledge base.

------------------------------------------------------------------------

## Multiple Businesses

Current MVP:

One account = one business.

Future:

Support multiple business profiles.

------------------------------------------------------------------------

## Additional AI Features

Future possibilities:

-   Better recommendations
-   Automated document assistance
-   More conversational guidance

------------------------------------------------------------------------

# 12. Architecture Principles

AsikaGo follows these principles:

1.  Business logic belongs in the backend.
2.  Research data is the source of truth.
3.  AI enhances usability, not authority.
4.  Frontend focuses on user experience.
5.  Components should support future expansion.

------------------------------------------------------------------------

# Next Artifact

Next recommended document:

AsikaGo Database Design Specification

Contents:

-   Detailed ERD
-   Table structures
-   Relationships
-   Data dictionary
-   Sample records
