# AsikaGo Database Design Specification v1.0

## Document Information

**Project:** AsikaGo\
**Document Type:** Database Design Specification\
**Version:** v1.0 Draft\
**Database Direction:** Supabase PostgreSQL

------------------------------------------------------------------------

# 1. Database Purpose

The AsikaGo database stores and manages:

-   User accounts
-   Business profiles
-   Registration requirements
-   Roadmap rules
-   Generated roadmaps
-   User progress
-   Research knowledge base information

The database supports the principle:

> Research data is the source of truth, while the roadmap engine uses
> stored rules to generate personalized journeys.

------------------------------------------------------------------------

# 2. Database Design Principles

## 2.1 Scalability

The design should support future expansion:

-   Additional cities
-   Additional business categories
-   Multiple businesses per user
-   More registration processes

------------------------------------------------------------------------

## 2.2 Data Reliability

Registration information should include:

-   Source reference
-   Update information
-   Category classification

------------------------------------------------------------------------

## 2.3 Separation of Concerns

The database separates:

User data:

-   Accounts
-   Business profiles
-   Progress

System data:

-   Requirements
-   Rules
-   Registration steps

------------------------------------------------------------------------

# 3. Entity Relationship Overview

    USER

     1

     |

     M

    BUSINESS_PROFILE

     |

     |

     M

    USER_ROADMAP

     |

     |

     M

    ROADMAP_PROGRESS

     |

     |

    REGISTRATION_STEP


    BUSINESS_CATEGORY

     |

     |

    ROADMAP_RULE

     |

     |

    REGISTRATION_STEP


    REGISTRATION_STEP

     |

     |

    REQUIREMENT

     |

     |

    SOURCE_REFERENCE

------------------------------------------------------------------------

# 4. Core Tables

# 4.1 Users Table

Purpose:

Stores authenticated user information.

## Fields

  Field           Type        Description
  --------------- ----------- -----------------------
  user_id         UUID        Primary key
  email           VARCHAR     User email
  name            VARCHAR     User name
  auth_provider   VARCHAR     OAuth provider
  created_at      TIMESTAMP   Account creation date

------------------------------------------------------------------------

# 4.2 Business Profiles Table

Purpose:

Stores the user's business information.

## Fields

  Field           Type        Description
  --------------- ----------- -------------------
  business_id     UUID        Primary key
  user_id         UUID        Linked user
  business_name   VARCHAR     Business name
  category_id     UUID        Business category
  city_id         UUID        Business location
  status          VARCHAR     Planning/Started
  created_at      TIMESTAMP   Creation date

Relationship:

One user can have one business profile in MVP.

Future:

One user can have multiple businesses.

------------------------------------------------------------------------

# 4.3 Business Categories Table

Purpose:

Stores supported business classifications.

Examples:

-   Food and Beverage
-   Retail
-   Services

## Fields

  Field           Type
  --------------- ---------
  category_id     UUID
  category_name   VARCHAR
  description     TEXT

------------------------------------------------------------------------

# 4.4 Cities Table

Purpose:

Stores supported locations.

Initial records:

-   Quezon City
-   Manila
-   Pasig

## Fields

  Field       Type
  ----------- ---------
  city_id     UUID
  city_name   VARCHAR
  region      VARCHAR

------------------------------------------------------------------------

# 4.5 Registration Steps Table

Purpose:

Stores the registration journey steps.

Examples:

-   DTI Registration
-   Barangay Clearance
-   Mayor's Permit
-   BIR Registration

## Fields

  Field          Type
  -------------- ---------
  step_id        UUID
  step_name      VARCHAR
  agency         VARCHAR
  description    TEXT
  order_number   INTEGER

------------------------------------------------------------------------

# 4.6 Requirements Table

Purpose:

Stores required documents and conditions.

## Fields

  Field              Type
  ------------------ ---------
  requirement_id     UUID
  step_id            UUID
  requirement_name   VARCHAR
  description        TEXT
  source_id          UUID

------------------------------------------------------------------------

# 4.7 Source References Table

Purpose:

Stores research validation information.

## Fields

  Field           Type
  --------------- ---------
  source_id       UUID
  source_name     VARCHAR
  source_url      TEXT
  date_verified   DATE

------------------------------------------------------------------------

# 4.8 Roadmap Rules Table

Purpose:

Stores the dynamic roadmap logic.

This supports the backend-only rule engine.

Example:

Food business in Pasig:

Add sanitary requirements.

## Fields

  Field         Type
  ------------- ------
  rule_id       UUID
  category_id   UUID
  city_id       UUID
  condition     TEXT
  action        TEXT

------------------------------------------------------------------------

# 4.9 User Roadmaps Table

Purpose:

Stores generated registration journeys.

## Fields

  Field                 Type
  --------------------- -----------
  roadmap_id            UUID
  business_id           UUID
  progress_percentage   INTEGER
  created_at            TIMESTAMP

------------------------------------------------------------------------

# 4.10 Roadmap Progress Table

Purpose:

Tracks completion of individual steps.

## Fields

  Field            Type
  ---------------- ---------
  progress_id      UUID
  roadmap_id       UUID
  step_id          UUID
  status           VARCHAR
  completed_date   DATE

Status examples:

-   Not Started
-   In Progress
-   Completed

------------------------------------------------------------------------

# 5. Relationships

## User → Business Profile

Relationship:

One-to-One (MVP)

Future:

One-to-Many

------------------------------------------------------------------------

## Business Profile → Roadmap

Relationship:

One-to-Many

Reason:

A business may regenerate roadmaps after changes.

------------------------------------------------------------------------

## Roadmap → Progress

Relationship:

One-to-Many

Each roadmap contains multiple steps.

------------------------------------------------------------------------

## Registration Step → Requirement

Relationship:

One-to-Many

Each step can have multiple requirements.

------------------------------------------------------------------------

# 6. AI Data Flow

    User Description

    ↓

    Gemini Flash

    ↓

    Business Information Extraction

    ↓

    Business Profile

    ↓

    Roadmap Engine

    ↓

    User Roadmap

------------------------------------------------------------------------

# 7. Research Knowledge Base Flow

    Research Team

    ↓

    Validated Registration Data

    ↓

    Database Tables

    ↓

    Roadmap Rules

    ↓

    Generated User Journey

------------------------------------------------------------------------

# 8. Future Database Enhancements

Possible future tables:

## Documents

For uploaded evidence.

## Notifications

For renewal reminders.

## Admin Users

For knowledge base management.

## Chat History

For persistent AI conversations.

------------------------------------------------------------------------

# 9. Database-Related User Stories to Add

## TE-DB-001

Title: Create Database Structure

User Story:

As a developer, I want to create the database structure, So that AsikaGo
can store and retrieve application information.

------------------------------------------------------------------------

## TE-DB-002

Title: Store Registration Knowledge Base

User Story:

As a researcher, I want to store validated registration information, So
that the roadmap engine can generate accurate guidance.

------------------------------------------------------------------------

# Next Artifact

Recommended next document:

AsikaGo API Specification v1.0

Contents:

-   Backend endpoints
-   Request/response format
-   Authentication flow
-   Roadmap generation API
-   AI integration API
