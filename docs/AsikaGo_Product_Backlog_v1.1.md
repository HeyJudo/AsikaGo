# AsikaGo Product Backlog v1.1

## Document Information

**Project:** AsikaGo\
**Document Type:** Agile Product Backlog\
**Version:** v1.1\
**Methodology:** Agile Scrum\
**Estimation Method:** Fibonacci Story Points

------------------------------------------------------------------------

# Backlog Purpose

The Product Backlog is the single source of truth for all AsikaGo
development work.

It contains: - Product user stories - Research stories - Technical
enabler stories - Acceptance criteria - Priorities - Fibonacci story
points - Sprint assignments - Assigned roles

Flow:

PRD → Product Backlog → Sprint Planning → Sprint Execution

------------------------------------------------------------------------

# Story Point Estimation

AsikaGo uses Fibonacci Story Points.

  Points   Meaning
  -------- --------------------------------------
  1        Very small task
  2        Small task
  3        Moderate complexity
  5        Medium complexity
  8        Large feature
  13       Very large story; consider splitting

Story points measure complexity, effort, uncertainty, and dependencies.

------------------------------------------------------------------------

# Backlog Database Fields

Every backlog item contains:

-   Story ID
-   Type
-   Epic
-   Feature
-   User Story
-   Acceptance Criteria
-   Priority
-   Story Points
-   Sprint
-   Assigned Member
-   Status

------------------------------------------------------------------------

# Product Stories Summary

  -------------------------------------------------------------------------------
  ID             Story               Points         Sprint         Priority
  -------------- ------------------- -------------- -------------- --------------
  US-001         Provide Business    5              Sprint 2       Must Have
                 Information                                       

  US-002         View Registration   3              Sprint 3       Should Have
                 Journey Preview                                   

  US-003         Create User Account 5              Sprint 2       Must Have

  US-004         Create Business     5              Sprint 2       Must Have
                 Profile                                           

  US-005         Generate            8              Sprint 3       Must Have
                 Personalized                                      
                 Registration                                      
                 Roadmap                                           

  US-006         View Registration   5              Sprint 3       Must Have
                 Step Information                                  

  US-007         Receive             5              Sprint 3       Must Have
                 Business-Specific                                 
                 Requirements                                      

  US-008         View Required       5              Sprint 4       Must Have
                 Documents                                         

  US-009         Track Document      3              Sprint 4       Must Have
                 Completion                                        

  US-010         Upload Document     5              Sprint 6       Could Have
                 Evidence                                          

  US-011         Track Registration  5              Sprint 4       Must Have
                 Progress                                          

  US-012         Extract Business    8              Sprint 5       Should Have
                 Information Using                                 
                 AI                                                

  US-013         Ask Registration    8              Sprint 5       Should Have
                 Questions                                         

  US-014         View Government     5              Sprint 6       Could Have
                 Office Information                                

  US-015         View Map Location   5              Sprint 6       Could Have
  -------------------------------------------------------------------------------

------------------------------------------------------------------------

# Research Stories Summary

  ID       Story                                   Points   Sprint
  -------- --------------------------------------- -------- ----------
  RS-001   Research Registration Workflow          5        Sprint 2
  RS-002   Research City Requirements              5        Sprint 2
  RS-003   Research Business Category Variations   5        Sprint 3

------------------------------------------------------------------------

# Technical Stories Summary

  ID       Story                        Points   Sprint
  -------- ---------------------------- -------- ----------
  TE-001   Project Architecture Setup   3        Sprint 2
  TE-002   Database Design              5        Sprint 2
  TE-003   AI Integration Setup         5        Sprint 5
  TE-004   Build Roadmap Rule Engine    8        Sprint 3
  TE-005   Authentication Setup         5        Sprint 2
  TE-006   API Development              8        Sprint 3

------------------------------------------------------------------------

# Example Detailed User Story

## US-001 --- Provide Business Information

Feature: Business Assessment

User Story:

As an aspiring micro-entrepreneur,\
I want to provide my business details, location, and registration
status,\
so that AsikaGo can understand my situation and provide relevant
guidance.

Priority: Must Have

Story Points: 5

Sprint: Sprint 2

Assigned Role: Product Owner + Frontend/UI UX Developer

Acceptance Criteria:

-   User can enter business category, business type, location, and
    registration status.
-   Required fields are validated.
-   Submitted information is stored for future roadmap generation.

------------------------------------------------------------------------

# Backlog Refinement Rule

Stories estimated at 13 points or higher should be reviewed and split
into smaller deliverable stories.

The Product Backlog remains the source of truth for sprint planning.
