# AsikaGo Product Requirements Document (PRD) v1.0

## Document Information

**Product Name:** AsikaGo\
**Document Type:** Product Requirements Document (PRD)\
**Version:** v1.0 Draft\
**Documentation Style:** Hybrid (Industry Product Documentation +
Academic Project Documentation)

------------------------------------------------------------------------

# 1. Product Overview

## 1.1 Product Background

AsikaGo is a web application designed to help aspiring Filipino
micro-entrepreneurs understand and navigate the business registration
process.

Many small business owners struggle because registration involves
multiple government agencies, different requirements, unclear
procedures, and location-specific processes. AsikaGo addresses this
challenge by transforming complicated registration information into a
personalized step-by-step roadmap.

The application focuses on guiding users rather than directly submitting
government applications on their behalf.

------------------------------------------------------------------------

# 2. Problem Statement

Aspiring entrepreneurs often experience difficulties when starting a
business because:

-   They do not know where to begin with registration.
-   Government requirements can be confusing and difficult to
    understand.
-   Registration processes differ depending on business type and
    location.
-   Users may waste time preparing incomplete requirements.
-   Existing information sources are often fragmented.

AsikaGo aims to reduce uncertainty by providing a structured and
personalized registration journey.

------------------------------------------------------------------------

# 3. Product Vision

> AsikaGo helps aspiring micro-entrepreneurs understand and navigate
> business registration by transforming confusing government
> requirements into a personalized step-by-step roadmap, allowing users
> to complete their registration journey with confidence.

## Core User Outcome

"I understand what I need to do, and I know what comes next."

------------------------------------------------------------------------

# 4. Product Goals

## Primary Goals

-   Provide personalized business registration guidance.
-   Help users understand required registration steps.
-   Reduce confusion regarding government requirements.
-   Present information in a simple and accessible way.

## Secondary Goals

-   Provide AI-assisted explanations.
-   Help users prepare documents.
-   Track registration progress.

------------------------------------------------------------------------

# 5. Target Users

## Primary Persona: Aspiring Micro-Entrepreneur

Description:

A Filipino individual planning to start a small business who needs
guidance regarding registration requirements.

Pain Points:

-   Does not know the registration process.
-   Unsure about required documents.
-   Confused about government procedures.
-   Wants a clear action plan.

------------------------------------------------------------------------

## Secondary Persona: Existing Small Business Owner

Description:

A small business owner who has started registration but needs assistance
tracking incomplete requirements.

------------------------------------------------------------------------

# 6. Product Scope

## Geographic Scope

Initial pilot coverage:

-   Quezon City
-   Manila
-   Pasig

This scope allows accurate research and location-specific guidance.

------------------------------------------------------------------------

## Business Categories

Initial supported categories:

-   Food and Beverage
-   Retail
-   Services

The MVP focuses on micro and small businesses.

------------------------------------------------------------------------

# 7. Product Strategy

## MVP Direction

AsikaGo follows an innovation-focused MVP approach.

The core experience:

Business description → Personalized registration roadmap → Document
preparation → Progress tracking → AI assistance

------------------------------------------------------------------------

# 8. Hero Feature

# Personalized Registration Roadmap

The main value proposition of AsikaGo is generating a guided
registration journey based on:

-   Business category
-   Business location
-   Registration status

The roadmap should adapt depending on the user's business.

Example:

Food business: - DTI Registration - Barangay Clearance - Food-related
requirements - Mayor's Permit - BIR Registration

Retail business: - DTI Registration - Barangay Clearance - Mayor's
Permit - BIR Registration

------------------------------------------------------------------------

# 9. User Journey

## Step 1: Business Assessment

The user describes their business information.

Collected information:

-   Business category
-   Business type
-   Location
-   Registration status

------------------------------------------------------------------------

## Step 2: Registration Preview

The user receives an initial overview of their possible registration
journey.

------------------------------------------------------------------------

## Step 3: Account Creation

The user creates an account to save progress.

------------------------------------------------------------------------

## Step 4: Personalized Roadmap

The system generates a detailed registration journey.

------------------------------------------------------------------------

## Step 5: Document Preparation

Users view requirements and track completion.

------------------------------------------------------------------------

## Step 6: AI Assistance

Users ask questions and receive understandable explanations.

------------------------------------------------------------------------

