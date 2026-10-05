# Handoff: Sprint 3 planning with Notion and Azure DevOps MCP

Paste everything below the line into a new agent session started at the repo root.

---

You are helping the Product Owner of AsikaGo plan Sprint 3. Sprint 2's tech tickets are done, and the Sprint 2 research (RS-001, RS-002) has been reviewed and fixed. Your job:

1. Connect the Notion MCP. Notion holds the official backlog list.
2. Connect the Azure DevOps MCP. Azure Boards holds the sprint tickets.
3. Draft the Sprint 3 ticket breakdown and get the PO's approval.
4. Only after approval, create the work items in Azure Boards.

## Read first, in this order

1. `AGENTS.md`: communication rules and operational boundaries. Follow them.
2. `README.md`
3. `docs/decisions.md`: wins over every other doc. Key items:
   - D1: structured `roadmap_rules`
   - D5: step order lives on `roadmap_rules.sort_order`
   - D6: knowledge-base data is SQL seed in `database/seed/`, applied through EF migrations
   - D8: Pasig City only
4. `docs/AsikaGo_Product_Backlog_v1.1.md`: Sprint 3 items are US-002 (Should), US-005, US-006, US-007, RS-003, TE-004 and TE-006.
5. `docs/AsikaGo_Sprint2_Ticket_Breakdown_v1.0.md`: use this as the **format template** for the Sprint 3 breakdown. Copy its ticket fields, its dependency flow and its workload table.
6. `docs/research/registration-workflow.md` (RS-001) and `docs/research/requirements-pasig.md` (RS-002). These are the input for the Sprint 3 seed data.
7. `backend/src/AsikaGo.Api/Data/Entities/`: the current schema, especially `RoadmapRule.cs`, `RegistrationStep.cs`, `Requirement.cs` and `SourceReference.cs`.

## Step 1: Connect the MCP servers

The user is on Windows. Ask them for anything you don't know. Don't guess org, project or page names.

**Notion** (official hosted server, OAuth):

```
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

Then have the user run `/mcp` and finish the Notion sign-in in the browser. Ask which Notion page or database is the official backlog.

**Azure DevOps** (Microsoft's official local server):

```
claude mcp add azure-devops -- cmd /c npx -y @azure-devops/mcp <organization-name>
```

Ask the user for the organization name, which is the `<org>` in `https://dev.azure.com/<org>`, and for the project name. The first tool call opens a browser sign-in. If sign-in fails, check the authentication options in the README at https://github.com/microsoft/azure-devops-mcp. Don't invent flags.

Both servers can be added with `--scope user` if the user wants them in every project. Ask first. Never write tokens or PATs into a repo file.

**Check each connection with read-only calls only:**

- Notion: find the backlog and list its items with ID, title, priority, points, sprint and status.
- Azure DevOps: list the project's iterations and check whether a Sprint 3 iteration exists. List the open work items and the Sprint 2 work items that are still not Done.

Tell the user which calls failed and why before going further.

## Step 2: Reconcile the backlog (report only)

Compare the Notion backlog, the Azure Boards items and `docs/AsikaGo_Product_Backlog_v1.1.md`. Report every difference in one table: missing items, different points, different sprint, different priority. Don't fix anything yet. The PO decides which source is right. The PO has said Notion is the official list.

## Step 3: Draft the Sprint 3 breakdown

Ask the PO for:

- Sprint 3 start and end dates
- The member assigned to each role: PO/Full Stack, Scrum Master/QA, Backend, Frontend/UI-UX, Research + AI
- Anything carried over from Sprint 2

Then write `docs/AsikaGo_Sprint3_Ticket_Breakdown_v1.0.md` in the Sprint 2 format. Include these inputs from the research review on 2026-10-05:

| Input | Why |
|---|---|
| Migration: add nullable `business_type` to `roadmap_rules` (null = any) | Step 1A (DTI) applies to Sole Proprietorship. Step 1B (SEC) applies to Partnership, Corporation and OPC. Rules can't express this today. Blocks TE-004 |
| Seed `registration_steps`, `requirements`, `source_references` and `roadmap_rules` for Pasig from the two research docs (D6, SQL via EF migration) | Use the "Seed name" column in `registration-workflow.md`. Seed only rows marked Verified or "Confirmed by researcher". Unverified items become "if applicable" step text or are left out. Line-of-business rows: only MVP "Yes" or "Partial" |
| Step 4 (FSIC for Occupancy) and the Step 3 mall/Ortigas exemption are conditional | Recommendation: no new assessment fields. Show them as "if applicable" text in the step description |
| Barangay clearance: one barangay documented, the researcher was told it's the same city-wide | No barangay field. Step 2 shows the typical list plus "Confirm at your barangay hall" |
| RS-003 carries open research questions | Does a sari-sari store count as a "food establishment" for Health Certificate tests? Does the "Meat Market" Veterinary Clearance apply only to businesses that handle meat? Is the mall/Ortigas CoC exemption real? Get written confirmation of the city-wide barangay requirements. Should an optional line-of-business field be added later? |
| RS-001-02: team review of the research docs | The docs in `docs/research/` are not committed yet. A PR with 2 reviewers is needed to close RS-001 |
| Keep the 3 categories. No category migration | RS-002-04 recommendation in `requirements-pasig.md`, section 4 |

Rules for the draft:

- Every ticket needs: ID, type, assignee (role), priority, estimate, due date, depends on, blocks, description and checkbox acceptance criteria.
- Story IDs follow the existing pattern (`US-005-BE-01`, `TE-004-01`, `RS-003-01`).
- Flag any role that goes over capacity, as the Sprint 2 doc did.
- Don't add features outside the Sprint 3 backlog items and the inputs above.
- Show the draft to the PO and wait for approval. Expect edits.

## Step 4: Create the work items (only after approval)

Creating items in Azure Boards or editing Notion is outward-facing. Before the first write, list exactly what you will create or change and get a yes.

- Create the Sprint 3 iteration if it is missing, using the PO's dates.
- Create one work item per user story or enabler, with child tasks for each ticket. Link parent and child. Set the iteration, priority, estimate and assigned role or member. Put the acceptance criteria in the description.
- Put the Azure Boards ID (`AB#123`) next to each ticket in the Sprint 3 doc. Commits and PRs reference tickets that way.
- Update the Notion backlog items to Sprint 3 and status "Planned", if the PO wants Notion kept in sync.
- Never delete or close existing items unless the PO asks.

## Done when

- [ ] Both MCP servers connect, and read-only checks pass.
- [ ] The reconciliation table is reported and the PO has decided each difference.
- [ ] `docs/AsikaGo_Sprint3_Ticket_Breakdown_v1.0.md` is approved by the PO.
- [ ] The approved tickets exist in Azure Boards under the Sprint 3 iteration, with AB# IDs recorded in the doc.
- [ ] You report what was created, with links, and anything you skipped.
