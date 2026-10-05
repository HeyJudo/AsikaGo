# RS-001-01 — Registration workflow document

**Scope: Pasig City only** (decision D8). New registration of a micro business.

> Converted from RS-001.pdf (12 pages). Product Owner review on 2026-10-05 added the BIR step, official sources with access dates, "Unverified" markers, fixes to step labels and conflicting figures, and business-category tags. Original researcher content is kept unless a correction is noted.

**Status legend**

- **Verified (YYYY-MM-DD):** checked against the official source on that date.
- **Unverified:** no official source found or the official page could not be read. Keep it, but do not show it to users as fact.

## Contents

- [Step summary (seed names)](#step-summary-seed-names)
- [Registration workflow](#registration-workflow)
- [Notes](#notes)
- [Other Special Requirements Specific to Line of Business](#other-special-requirements-specific-to-line-of-business)
- [Sources](#sources)
- [Review changes](#review-changes)

## Step summary (seed names)

Use the **Seed name** column as `registration_steps.name`. 1A and 1B share sort order 1 because the business type decides which one applies.

| Order | Seed name | Agency | Applies to | Status |
|---|---|---|---|---|
| 1A | DTI Business Name Registration | DTI | Sole Proprietorship | Verified (2026-10-05) |
| 1B | SEC Company Registration | SEC | Partnership, Corporation, One Person Corporation | Verified (2026-10-05) |
| 2 | Barangay Business Clearance | Barangay of the business address | All | Verified (2026-10-05). Barangay-level details Unverified |
| 3 | Certificate of Conformance | Pasig CPDO, Zoning Division | All, except mall / Ortigas CBD (see step) | Verified (2026-10-05) |
| 4 | FSIC for Occupancy | BFP Pasig | Only if the place was newly built or renovated | Verified (2026-10-05). Requirements Unverified |
| 5 | Business Permit Application (UBAF) | Pasig BPLD | All | Verified (2026-10-05) |
| 6 | Tax Order of Payment | Pasig BPLD | All | Verified (2026-10-05) |
| 7 | Payment of Local Business Taxes and Fees | City Treasurer's Office | All | Verified (2026-10-05) |
| 8 | Ancillary Permits at BOSS | BFP, City Health, CENRO, others | All (contents depend on category) | Verified (2026-10-05). CENRO Unverified |
| 9 | Business Permit Release | Pasig BPLD | All | Verified (2026-10-05) |
| 10 | BIR Registration | BIR | All | Verified (2026-10-05) |

## Registration workflow

### Step 1A — Register Business Name through BNRS

**Agency:** Department of Trade and Industry

**Applies to:** Sole Proprietorship only

**Output:** Certificate of Business Name Registration (CBNR)

**Where:** Online: Business Name Registration System (BNRS)

**Fee:** By territorial scope:

| Territorial scope | Fee |
| --- | --- |
| Barangay | ₱200 |
| City/Municipality | ₱500 |
| Regional | ₱1,000 |
| National | ₱2,000 |

\*Additional ₱30 documentary stamp tax. Late filing adds 50%. Registration is valid for 5 years.

**Processing Time:** Fees must be paid within **7 calendar days** of applying or the application is deemed abandoned. The CBNR is emailed after payment is processed, usually within minutes to a few hours (Unverified: timing is not stated on the official page).

**Source:** [BNRS Registration Guide](https://bnrs.dti.gov.ph/resources/registration-guide) (payment deadline), [BNRS FAQ](https://bnrs.dti.gov.ph/faq) (fees, DST, validity), [BNRS portal](https://bnrs.dti.gov.ph/registration/create). Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

### Step 1B — Company registration with SEC

**Agency:** Securities and Exchange Commission (SEC)

**Applies to:** Partnership, Corporation, One Person Corporation (OPC)

**Output:** Certificate of Incorporation (corporation/OPC) or Certificate of Recording (partnership)

**Where:** Online: eSPARC ([esparc.sec.gov.ph](https://esparc.sec.gov.ph)). OneSEC accepts domestic stock corporations only (OPC, or 2 to 15 incorporators). Partnerships and all other types use Regular Processing.

**Fee:** Varies by structure and capital. eSPARC generates the Payment Assessment Details (PAD).

**Processing Time:** OneSEC aims for one-day approval. Regular Processing: allow **7 working days** for review.

**Source:** [SEC eSPARC Regular Processing User Guide](https://esparc.sec.gov.ph/docs/UserGuide-esparc.pdf), [eSPARC name verification](https://esparc.sec.gov.ph/application/name-verification). Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

### Step 2 — Secure Barangay Business Clearance

**Agency:** Barangay where the business is located

**Applies to:** All types

**Output:** New Barangay Business Clearance

**Where:** In person at the barangay hall

**Fee:** Brgy. San Antonio, which the researcher was told applies city-wide: ₱12.10 per sqm of space use (minimum ₱121.00 below 10 sqm) and ₱220 for the business plate. **Unverified** (from a Brgy. San Antonio Facebook post, not re-checked).

**Processing Time:** Same-day issuance. **Unverified.**

**Source:** That a new barangay business clearance is required: [Pasig BPLD Citizen's Charter 2025](https://assets.pasigcity.gov.ph/storage/attachments/business_permit_and_licensing_department/686768e6a0f0a1751607526Citizen_s%20Charter%20English.pdf), item A.3. Accessed 2026-10-05. Barangay-level requirements and fees: see `requirements-pasig.md`, section 2.

**Status:** Requirement verified (2026-10-05). Fees and processing time Unverified.

### Step 3 — Obtain Certificate of Conformance

**Agency:** Pasig City Planning and Development Office (CPDO), Zoning Division

**Applies to:** All types. Exception: businesses in malls and in the Ortigas Central Business District apply for a CBD stub instead (**Unverified**, see `requirements-pasig.md` Step 3).

**Output:** Certificate of Conformance (CoC)

**Where:** CPDO, Pasig City Hall, or online through the Pasig City CLIMA portal

**Fee:** Free. Confirmed by the researcher on 2026-10-05. The older CPDO charter (Feb 2024) listed ₱725.00 for a walk-in new business. Treat that figure as superseded.

**Processing Time:** Same-day walk-in. Each CPDO action takes 5 to 15 minutes per the CPDO charter. The researcher's 3 to 7 working days for CLIMA online applications is **Unverified**.

**Source:** [Pasig CPDO Citizen's Charter (Feb 2024)](https://assets.pasigcity.gov.ph/storage/attachments/city_planning_and_development_office/662a10cbbeaed1714032843Tagalog.pdf), [CLIMA portal](https://clima.pasigcity.gov.ph/clima/PublicConformance). Accessed 2026-10-05. The BPLD 2025 charter requires an updated CoC "per 2024 Pasig Zoning Ordinance".

**Status:** Verified (2026-10-05)

### Step 4 — Acquire Fire Safety Inspection Certificate for Occupancy

**Agency:** BFP - Pasig City

**Applies to:** Only if the applicant built or renovated the place of business. This is **not** the FSIC for Business Permit in Step 8.

**Output:** FSIC for Occupancy

**Where:** Fire Safety Inspection System (FSIS) Portal

**Fee:** Fire Safety Inspection Fee (FSIF) = 15% of all fees charged by the LGU or PEZA, minimum ₱500. If the LGU/PEZA assessment is zero, the FSIF is zero.

**Processing Time:** Up to 3 to 7 working days. **Unverified.**

**Source:** [BFP NCR FAQ on FSEC/FSIC fees](https://ncr.bfp.gov.ph/wp-content/uploads/2024/02/faq3.pdf), [FSIS portal](https://fsis.e-bfp.com/). Accessed 2026-10-05.

**Status:** Fee verified (2026-10-05). Processing time and requirement list Unverified.

### Step 5 — Fill up the Unified Business Application Form (UBAF) and Submission of Requirements

**Agency:** Pasig BPLD (Business Permit and Licensing Department)

**Applies to:** All types

**Output:** Filed application, reviewed by BPLD

**Where:** In person at BPLD Admin (Temporary City Hall, Bridgetowne, Rosario) or a BPLD annex (Ayala Malls the 30th, Robinsons Metro East, Mutya ng Pasig Mega Market). There is no online filing for new registration. The UBAF can be downloaded, and hard copies are at BPLD offices.

**Fee:** None at this step

**Processing Time:** The whole new-registration transaction (Steps 5 and 6) is 90 minutes per the charter.

**Source:** [Pasig BPLD Citizen's Charter 2025](https://assets.pasigcity.gov.ph/storage/attachments/business_permit_and_licensing_department/686768e6a0f0a1751607526Citizen_s%20Charter%20English.pdf), section A. [UBAF form](https://assets.pasigcity.gov.ph/storage/downloadables/2024/12/27/676eb0e3d77c11735307491BPLD%20UAF%20Final.pdf). Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

### Step 6 — Acquire Tax Order of Payment

**Agency:** Pasig BPLD (Business Permit and Licensing Department)

**Applies to:** All types

**Output:** Tax Order of Payment (TOP)

**Where:** Same BPLD office or annex

**Fee:** Free

**Processing Time:** BPLD reviews, encodes, approves and issues the TOP (about 15 minutes per action, part of the 90 minutes).

**Source:** Pasig BPLD Citizen's Charter 2025, section A, steps 4 and 5. Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

### Step 7 — Pay local business taxes and fees

**Agency:** City Treasurer's Office (Cashier)

**Applies to:** All types

**Output:** Official Receipt (O.R.)

**Where:** Pasig City cashier

**Fee:** Depends on the business (local business tax and regulatory fees listed on the TOP).

**Processing Time:** Not stated in the charter.

**Source:** Pasig BPLD Citizen's Charter 2025, section A ("Proceed to the cashier for payment"). Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

### Step 8 — Process Ancillary permits and clearances via BOSS

**Agency:** Pasig City BOSS (Business One-Stop Shop), with BFP, City Health Department, CENRO and others as needed

**Applies to:** All types. Which permits are needed depends on the business category and line of business.

**Output:** FSIC for Business Permit, Sanitary Permit, CENRO clearance (if applicable), line-of-business clearances

**Where:** BOSS counters at the BPLD offices and annexes

**Fee:** Varies by permit. See [Step 8 permits](#step-8-permits).

**Processing Time:** Not stated.

**Source:** Pasig BPLD Citizen's Charter 2025, section A ("Proceed to BOSS to secure other ancillary permits or clearances"). Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

### Step 9 — Claim of Business Permit and Sticker

**Agency:** Pasig BPLD

**Applies to:** All types

**Output:** Business Permit (Mayor's Permit), business plate and stickers

**Where:** BPLD Admin (Temporary City Hall, Bridgetowne, Rosario) or BPLD annexes. Corrected from "Pasug BOSS" and "Pasig City Hall".

**Requirements:**

- Photocopy of the approved UBAF with the approvals or signatures of all regulatory offices on the back
- Valid FSIC, or the UBAF showing the FSIC details and validity
- Updated Certificate of Conformance (per the 2024 Pasig Zoning Ordinance)
- Current TOP and Official Receipt (for checking)

Clearances from other regulatory offices that are still pending may be submitted after release, within the period printed on the back of the permit.

**Fee:** Free

**Processing Time:** 75 minutes

**Source:** Pasig BPLD Citizen's Charter 2025, section D. Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

### Step 10 — BIR Registration

Added in review. The ticket required it and the PRD's example roadmaps include it.

**Agency:** Bureau of Internal Revenue (BIR), Revenue District Office (RDO) with jurisdiction over the business address. Pasig is RDO 43 (**Unverified**, secondary source only).

**Applies to:** All types. BIR Form 1901 for Sole Proprietorship. BIR Form 1903 for Partnership, Corporation and OPC.

**Output:** Certificate of Registration (COR, BIR Form 2303), registered books of accounts, and invoices (BIR Printed Invoice or Authority to Print)

**Where:** Online through ORUS ([orus.bir.gov.ph](https://orus.bir.gov.ph)) or walk-in at the RDO New Business Registrant Counter

**When:** On or before the start of business, which is the first sale or within 30 calendar days from the issuance of the Mayor's Permit or the DTI CBNR. A sole proprietor may do this right after Step 1A.

**Requirements:**

- Sole Proprietorship: any government-issued ID showing name, address and birthdate (a selfie holding the ID for online applications)
- Partnership, Corporation, OPC: SEC Certificate of Incorporation or Certificate of Recording, plus Articles of Incorporation or Partnership
- BIR Printed Invoice (bought at the RDO), or a final sample of the business's own invoices
- Special Power of Attorney if filed by a representative
- Books of accounts: registered online through ORUS, which generates a QR stamp for the first page, or walk-in with BIR Form 1905.

**Fee:** ₱30 documentary stamp tax on the COR, plus the cost of BIR Printed Invoices if used. The ₱500 Annual Registration Fee is no longer collected (Ease of Paying Taxes Act, RA 11976). Books of accounts registration is free.

**Processing Time:** Online through ORUS: 3 days. Walk-in: 1 day. Books of accounts (walk-in): 1 day.

**Source:** [BIR Citizen's Charter 2026 Edition](https://bir-cdn.bir.gov.ph/BIR/pdf/BIR%20Citizen's%20Charter%20(2026%20Edition)%20final.pdf), services 6 to 11 and 17. [BIR Checklist of Documentary Requirements (rev. Jul 2025)](https://bir-cdn.bir.gov.ph/BIR/pdf/CDR%20-%202025%20(1).pdf), CDR F1101, F1103 and F1105B. Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

## Notes

### Step 1A

The Territorial Scope refers to the extent of the geographical area within which the pertinent business may locate its offices, stores, shops, branches, manufacturing or processing plants, or other business structures, or where the pertinent business name may be used without prejudice to engaging in business elsewhere. It is not to be considered as the geographical limit in which to transact business.

### Step 1B

On the SEC-eSPARC portal, OneSEC (Zuper Easy Registration Online / ZERO) and Regular Processing are the two registration pathways, the differences are as follows:

| Comparison | OneSEC (ZERO) | Regular Processing |
| --- | --- | --- |
| Application | 1-Day Approval for Domestic Stock Corporations | Flexible Structure (Accommodates complex/specialized businesses) |
| Turnaround Time | 1 Working Day (Instant upon online payment) | Up to 7 Working Days (Requires manual SEC officer review) |
| Eligible Entity Types | Domestic Stock Corporations ONLY (Including OPCs and corporations with 2 to 15 incorporators) | All Entity Types (Non-Stock, Partnerships, Foreign Corporations, Licensing, Stock) |
| Articles & By-Laws | Pre-formatted / Standardized (Cannot edit clauses or purposes outside predefined selections) | Customizable (Supports custom primary/secondary purposes and custom corporate clauses) |
| Document Signatures | Digital Authentication via eSECURE / eSAP (100% paperless) | Physical Notarization (Must upload signed/notarized PDF copies) |

Review fixes: the original table said "Stock and Non-Stock" under OneSEC, which contradicts its own eligibility row, and "5 to 7" days, which contradicts Step 1B. Both now follow the SEC eSPARC pages.

### DTI vs SEC

| Comparison | DTI | SEC |
| --- | --- | --- |
| Target | Business name registration for sole proprietors | Registration for partnerships and corporations |
| Ownership | One individual owner | Multiple owners or a corporate structure |
| Legal entity | One-person business operating under a business name | Separate entity structure, shared ownership, governance, or growth plans |
| Liability | Unlimited personal liability for business debts | Limited liability protected by the corporate structure |
| Business Name Restriction | Cannot use "Corporation", "Company", "Incorporated", or "Inc." | Exclusively grants rights to use "Corp", "Inc.", "Corporation", or "Company" |
| Process | Simplicity and faster initial setup | Structure, ownership rules, continuity, and scale |

### Step 5

Relabeled from "Step 4" in the original. These are the Step 5 (UBAF) requirements.

#### Lists of Requirements

Per the Pasig BPLD Citizen's Charter 2025, section A. Bring originals and at least one set of clear photocopies.

| Requirement | Where / Provided by | Status |
| --- | --- | --- |
| Unified Business Application Form (UBAF) | Downloadable from the Pasig City website. Hard copies at all BPLD offices/annexes | Verified (2026-10-05) |
| DTI Certificate (Step 1A) | Department of Trade and Industry | Verified (2026-10-05) |
| SEC Certificate and Articles of Incorporation/Partnership (Step 1B) | Securities and Exchange Commission | Verified (2026-10-05) |
| New Barangay Business Clearance (Step 2) | Barangay having jurisdiction over the place of business | Verified (2026-10-05) |
| Certificate of Conformance (Step 3) | City Planning and Development Office | Verified (2026-10-05) |
| Proof of Authority to Use: lease contract, sub-lease contract, or certificate of non-rental | Provided by applicant | Verified (2026-10-05) |
| Special Power of Attorney / Secretary's Certificate / Authorization Letter with government ID (if filed by a representative) | Provided by applicant | Verified (2026-10-05) |
| Other requirements depending on the line of business | Regulatory (national) government offices. See [line of business](#other-special-requirements-specific-to-line-of-business) | Verified (2026-10-05) |
| FSIC for Occupancy (if the place was built or renovated) (Step 4) | Bureau of Fire Protection, Pasig City | Not in the 2025 checklist. Unverified at this step |
| Colored picture of the place of business (front view, 2R) | Provided by taxpayer | Not in the 2025 checklist. Unverified |
| Location map of the place of business (2R) | Provided by taxpayer | Not in the 2025 checklist. Unverified |
| HOA / Building Admin Certificate or Clearance (to conduct business) | Homeowners' Association / Building Admin | Not in the 2025 BPLD checklist. CPDO asks for it at Step 3 for businesses inside subdivisions |

The CDA Certificate row (cooperatives) is dropped: AsikaGo does not offer the Cooperative business type.

### Step 8 permits

Relabeled from "Step 7" in the original. These permits are processed at BOSS in Step 8.

#### FSIC for Business Permit

Different certificate from the Step 4 FSIC for Occupancy.

**Applies to:** All businesses applying for a Business Permit

**Where:** BFP - Pasig City, BFP FSIS Portal

**Fee:** Fire Safety Inspection Fee = **15%** of all fees charged by the LGU (listed on the TOP), minimum ₱500. Corrected from "10% Fire Code Fee".

**Source:** [BFP NCR FAQ](https://ncr.bfp.gov.ph/wp-content/uploads/2024/02/faq3.pdf), [FSIS portal](https://fsis.e-bfp.com/). Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

#### Sanitary Permit

**Applies to:** All businesses. The Health Certificate tests differ for food and non-food establishments (see `requirements-pasig.md`).

**Where:** Pasig City Health Department, Environmental Sanitation Section

**Fee:** Health Certificate fee ₱70.00, including a ₱20.00 seminar fee, already included in the TOP. Validation fee ₱50.00 per person if the medical exam was not done at the Pasig One Stop Shop Clinic (5th floor). Sanitary fee depends on the line of business and is included in the TOP.

**Process:** A Temporary Sanitary Permit is issued on presenting the current-year Business Permit, TOP and OR. The original Sanitary Permit follows once the Minimum Sanitary Requirements and Health Certificates are complete.

**Source:** [Pasig CHD Environmental Sanitation Section Citizen's Charter](https://assets.pasigcity.gov.ph/storage/attachments/pasig_city_health_department/633e8116ded771665040662EDITED%20CHO%20Environmental%20Sanitation%20Section.pdf). Accessed 2026-10-05.

**Status:** Verified (2026-10-05)

#### CENRO / EPO

- Environmental Compliance Certificate
- Certificate of Non-Coverage
- Waste Water Discharge Permit
- Permit To Operate
- Hazardous Waste Generator ID
- Pollution Control Officer Accreditation

**Applies to:** Business establishments generating waste, hazardous materials, or operating pollution sources (commercial and industrial)

**Where:** City Environment and Natural Resources Office (CENRO)

**Fee:** Included in the TOP

**Process:** In person at the Business One-Stop Shop (BOSS)

**Status:** **Unverified.** No official Pasig CENRO source found.

## Other Special Requirements Specific to Line of Business

Submitted with the UBAF at Step 5 and checked at BOSS in Step 8. The list matches the Pasig BPLD Citizen's Charter 2025, section J (accessed 2026-10-05), except where noted.

**Category** maps each line to the database categories: Food and Beverage, Retail, Services. **MVP** says whether the line is a typical micro business that AsikaGo should cover now:

- **Yes:** cover it now.
- **Partial:** only the smaller variants listed fit.
- **No:** leave it out of the seed.

| Line of business | Special requirement | Category | MVP |
|---|---|---|---|
| Meat Market group: restaurants, fast food, canteens, carinderia, eateries, catering, lechon houses, food stands/stalls/kiosks, ambulant vendors | Veterinary Clearance from the City Veterinary Office | Food and Beverage | Yes |
| Meat Market group: meat shops/stalls, supermarkets, grocery and convenience stores, online meat sellers | Veterinary Clearance from the City Veterinary Office | Retail | Yes |
| Restobar, Cocktail Lounge, Beer House, Night Club | 200 m away from public institutions, schools, churches. Health Certificates for all workers. Working permit of personnel. Fire Safety Certificate | Food and Beverage | Partial (restobar, beer house) |
| Water Refilling Station | Certification of Water Potability from the City Health Department / Certification of Sanitary Inspection | Food and Beverage | Yes |
| Food Products Manufacturing | FDA License | Food and Beverage | Yes |
| Pharmacy / Drugstore, Beauty Products Manufacturing | FDA License | Retail | Yes |
| Pet Shops | Animal Certification of Registration from the Bureau of Animal Industry. Veterinary Clearance from the City Veterinary Office | Retail | Yes |
| LPG Dealers | DOE Accreditation. Public hearing documents at Step 3 (Pasig Ordinance No. 23 s. 2017) | Retail | Yes |
| Gasoline Station | DOE Accreditation. Public hearing documents at Step 3 | Retail | No |
| Junkshop | Lot area of at least 100 sqm. Lot title of owner, or lease contract plus TCT of lessor | Retail | Yes |
| Auto Repair, Electronics, Radio, Electrical Equipment Shop | DTI Accreditation Certificate | Services | Yes |
| Vulcanizing Shop, Carwash, Auto Repair Shop | Lot area of at least 100 sqm. Lot title of owner, or lease contract plus TCT of lessor | Services | Yes |
| Grooming Facilities, Veterinary Clinic and Hospital, Kennels | Veterinary Clearance from the City Veterinary Office. Vet clinics also need the BAI Certification of Registration | Services | Yes |
| Companies/Partnerships Exercising Profession | PRC License, PTR | Services | Yes |
| Real Estate Lessor | Proof of Ownership | Services | Yes |
| Pawnshop / Money Changer / Remittance Agency / Foreign Exchange Dealer | Certification to Operate from Bangko Sentral ng Pilipinas | Services | Partial (remittance agent) |
| Lending Institution | License to Operate from SEC | Services | Partial (Corporation only) |
| Rent-A-Car / Transport Services | LTO Franchise | Services | Partial |
| Travel Agencies | Researcher: DOT Accreditation per PCG Ordinance No. 28, Series of 2025. The 2025 charter text differs ("Large Scale"). **Unverified** | Services | Partial |
| Birthing Homes, Lying-in Clinic | Endorsement from City Health Department | Services | No |
| School / Education Institution | DepEd or CHED Accreditation | Services | No |
| Security Agency | PNP Clearance / PCSUCIA National License (Camp Crame) | Services | No |
| Manning / Crewing Service | License to Operate from DOLE | Services | No |
| Recruitment / Manpower Agencies | License to Operate from DOLE or POEA (now DMW), as the case may be | Services | No |
| SER engaged in Construction Business | Certification of the Philippine Construction Accreditation Board | Services | No |
| Hotels | Tax Bill and OR for the current year. Surety Bond. Previous Travel License Permit | Services | No |
| PAGCOR Allowed Activities | At least 200 m from public institutions, schools, churches. "No Objection" certification from the City Council. PAGCOR Accreditation | Services | No |
| Warehouse / Depot | Certification stating the type of commodity to be stored | Services | No |
| Companies Dealing in Firearms, Ammunition, and Explosives | License to Operate from the Firearms and Explosive Unit (Camp Crame) | Retail | No |
| Animal Facilities (farms, zoos, aviaries, apiaries, racetracks, cockpits, stables, pounds, livestock markets, quarantine stations) and Animal Events/Shows | Veterinary Clearance from the City Veterinary Office | n/a | No |
| Meat Establishments: slaughterhouse, poultry dressing plant, hog/cattle dealer, cold storage warehouse, meat depot, meat cutting/processing plant | Veterinary Clearance from the City Veterinary Office | n/a | No |
| Chemical Manufacturing Plants | ECC, LLDA Permit, Zoning / Valid Temporary Use Permit from LGU | n/a | No |
| Cooperative | CDA Accreditation | n/a | No (business type not offered) |

Notes:

- **Unverified:** the charter lists eateries, groceries and supermarkets under "Meat Market". This doc reads that as "only if the business sells or handles meat". Confirm with BPLD before the roadmap states it as a rule.
- The original split one charter row in two ("Food and Beauty Products Manufacturing"). Here it is split by category, with the same requirement.

## Sources

All accessed 2026-10-05.

| Source | Owner | Used for |
|---|---|---|
| [Pasig BPLD Citizen's Charter 2025 (updated 4 March 2025)](https://assets.pasigcity.gov.ph/storage/attachments/business_permit_and_licensing_department/686768e6a0f0a1751607526Citizen_s%20Charter%20English.pdf) | Pasig City | Steps 2, 5 to 9, office locations, line of business |
| [Pasig CPDO Citizen's Charter (Feb 2024)](https://assets.pasigcity.gov.ph/storage/attachments/city_planning_and_development_office/662a10cbbeaed1714032843Tagalog.pdf) | Pasig City | Step 3 |
| [Pasig CLIMA portal](https://clima.pasigcity.gov.ph/clima/PublicConformance) | Pasig City | Step 3 online filing (link live, content not readable) |
| [Pasig UBAF](https://assets.pasigcity.gov.ph/storage/downloadables/2024/12/27/676eb0e3d77c11735307491BPLD%20UAF%20Final.pdf) | Pasig City | Step 5 |
| [Pasig CHD Environmental Sanitation charter](https://assets.pasigcity.gov.ph/storage/attachments/pasig_city_health_department/633e8116ded771665040662EDITED%20CHO%20Environmental%20Sanitation%20Section.pdf) | Pasig City | Step 8 Sanitary Permit |
| [BNRS Registration Guide](https://bnrs.dti.gov.ph/resources/registration-guide), [BNRS FAQ](https://bnrs.dti.gov.ph/faq) | DTI | Step 1A |
| [SEC eSPARC User Guide](https://esparc.sec.gov.ph/docs/UserGuide-esparc.pdf) | SEC | Step 1B |
| [BFP NCR FAQ on fees](https://ncr.bfp.gov.ph/wp-content/uploads/2024/02/faq3.pdf), [FSIS portal](https://fsis.e-bfp.com/) | BFP | Steps 4 and 8 |
| [BIR Citizen's Charter 2026](https://bir-cdn.bir.gov.ph/BIR/pdf/BIR%20Citizen's%20Charter%20(2026%20Edition)%20final.pdf), [BIR CDR (rev. Jul 2025)](https://bir-cdn.bir.gov.ph/BIR/pdf/CDR%20-%202025%20(1).pdf), [ORUS](https://orus.bir.gov.ph) | BIR | Step 10 |

Broken link: `www.pasigcity.gov.ph/downloadable-forms` (cited by both Pasig charters) returned 404 on 2026-10-05. Use the direct UBAF link above.

## Review changes

| Change | Why |
|---|---|
| Added Step 10, BIR Registration | Required by RS-001-01 and the PRD |
| Step 3 fee kept as Free | Researcher confirmed on 2026-10-05. The ₱725.00 in the Feb 2024 CPDO charter is superseded |
| Step 8 FSIC fee changed from 10% to 15%, minimum ₱500 | BFP NCR FAQ |
| BNRS payment window fixed to 7 calendar days | BNRS Registration Guide. RS-002 said working days |
| SEC Regular Processing fixed to 7 working days | SEC eSPARC User Guide. Notes said 5 to 7 |
| "Step 4" requirements table relabeled to Step 5. "Step 7" permits table relabeled to Step 8 | They described those steps |
| Step 9 location and requirements updated | BPLD 2025 charter section D. "Pasug BOSS" typo removed |
| Step 1B partnership output renamed to "Certificate of Recording" | BIR CDR F1103 wording |
| Added Category and MVP columns to the line-of-business table | RS-002-03 AC: requirements tagged with database category names |
| Added a status and access date to every step | RS-001-01 AC |