# 10. Functional Requirements

## FR-001 Business Assessment

The system shall allow users to provide business information before
account creation.

------------------------------------------------------------------------

## FR-002 User Account Management

The system shall allow users to create and manage an account.

------------------------------------------------------------------------

## FR-003 Business Profile Management

The system shall store user business information for personalization.

------------------------------------------------------------------------

## FR-004 Personalized Roadmap Generation

The system shall generate registration roadmaps based on business
information.

------------------------------------------------------------------------

## FR-005 Registration Step Details

The system shall display:

-   Registration purpose
-   Requirements
-   Actions
-   Reference information

------------------------------------------------------------------------

## FR-006 Progress Tracking

The system shall allow users to monitor registration completion.

------------------------------------------------------------------------

## FR-007 Document Checklist

The system shall display required documents for registration steps.

------------------------------------------------------------------------

## FR-008 AI Assistant

The system shall provide AI-assisted explanations using natural language
interaction.

------------------------------------------------------------------------

## FR-009 PDF Generation

The system may generate downloadable documents such as summaries or
checklists.

------------------------------------------------------------------------

## FR-010 Location Assistance

The system may provide government office information and map assistance.

------------------------------------------------------------------------

# 11. AI Strategy

## Proposed Technology

Gemini Flash (subject to technical validation).

------------------------------------------------------------------------

## AI Responsibilities

The AI layer will:

-   Understand business descriptions.
-   Extract structured business information.
-   Explain registration requirements.
-   Provide Taglish-friendly guidance.

------------------------------------------------------------------------

## AI Limitations

The AI will not:

-   Independently determine official requirements.
-   Replace researched registration data.
-   Provide unsupported legal guidance.

------------------------------------------------------------------------

# 12. Roadmap Generation Architecture

AsikaGo follows a hybrid approach.

## Source of Truth

Research-curated registration knowledge base.

Contains:

-   City information
-   Business categories
-   Registration steps
-   Requirements
-   Official references

------------------------------------------------------------------------

## Roadmap Flow

User Input

↓

Business Information Extraction

↓

Roadmap Decision Engine

↓

Personalized Registration Roadmap

↓

AI Explanation Layer

------------------------------------------------------------------------

# 13. Research Requirements

Research is a core product activity.

The research team will create and maintain:

## Registration Knowledge Base

Information includes:

-   DTI requirements
-   Barangay requirements
-   Mayor's Permit requirements
-   BIR requirements
-   Business category variations
-   City-specific differences

------------------------------------------------------------------------

# 14. Non-Functional Requirements

## Usability

The application should provide a simple and understandable experience
for non-technical users.

## Reliability

Registration information should be based on validated sources.

## Security

User information should be protected through appropriate authentication
and data handling practices.

## Maintainability

The system should allow future expansion to additional cities and
business categories.

------------------------------------------------------------------------

# 15. MVP Feature Prioritization

## Must Have

-   Business assessment
-   User account
-   Business profile
-   Personalized roadmap
-   Registration step details
-   Document checklist
-   Progress tracking
-   Research knowledge base

------------------------------------------------------------------------

## Should Have

-   AI Taglish Assistant
-   Business-specific roadmap adaptation
-   Government office information

------------------------------------------------------------------------

## Could Have

-   PDF generation
-   Map integration
-   Renewal reminders

------------------------------------------------------------------------

## Won't Have (MVP)

-   Nationwide coverage
-   Direct government submission
-   Payment processing
-   Community forum

------------------------------------------------------------------------

# 16. Risks and Constraints

## Research Accuracy

Government requirements may change over time.

Mitigation: Maintain documented sources.

------------------------------------------------------------------------

## Scope Expansion

Supporting too many cities or businesses may increase complexity.

Mitigation: Start with three cities and selected categories.

------------------------------------------------------------------------

## AI Reliability

AI responses may be inaccurate if not controlled.

Mitigation: Use AI with verified knowledge sources.

------------------------------------------------------------------------

# 17. Next Project Artifacts

Following the PRD, the next deliverables are:

1.  AsikaGo Product Backlog
2.  User Story Specifications with Acceptance Criteria
3.  Sprint Planning Document
4.  Research Knowledge Base Specification
5.  Technical Architecture Document
6.  Project Timeline/Gantt Plan
