# RS-002-03 — Pasig City requirements (deep dive)

**Scope: Pasig City only** (decision D8). New registration of a micro business. Step names and numbers follow `registration-workflow.md` (RS-001).

> Converted from RS-002.pdf (11 pages). Product Owner review on 2026-10-05 added the BPLO/portal summary, barangay findings, a requirements table tagged by database category, the RS-002-04 category recommendation, the BIR step, and official sources. Original researcher content is kept in [section 5](#5-detailed-process-per-step) unless a correction is noted.

**Status legend**

- **Verified (YYYY-MM-DD):** checked against the official source on that date.
- **Unverified:** no official source found, or the official page could not be read.

## Contents

1. [Pasig BPLO process and online portals](#1-pasig-bplo-process-and-online-portals)
2. [Barangay clearance across Pasig barangays](#2-barangay-clearance-across-pasig-barangays)
3. [Requirements by step and category](#3-requirements-by-step-and-category)
4. [Category check (RS-002-04)](#4-category-check-rs-002-04)
5. [Detailed process per step](#5-detailed-process-per-step)

## 1. Pasig BPLO process and online portals

Pasig's office is the **Business Permit and Licensing Department (BPLD)**. Source: [Pasig BPLD Citizen's Charter 2025, updated 4 March 2025](https://assets.pasigcity.gov.ph/storage/attachments/business_permit_and_licensing_department/686768e6a0f0a1751607526Citizen_s%20Charter%20English.pdf). Accessed 2026-10-05. **Verified.**

**City process (charter section A, then D):**

1. Download and fill out the UBAF.
2. Secure the Barangay Business Clearance (Step 2).
3. Secure the Certificate of Conformance from CPDO (Step 3).
4. File the UBAF with complete requirements at a BPLD office or annex (Step 5). BPLD reviews and approves it, then encodes and approves the Tax Order of Payment.
5. Receive the TOP (Step 6).
6. Pay at the cashier (Step 7).
7. Go to BOSS for ancillary permits and clearances (Step 8).
8. Claim the Business Permit, plate and stickers (Step 9).

New registration takes 90 minutes, and permit release takes 75 minutes, per single transaction on regular days. Expect longer during the January renewal period.

**Online portals:**

| Portal | URL | Used for | Status |
|---|---|---|---|
| None for BPLD new registration | n/a | Filing is in person. Only the UBAF form is online | Verified (2026-10-05) |
| UBAF download | [UBAF PDF](https://assets.pasigcity.gov.ph/storage/downloadables/2024/12/27/676eb0e3d77c11735307491BPLD%20UAF%20Final.pdf) | Step 5 form | Verified (2026-10-05), link live |
| Pasig CLIMA | [clima.pasigcity.gov.ph](https://clima.pasigcity.gov.ph/clima/PublicConformance) | Step 3 CoC online application | Link live (2026-10-05). Content not readable, so details are Unverified |
| BFP FSIS | [fsis.e-bfp.com](https://fsis.e-bfp.com/) | Steps 4 and 8 FSIC | Link live (2026-10-05) |
| DTI BNRS | [bnrs.dti.gov.ph](https://bnrs.dti.gov.ph/registration/create) | Step 1A | Verified (2026-10-05) |
| SEC eSPARC | [esparc.sec.gov.ph](https://esparc.sec.gov.ph) | Step 1B | Verified (2026-10-05) |
| BIR ORUS | [orus.bir.gov.ph](https://orus.bir.gov.ph) | Step 10 | Verified (2026-10-05) |

`www.pasigcity.gov.ph/downloadable-forms`, which both Pasig charters cite, returned 404 on 2026-10-05.

**Offices** (charter contact section):

| Office | Location |
|---|---|
| BPLD Admin and BPLD Bridgetowne | Temporary Pasig City Hall, Eulogio Amang Rodriguez Ave., Bridgetowne, Brgy. Rosario |
| BPLD Annex 1 | 3rd Floor, Ayala Malls the 30th, Meralco Ave., Brgy. Ugong |
| BPLD Annex 2 | 3rd Floor, Robinsons Metro East, Brgy. Dela Paz |
| BPLD Mutya ng Pasig Mega Market | 3rd Floor, Mutya ng Pasig Mega Market |

Contact: trunk line 8641-1111, `bpldadmin@pasigcity.gov.ph`.

## 2. Barangay clearance across Pasig barangays

**Same in every barangay (Verified, 2026-10-05):** a *New Barangay Business Clearance* from the barangay with jurisdiction over the business address is required before BPLD filing. Source: BPLD Citizen's Charter 2025, item A.3.

**Documents and fees:** only Brgy. San Antonio is documented. The researcher asked at the city and was told the requirements are the same in every barangay. That is a verbal answer, not a citable source, so it stays Unverified until it is confirmed in writing.

| Barangay | Findings | Source | Status |
|---|---|---|---|
| San Antonio | Copy of DTI/SEC registration. Lease contract or TCT. Comprehensive General Liability (CGL) insurance policy. Barangay Clearance for Renovation, or a Certificate of Non-Renovation from the building administrator. Space use fee ₱12.10/sqm (minimum ₱121.00 below 10 sqm). Business plate ₱220.00 | Brgy. San Antonio Facebook post (researcher). Its official site, `sanantonio.pasigcity.gov.ph`, has a renewal post quoting ₱11.00/sqm and a CGL policy. The site refused connections on 2026-10-05 | Unverified. The two per-sqm rates conflict |
| Kapitolyo, Ugong, Rosario, Manggahan, Pinagbuhatan, Santolan, Caniogan, Oranbo | No requirements or fees published on any official site | Web searches on 2026-10-05 | Not found |

**Why fewer than 5 barangays:**

- Pasig barangays publish clearance details mostly on Facebook, which can't be searched or read reliably.
- The barangay subdomains under `pasigcity.gov.ph` did not respond on 2026-10-05.
- Directory sites (e.g. barangaydirectory.com) are not official sources.

**How the MVP handles it:** the assessment does not ask for the barangay, so the roadmap can't use barangay-specific data anyway. Step 2 should show the San Antonio list as the typical requirements, with the note "Confirm the exact documents and fees at your barangay hall." No schema or form change is needed.

**Follow-up:** checking 5 barangays by phone or in person moves to Sprint 3 (RS-003), only if barangay-specific content is wanted later.

## 3. Requirements by step and category

**Applies to** uses the database category names (Food and Beverage, Retail, Services) or the business type. "All" means every category. Line-specific clearances are listed in `registration-workflow.md`, "Other Special Requirements Specific to Line of Business".

| Step | Requirement | Applies to | Same in every barangay? | Notes | Source | Status |
|---|---|---|---|---|---|---|
| 1A | Proposed business name (2 to 3 backups) | Sole Proprietorship | n/a | Checked for availability in BNRS | [BNRS guide](https://bnrs.dti.gov.ph/resources/registration-guide) | Verified (2026-10-05) |
| 1A | Registration fee by territorial scope + ₱30 DST | Sole Proprietorship | n/a | Pay within 7 calendar days | [BNRS FAQ](https://bnrs.dti.gov.ph/faq) | Verified (2026-10-05) |
| 1A | Valid government ID, email, mobile number | Sole Proprietorship | n/a | | Researcher | Unverified |
| 1B | Company name verified in eSPARC | Partnership, Corporation, OPC | n/a | | [eSPARC](https://esparc.sec.gov.ph/application/name-verification) | Verified (2026-10-05) |
| 1B | Articles of Incorporation/Partnership and By-Laws (generated by eSPARC). Treasurer's Affidavit / proof of paid-up capital. IDs and TINs of incorporators, directors, officers | Partnership, Corporation, OPC | n/a | Notarized hard copies for Regular Processing. eSECURE/eSAP for OneSEC | Researcher | Unverified |
| 2 | New Barangay Business Clearance | All | Yes | See section 2 | BPLD charter 2025 | Verified (2026-10-05) |
| 2 | DTI/SEC copy, lease or TCT, CGL insurance, renovation clearance or non-renovation certificate, space and plate fees | All | Likely yes (researcher's verbal check at the city). Only San Antonio documented | | Brgy. San Antonio Facebook post | Unverified |
| 3 | CoC application form | All | Yes | Exception for mall / Ortigas CBD (Unverified) | [CPDO charter](https://assets.pasigcity.gov.ph/storage/attachments/city_planning_and_development_office/662a10cbbeaed1714032843Tagalog.pdf) | Verified (2026-10-05) |
| 3 | CoC fee: Free | All | Yes | The Feb 2024 CPDO charter listed ₱725.00. Superseded | Researcher | Confirmed by researcher (2026-10-05) |
| 3 | Floor area of the business and building, number of employees, description of the business, photos (front and inside) | All | Yes | Residential zones: home business at most 6 sqm with at most 5 workers (R1), or at most 30% of floor area with at most 15 workers (R2 to R3) | CPDO charter | Verified (2026-10-05) |
| 3 | HOA clearance allowing the business | All, if inside a subdivision | Yes | | CPDO charter | Verified (2026-10-05) |
| 3 | Public hearing with barangay and neighbors: barangay no-objection, resolution, photos, attendance, agenda, minutes | Retail (LPG dealers) | Yes | Pasig Ordinance No. 23 s. 2017 | CPDO charter | Verified (2026-10-05) |
| 3 | Tax declaration of land and building. Notarized lease, sub-lease plus mother contract, or affidavit of no rental. Owner consents. Occupancy permit if built after 2020. Google Map pin. TNVS parking photo | All (conditions vary) | Yes | | Researcher, from CLIMA | Unverified |
| 4 | FSIC for Occupancy: application form, OBO endorsement, certificate of completion, OBO assessment, as-built plan, FSCCR | All, only if built or renovated | Yes | Fee 15% of LGU fees, minimum ₱500 | [BFP NCR FAQ](https://ncr.bfp.gov.ph/wp-content/uploads/2024/02/faq3.pdf) for the fee. Researcher for the list | Fee verified (2026-10-05). List Unverified |
| 5 | UBAF | All | Yes | | BPLD charter 2025 | Verified (2026-10-05) |
| 5 | Proof of registration: DTI certificate, or SEC certificate with Articles | All | Yes | DTI for Sole Proprietorship, SEC for the others | BPLD charter 2025 | Verified (2026-10-05) |
| 5 | Proof of authority to use the place: lease, sub-lease, or certificate of non-rental | All | Yes | | BPLD charter 2025 | Verified (2026-10-05) |
| 5 | SPA / Secretary's Certificate / authorization letter with ID | All, if filed by a representative | Yes | | BPLD charter 2025 | Verified (2026-10-05) |
| 5 | Line-of-business clearances (FDA, Veterinary Clearance, PRC, etc.) | Depends on line | Yes | See the RS-001 table | BPLD charter 2025, section J | Verified (2026-10-05) |
| 6 | Validated UBAF and documents | All | Yes | | BPLD charter 2025 | Verified (2026-10-05) |
| 7 | Tax Order of Payment | All | Yes | | BPLD charter 2025 | Verified (2026-10-05) |
| 8 | FSIC for Business Permit | All | Yes | Fee 15% of LGU fees, minimum ₱500 | BFP NCR FAQ | Verified (2026-10-05) |
| 8 | Sanitary Permit (temporary, then original) | All | Yes | Temporary permit needs the current-year Business Permit, TOP and OR | [Pasig CHD charter](https://assets.pasigcity.gov.ph/storage/attachments/pasig_city_health_department/633e8116ded771665040662EDITED%20CHO%20Environmental%20Sanitation%20Section.pdf) | Verified (2026-10-05) |
| 8 | Health Certificate per worker: chest X-ray, drug test, urine, stool | Food and Beverage | Yes | ₱70 fee in the TOP. ₱50 validation per person if tested outside the Pasig One Stop Shop Clinic | Pasig CHD charter | Verified (2026-10-05) |
| 8 | Health Certificate per worker: chest X-ray, drug test | Retail, Services | Yes | Same fees | Pasig CHD charter | Verified (2026-10-05) |
| 8 | Certificate of Compliance with Minimum Sanitary Requirements | Retail, Services (non-food) | Yes | | Pasig CHD charter | Verified (2026-10-05) |
| 8 | Pest control contract or annual vermin abatement plan | Food and Beverage | Yes | DOH-accredited pest control operator | Pasig CHD charter | Verified (2026-10-05) |
| 8 | Water analysis (microbiological, physical and chemical) and plans | Food and Beverage (water refilling station) | Yes | | Pasig CHD charter | Verified (2026-10-05) |
| 8 | Meat Inspection Certificate / Veterinary Clearance | Food and Beverage, Retail (if handling meat) | Yes | City Veterinary Office, 5th floor | Pasig CHD charter. BPLD charter 2025, section J | Verified (2026-10-05) |
| 8 | FDA License / product registration | Food and Beverage (food manufacturing), Retail (pharmacy) | Yes | | Pasig CHD charter. BPLD charter 2025, section J | Verified (2026-10-05) |
| 8 | CENRO environmental clearance (ECC or Certificate of Non-Coverage, wastewater, hazardous waste) | Only waste or pollution generators | Yes | | Researcher | Unverified |
| 9 | Approved UBAF photocopy with all regulatory signatures, FSIC (or UBAF with FSIC details), updated CoC, current TOP and OR | All | Yes | Pending clearances may follow within the period on the back of the permit | BPLD charter 2025, section D | Verified (2026-10-05) |
| 10 | BIR Form 1901 + government ID | Sole Proprietorship | n/a | ORUS online or RDO walk-in | [BIR CDR rev. Jul 2025](https://bir-cdn.bir.gov.ph/BIR/pdf/CDR%20-%202025%20(1).pdf), F1101 | Verified (2026-10-05) |
| 10 | BIR Form 1903 + SEC certificate + Articles | Partnership, Corporation, OPC | n/a | | BIR CDR, F1103 | Verified (2026-10-05) |
| 10 | BIR Printed Invoice, or own invoice sample (with Authority to Print) | All | n/a | | BIR CDR | Verified (2026-10-05) |
| 10 | ₱30 DST on the Certificate of Registration | All | n/a | No ₱500 annual registration fee | [BIR Citizen's Charter 2026](https://bir-cdn.bir.gov.ph/BIR/pdf/BIR%20Citizen's%20Charter%20(2026%20Edition)%20final.pdf) | Verified (2026-10-05) |
| 10 | Books of accounts registered in ORUS (QR stamp), or walk-in with BIR Form 1905 | All | n/a | Free. Walk-in takes 1 day | BIR CDR F1105B. BIR Citizen's Charter 2026, service 17 | Verified (2026-10-05) |

**Open question (Unverified):** the Health Certificate tests depend on whether the business is a "food establishment". It isn't confirmed whether a sari-sari store or grocery selling only packaged food counts. Ask the Pasig City Health Department before the roadmap tells Retail users which tests to take.

## 4. Category check (RS-002-04)

**Recommendation: keep the 3 categories (Food and Beverage, Retail, Services) for the MVP. No migration.**

| Finding | What it means |
|---|---|
| Steps 1 to 10 are the same for every category. Only Step 1A/1B changes, and that depends on business type, not category | Category doesn't change the step list |
| The only category-level rule the city applies is food vs non-food at the Sanitary Permit (Health Certificate tests, pest control, Certificate of Compliance) | Food and Beverage vs Retail/Services already captures it |
| Line-specific clearances depend on the exact line, not the category. A carwash and a travel agency are both Services but need different clearances | More categories won't fix this. A "line of business" field would |

**For the MVP:** show line-specific clearances under the user's category as "If your business is X: …", using the Category column of the RS-001 line-of-business table. Seed only rows marked MVP "Yes" or "Partial".

**Later:** an optional line-of-business field in the assessment is an RS-003 (Sprint 3) research question, not a Sprint 3 build item.

## 5. Detailed process per step

### Step 1A: Register Business Name through BNRS

#### Requirements

- Filipino citizenship (at least 18 years old).
- One valid government-issued ID (e.g., Passport, Driver's License, UMID, PhilID).
- Proposed Business Names (have 2–3 backup options ready).
- Active email address and mobile phone number.
- **Registration Fee (depends on territorial scope):**
  - **Barangay:** ₱200
  - **City/Municipality:** ₱500
  - **Regional:** ₱1,000
  - **National:** ₱2,000
  - (+ ₱30 documentary stamp tax)

Business Name Registration is the initial step required for individuals registering a Sole Proprietorship in the Philippines. This process legally secures your preferred trade name with the Department of Trade and Industry (DTI) through its online Business Name Registration System (BNRS) portal.

Non-Philippine nationals must file at a DTI office with supporting documents (BNRS guide).

#### Process

1. **Access Portal:** Go to the [DTI BNRS Portal](https://bnrs.dti.gov.ph/registration/create) and accept the terms.
2. **Input Owner Information:** Fill in your personal details (full name, birthdate, address, and contact information).
3. **Select Territorial Scope & Business Name:** Choose your business scope (Barangay, City, Regional, or National) and input your proposed Dominant Name and Business Name Descriptor. Click Check Name Availability.
4. **Save Reference Code:** Note down the generated system Reference Code for future tracking and payment.
5. **Complete Application Details:** Fill in your business location and residential address details.
6. **Review & Confirm Undertaking:** Verify all information for accuracy and signify conformity to the online Undertaking.
7. **Pay Registration Fee:** Pay online via e-wallets (GCash/Maya), Credit/Debit Card, Landbank Link.Biz, 7-Eleven, or a DTI teller within **7 calendar days**, or the application is deemed abandoned. *(Corrected from "7 working days".)*
8. **Download Certificate:** Once payment is verified, your Certificate of Business Name Registration (CBNR) will be generated and emailed to you.

**Source:** [BNRS Registration Guide](https://bnrs.dti.gov.ph/resources/registration-guide), [BNRS FAQ](https://bnrs.dti.gov.ph/faq). Accessed 2026-10-05.

### Step 1B: Company Registration with SEC

#### Requirements

- Proposed Company Name (verified via SEC eSPARC).
- Articles of Incorporation / Partnership & By-Laws (system-generated via eSPARC).
- Treasurer's Affidavit & Proof of Paid-Up Capital / Bank Certificate (if applicable).
- Valid Government IDs and Tax Identification Numbers (TIN) of incorporators, directors, and officers.
- Notarized hard copies of generated SEC forms (if registering under Regular Processing)

Company Registration with Securities and Exchange Commission (SEC) is the registration step for setting up a Partnership, Corporation, or One Person Corporation (OPC) in the Philippines. This process establishes your business as a legal entity separate from its owners through the eSPARC portal.

#### Process

1. **Access SEC eSPARC:** Go to the [SEC eSPARC Portal](https://esparc.sec.gov.ph/application/name-verification). Choose between OneSEC (domestic stock corporations only: OPC or 2 to 15 incorporators, 1-day target) or Regular Processing (all other types, including partnerships).
2. **Perform Name Verification:** Input your proposed company name and primary industry classification to verify availability.
3. **Fill Out Company Details:** Enter your principal office address, primary and secondary business purposes, and corporate term.
4. **Specify Capital Structure & Company Officers:** Enter capital details (authorized, subscribed, and paid-up capital) and assign roles (Directors, Corporate Secretary, Treasurer).
5. **Download Generated Forms:** Download the system-generated Articles of Incorporation/Partnership, By-Laws, and Treasurer's Affidavit.
6. **Sign & Authenticate:** Have the documents signed by incorporators and notarized (or digitally authenticated via eSECURE/eSAP for OneSEC).
7. **Upload Executed Documents:** Upload scanned PDF copies of the signed/notarized forms back to the eSPARC portal for SEC officer review (Regular Processing: allow 7 working days).
8. **Pay SEC Registration Fees:** Download the system-generated Payment Assessment Details (PAD) and pay online via SEC Payment Portal or Landbank.
9. **Receive Certificate:** Download your digital Certificate of Incorporation (or Certificate of Recording for a partnership), or collect the physical copy at your chosen SEC processing office.

**Source:** [SEC eSPARC User Guide](https://esparc.sec.gov.ph/docs/UserGuide-esparc.pdf). Accessed 2026-10-05. Requirement list: Unverified.

### Step 2: Secure Barangay Business Clearance

#### Requirements

**Unverified.** These are Brgy. San Antonio's only. See [section 2](#2-barangay-clearance-across-pasig-barangays).

- Barangay Clearance for Renovation
  - **Note:** If NO RENOVATION was done, submit a Certificate of Non-Renovation from the Building Administrator.
- **Copy of Business Registration:**
  - Securities and Exchange Commission (SEC) Articles & By-Laws OR
  - Department of Trade and Industry (DTI) Registration.
- Contract of Lease or Transfer Certificate of Title (TCT).
- Comprehensive General Liability (CGL) Insurance Policy for Business.
- **Fees & Payment:**
  - **Space Use Fee:** ₱12.10 per sqm of Space Use (Minimum fee of ₱121.00 for space use less than 10 sqm).
  - **Business Plate Fee:** ₱220.00.

Note: This information is based on a Facebook post by Barangay San Antonio, Pasig as no further details were found elsewhere. Requirements and procedures may vary across other barangays.

A Barangay Business Clearance is a document issued by the barangay where your business is physically located, certifying that the barangay has no objection to your business operating within its territory. It is the smallest-unit local government endorsement that the city or municipality requires before it will process your Mayor's Permit.

#### Process

1. **Prepare Document Copies:** Gather your DTI/SEC registration, lease contract or TCT, CGL insurance policy, and renovation clearance (or Certificate of Non-Renovation).
2. **Submit Application at Barangay Hall:** Bring the requirements to the business clearance counter for evaluation.
3. **Pay Assessed Fees:** Pay the ₱220.00 business plate fee plus the space use fee (₱12.10 per sqm, min. ₱121.00) at the cashier.
4. **Claim Barangay Clearance & Plate:** Receive your official receipt, signed Barangay Business Clearance, and business plate.

### Step 3: Obtain Certificate of Conformance

#### Requirements per the CPDO charter (Verified, 2026-10-05)

- Accomplished CoC application form
- Floor area of the business and of the whole building
- Number of employees, including the owner
- Description of the business or product
- Photos of the establishment (front of the building and inside the business space)
- HOA clearance allowing the business (if inside a subdivision)
- For Gas Stations and LPG stores (Pasig Ordinance No. 23 s. 2017): public hearing with the barangay and neighboring owners, and its documents

Home businesses in residential zones are allowed only within the limits in [section 3](#3-requirements-by-step-and-category).

#### Additional requirements from the CLIMA portal (researcher, Unverified)

For business establishments located in areas covered by the Community Mortgage Program (CMP) or under a Homeowners Association (HOA) without Tax Declaration for the lot or building:

- Updated Tax Declaration of LAND and BUILDING (from lot owner or the City Assessor's Office)
  - **If under CMP or Awarded Lots (w/o Tax Declaration or Title):**
    - HOA Certification of Membership and Permit to conduct the business
    - Special Permit from Pasig Urban Settlements Office (PUSO)
- Notarized Lessee-Lessor Agreement (with IDs)
  - **If Sub-Leased (if Lessor is not the owner):**
    - Sub-Lease agreement
    - Mother Contract (Lessor-Owner Contract)
  - **If the property is FREE OF USE:**
    - Notarized Affidavit of No Rental from Owner with IDs
  - **For multiple ownership:**
    - Provide Extrajudicial, S.P.A., Notarized Authority to Enter into Contract, Notarized Consent from ALL owners (with IDs)
    - **If one or more owners are deceased:** Provide Notarized Consent from the deceased's heirs (with IDs)
- Notarized Authorization / SPA (for COC purpose)
  - **If representative (with IDs):** The representative should be knowledgeable to transact the COC to avoid confusion
- Barangay Clearance
- Occupancy Permit
  - Required if the building was built after 2020
- Certificate of No Objection
  - From Homeowners Association / Building Administration (if inside a subdivision or condominium)
- Picture of Business Area (Inside & Outside)
- Google Map
  - Showing the exact location of the business
- For Lot / Building / House LESSOR
  - DTI Registration, Articles of Incorporation, or SEC Certificate of Registration
- **For LPG Stores / Gas Station Businesses:**
  - Barangay Certificate of No Objection
  - Barangay Resolution
  - Photographs from Public Hearing
  - Attendance sheet of attendees with signatures & addresses
  - Agenda of the meeting
  - Minutes of the meeting
- **For GRAB / Transport Network Vehicle Service (TNVS):**
  - Wide-angle photograph of the car inside the parking area

For Business establishments located within the Central Business District (CBD) or inside a mall, please apply for your CBD Stub. **Unverified:** the researcher's CBD link is a Google Form that needs a sign-in (HTTP 401 on 2026-10-05) and isn't on a government domain.

A Certificate of Conformance (CoC) is an official document issued by the City Planning and Development Office (CPDO) that verifies a business's compliance with local zoning rules and land use policies.

#### Application Process

- **Walk-in (CPDO charter):** get and fill out the form → submit with requirements → CPDO checks the lot in RPT-GIS and the zoning map → approval → receive the CoC. The CoC is free (confirmed by the researcher, 2026-10-05). The Feb 2024 charter's ₱725.00 payment step is superseded.
- **Online, for CMP/HOA:** apply via the CLIMA portal: [https://clima.pasigcity.gov.ph/clima/PublicConformance/add_application/TRUE](https://clima.pasigcity.gov.ph/clima/PublicConformance/add_application/TRUE)
- **For CBD:** [https://docs.google.com/forms/d/e/1FAIpQLSeeInrKiKKdo7VE2jV3UUT9GHQmR4d7xM7Npwsvc9Ypi9uYpQ/viewform?pli=1](https://docs.google.com/forms/d/e/1FAIpQLSeeInrKiKKdo7VE2jV3UUT9GHQmR4d7xM7Npwsvc9Ypi9uYpQ/viewform?pli=1) (Unverified, see above)

**Source:** [Pasig CPDO Citizen's Charter (Feb 2024)](https://assets.pasigcity.gov.ph/storage/attachments/city_planning_and_development_office/662a10cbbeaed1714032843Tagalog.pdf). Accessed 2026-10-05.

### Step 4: Acquire Fire Safety Inspection Certificate for Occupancy

Only if the place of business was newly built or renovated. This is a different certificate from the FSIC for Business Permit in Step 8.

#### Requirements Needed (Unverified)

- Accomplished application form for FSIC/Unified Application Form (UAF)
- Endorsement from Office of the Building Official (OBO)
- Certificate of Completion from the Architect or Engineer in charge.
- Certified true copy of assessment fee for securing Occupancy Permit from OBO
- As-Built Plan, if necessary
- Fire Safety Compliance and Commissioning Report (FSCCR), if necessary

This certificate is required before a newly constructed building can be occupied. This is issued after the BFP confirms the building was constructed according to the approved Fire Safety Evaluation Clearance (FSEC).

#### Process

- **Access the BFP Portal:** Go to the [BFP Fire Safety Inspection System (FSIS) Portal](https://fsis.e-bfp.com/).
- **File Application & Upload Documents:** Create or log into your account, select FSIC for Occupancy, and upload scanned copies of all required building and fire safety documents.
- **Receive Order of Payment:** Obtain the Fire Safety Inspection Fee assessment. The fee is calculated at 15% of all fees charged by the LGU/PEZA (minimum fee of ₱500; if LGU assessment is zero, fee is zero). **Verified (2026-10-05)** against the [BFP NCR FAQ](https://ncr.bfp.gov.ph/wp-content/uploads/2024/02/faq3.pdf).
- **Pay Fire Safety Inspection Fee:** Settle the assessed amount online via the portal's payment channels.
- **Undergo On-Site Physical Inspection:** A BFP Fire Safety Inspector will visit and inspect the business premises to verify compliance with the Fire Code of the Philippines of 2008.
- **Receive Certificate:** Once the inspection is passed and approved, download and print your Fire Safety Inspection Certificate (FSIC) for Occupancy which may take up to 3 to 7 working days (Unverified).

### Step 5: Fill up the Unified Business Application Form (UBAF) and Submission of Requirements

#### Requirements Needed

The official 2025 checklist is in [section 3](#3-requirements-by-step-and-category), Step 5 rows. Researcher's list:

- Government-issued ID
- Duly accomplished Unified Business Application Form (UBAF)
- DTI Certificate (Sole Proprietorship) or SEC Certificate with Articles of Incorporation/Partnership (Corporation/Partnership). *(CDA/Cooperative removed: not an AsikaGo business type.)*
- Original and clear photocopy of Barangay Business Clearance
- Certificate of Conformance (Zoning Clearance)
- Fire Safety Inspection Certificate (FSIC) for Occupancy (if premises were constructed or modified). *Not in the 2025 checklist.*
- Proof of Business Location (Notarized Lease Contract / Sub-lease Contract, Certificate of Non-Rental, or Title / Tax Declaration)
- Front-view colored photo of the establishment in 2R format. *Not in the 2025 checklist.*
- Location map of the business site in 2R format. *Not in the 2025 checklist.*
- Notarized Authorization Letter or Special Power of Attorney (SPA) with valid ID (if filed by a representative)
- Applicable Special Line-of-Business Clearances or Permits (e.g., FDA, Veterinary Clearance, etc.)

#### Process

- **Download and Fill Out UBAF:** Obtain the form [online](https://assets.pasigcity.gov.ph/storage/downloadables/2024/12/27/676eb0e3d77c11735307491BPLD%20UAF%20Final.pdf) or at the BPLD office and complete all required business details.
- **Compile Documents:** Prepare original copies and clear photocopies of all applicable requirements.
- **Submit at BPLD Counter:** Submit your application packet in person at BPLD Admin (Bridgetowne) or a BPLD annex.
- **Undergo Document Verification:** BPLD personnel would verify the completeness and accuracy of your form and attached clearances.
- **Proceed to Tax Assessment:** Once approved, the application is approved for the generation of Tax Order of Payment (TOP).

\* If application is deemed incomplete or with previous record, applicant shall be given a notice of deficiency/irregularity for compliance.

**Source:** BPLD Citizen's Charter 2025, section A. Accessed 2026-10-05.

### Step 6: Acquire Tax Order of Payment

#### Requirements Needed

- Validated UBAF and necessary documents

#### Process

- **Wait for Billing Generation:** After your UBAF and supporting documents pass verification at the BPLD submission counter, your application is queued for tax and fee computation.
- **Tax Assessment:** BPLD officer would calculate applicable local business taxes, regulatory fees, and permit fees.
- **Receive Tax Order of Payment (TOP):** Collect your printed Tax Order of Payment (TOP) document from the BPLD releasing counter. Per the charter, encoding, approval and release take about 15 minutes each.

**Source:** BPLD Citizen's Charter 2025, section A. Accessed 2026-10-05.

### Step 7: Pay local business taxes and fees

#### Requirements Needed

- Tax Order of Payment (TOP)

#### Process

- Review the itemized breakdown of local taxes and fees listed on the TOP, then bring it directly to the Office of the City Treasurer's cashier for payment.

**Source:** BPLD Citizen's Charter 2025, section A. Accessed 2026-10-05.

### Step 8: Process Ancillary permits and clearances via BOSS

#### Requirements Needed

- Unified Business Application Form (UBAF)
- Tax Order of Payment (TOP) and Official Receipt
- **FSIC for Business Permit** (all businesses): BFP, fee 15% of LGU fees, minimum ₱500. **Verified (2026-10-05)**
- **Sanitary Permit and Health Certificates (City Health Department):** all businesses. Food establishments: chest X-ray, drug test, urine and stool per worker, plus a pest control contract. Non-food: chest X-ray and drug test per worker, plus a Certificate of Compliance. Water refilling stations: water analysis. **Verified (2026-10-05)** against the [Pasig CHD charter](https://assets.pasigcity.gov.ph/storage/attachments/pasig_city_health_department/633e8116ded771665040662EDITED%20CHO%20Environmental%20Sanitation%20Section.pdf)
- **City Environmental Permit / CENRO Clearance:** Environmental Compliance Certificate (ECC) or Waste Management Plan (for manufacturing, automotive repair, junkshops, or chemical handling). **Unverified**
- **Occupancy Clearance / Certificate of Final Electrical Inspection (CFEI):** From the Office of the Building Official (OBO). **Unverified**
- **Special Regulatory Licenses:** FDA License to Operate, Veterinary Clearance, or DTI-DOH-DA special clearances (if regulated)

#### Process

- **Proceed to the BOSS Regulatory Counters:** BOSS counters are at the BPLD offices: BPLD Admin (Bridgetowne, Rosario), Annex 1 (Ayala Malls the 30th, Ugong), Annex 2 (Robinsons Metro East, Dela Paz), Mutya ng Pasig Mega Market.
- **Submit Specific Line-of-Business Papers:** Present your paid proof of payment and UBAF folder to the relevant regulatory agency counters stationed within the BOSS area (e.g., City Health Office, CENRO, Office of the Building Official).
- **Undergo Ancillary Inspections/Evaluations:** Each specialized department evaluates your documents and verifies compliance with specific municipal codes (health, sanitation, electrical safety, or environmental compliance).

### Step 9: Claim Business Permit and Sticker

#### Requirements Needed (BPLD Citizen's Charter 2025, section D, Verified 2026-10-05)

- Photocopy of the approved UBAF showing the approvals or signatures of all concerned regulatory offices (back portion)
- Copy of the valid Fire Safety Inspection Certificate, or the UBAF with the FSIC details and validity period
- Updated Certificate of Conformance from CPDO (per the 2024 Pasig Zoning Ordinance). The researcher noted an exception for malls and the Ortigas Business District (Unverified)
- Current TOP and Official Receipt (for checking only)

*Corrected:* the researcher also listed a valid CENRO clearance, a Sanitary Permit and a cedula. These aren't in the 2025 checklist. The charter lets pending clearances be submitted after release, within the period stated on the back of the permit.

#### Process

- **Present your documents:** Visit BPLD Admin (Temporary City Hall, Bridgetowne, Rosario) or a BPLD annex and submit your documents to the receiving clerk. *(Corrected from "main BPLD office at Pasig City Hall".)*
- **Receive and Sign the Permit:** Claim your Business Permit, plate and stickers (75 minutes per the charter).
- **Display Business Credentials:** Post your original Mayor's Permit, official receipt, and business sticker in a conspicuous place inside your business premises as required by city ordinance.

### Step 10: BIR Registration

Added in review. Sources: [BIR Citizen's Charter 2026](https://bir-cdn.bir.gov.ph/BIR/pdf/BIR%20Citizen's%20Charter%20(2026%20Edition)%20final.pdf), services 6 to 11 and 17, and the [BIR Checklist of Documentary Requirements (rev. Jul 2025)](https://bir-cdn.bir.gov.ph/BIR/pdf/CDR%20-%202025%20(1).pdf). Accessed 2026-10-05. **Verified.**

Register on or before the start of business: the first sale, or within 30 calendar days from the issuance of the Mayor's Permit or DTI CBNR. A sole proprietor may register right after Step 1A.

#### Requirements Needed

- **Sole Proprietorship:** BIR Form 1901 (filled in online in ORUS, or 2 originals for walk-in). Government-issued ID showing name, address and birthdate (a selfie holding the ID for online applications).
- **Partnership, Corporation, OPC:** BIR Form 1903. SEC Certificate of Incorporation or Certificate of Recording. Articles of Incorporation or Partnership.
- **All:** buy BIR Printed Invoices at the RDO, or submit a final sample of your own invoices (printed by an accredited printer, with an Authority to Print). A Special Power of Attorney if filed by a representative.

#### Process

1. **Register online:** create an account at [ORUS](https://orus.bir.gov.ph), fill out the registration form, and upload the documents. Or walk in at the RDO New Business Registrant Counter that covers the business address.
2. **Pay ₱30 documentary stamp tax** (online for ORUS). The ₱500 Annual Registration Fee is no longer collected.
3. **Get the Certificate of Registration (BIR Form 2303):** printed from ORUS after payment (3 days), or released at the RDO (1 day).
4. **Register books of accounts:** in ORUS (paste the generated QR stamp on the first page), or walk-in with BIR Form 1905 (1 day). Free.
5. **Get invoices:** use BIR Printed Invoices or print with an Authority to Print before the first sale.
