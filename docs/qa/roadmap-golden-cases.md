# Roadmap Golden Cases (S3-QA-01 / AB#76)

---

## 1. How to use this file

Each case gives the exact roadmap a profile must get: the steps in order with their numbers, and the requirements inside each step in order. A case passes only if **all three** match: the step list and numbers, the requirement names and order, and the `appliesTo` value.

- **Step numbers** are positions 1 to N with no gaps ( Section 4 of the ticket breakdown). Step 1A or 1B is always number 1. The seed step ID (`1A`, `1B`, `2` to `9`, `10A`, `10B`) is shown so the case can be matched to the seed sheet.
- **Requirement order** is the order of the rows in the seed sheet. Line-of-business rows come last in Step 5, in the order of sheet table 4.
- **Names** are copied exactly from the seed sheet. If the sheet wording changes after clarity review (RS-003-02), update this file.
- **`appliesTo`**: a requirement marked `[appliesTo: X]` must return category X. Every other requirement must return `null`.
- **Status marker**: no marker = **Verified** in the research. `(C)` = **Confirmed by researcher**. Both are allowed in the seed (RS-003-01).
- **Requirement count** is the `requirementCount` the roadmap list must show for that step.

## 2. Rules that hold for every case

| ID | Rule |
| --- | --- |
| INV-01 | A Sole Proprietorship gets Step 1A as number 1 and Step 10A as number 10. It never gets Step 1B or Step 10B. |
| INV-02 | A Partnership, Corporation, or One Person Corporation gets Step 1B as number 1 and Step 10B as number 10. It never gets Step 1A or Step 10A. |
| INV-03 | Steps 2 to 9 (positions 2 to 9) are the same steps in the same order for all 12 profiles. Only the requirements inside them change. |
| INV-04 | Step 3 and Step 4 appear for every profile. They are never removed. Their `conditionNote` is shown instead (Step 3: mall / Ortigas Center. Step 4: newly built or renovated). |
| INV-05 | Step 1B differs by type: a Partnership gets Articles of Partnership and no Articles and By-Laws or Treasurer's Affidavit. A Corporation and a One Person Corporation get the same Step 1B list. |
| INV-06 | Only the Food and Beverage roadmap has the Pest control contract and "Health Certificate for food workers". |
| INV-07 | Line-of-business requirements appear only under Step 5, only for the profile's own category (Food and Beverage 4, Retail 5, Services 9), and always last in the step. |
| INV-08 | Step numbers have no gaps and each profile's numbers start at 1. |
| INV-09 | Step 10B differs by type: a Partnership gets SEC Certificate of Recording and Articles of Partnership. A Corporation and a One Person Corporation get SEC Certificate of Incorporation and Articles and By-Laws. All three get 12 requirements. |
| INV-10 | Step 10A (Sole Proprietorship, 11 requirements) and Step 10B never appear in the same roadmap. Steps 10A and 10B are the same for all 3 categories. |

## 3. Summary matrix

Requirement count per step, by roadmap position (1 to 10).

| Case | Business type | Category | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G-01 | Sole Proprietorship | Food and Beverage | 5 | 6 | 8 | 1 | 14 | 1 | 1 | 5 | 5 | 11 | 57 |
| G-02 | Sole Proprietorship | Retail | 5 | 6 | 8 | 1 | 15 | 1 | 1 | 4 | 5 | 11 | 57 |
| G-03 | Sole Proprietorship | Services | 5 | 6 | 8 | 1 | 19 | 1 | 1 | 4 | 5 | 11 | 61 |
| G-04 | Partnership | Food and Beverage | 4 | 6 | 8 | 1 | 14 | 1 | 1 | 5 | 5 | 12 | 57 |
| G-05 | Partnership | Retail | 4 | 6 | 8 | 1 | 15 | 1 | 1 | 4 | 5 | 12 | 57 |
| G-06 | Partnership | Services | 4 | 6 | 8 | 1 | 19 | 1 | 1 | 4 | 5 | 12 | 61 |
| G-07 | Corporation | Food and Beverage | 5 | 6 | 8 | 1 | 14 | 1 | 1 | 5 | 5 | 12 | 58 |
| G-08 | Corporation | Retail | 5 | 6 | 8 | 1 | 15 | 1 | 1 | 4 | 5 | 12 | 58 |
| G-09 | Corporation | Services | 5 | 6 | 8 | 1 | 19 | 1 | 1 | 4 | 5 | 12 | 62 |
| G-10 | One Person Corporation | Food and Beverage | 5 | 6 | 8 | 1 | 14 | 1 | 1 | 5 | 5 | 12 | 58 |
| G-11 | One Person Corporation | Retail | 5 | 6 | 8 | 1 | 15 | 1 | 1 | 4 | 5 | 12 | 58 |
| G-12 | One Person Corporation | Services | 5 | 6 | 8 | 1 | 19 | 1 | 1 | 4 | 5 | 12 | 62 |

Column 1 is Step 1A for Sole Proprietorship and Step 1B for the other three types. Column 10 is Step 10A for Sole Proprietorship and Step 10B for the other three types.

## 4. Cases

### G-01: Sole Proprietorship, Food and Beverage

**Profile:** business type = `Sole Proprietorship`, category = `Food and Beverage`, city = Pasig City. **Step 1 is 1A. Step 10 is 10A.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1A | DTI Business Name Registration | DTI (Department of Trade and Industry) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 14 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 5 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10A | BIR Business Registration for Sole Proprietors | BIR (Bureau of Internal Revenue) | (none) | 11 |

**Expected requirements, in order**

*Step 1: DTI Business Name Registration (5)*

1. Filipino citizen, at least 18 years old
2. One valid government ID
3. 2 or 3 business names
4. Email address and mobile number
5. Registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (14)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is a restaurant, fast food, canteen, eatery, or catering service that deals with animal meat: Veterinary Clearance from the Pasig City Department of Veterinary Services. `[appliesTo: Food and Beverage]`
12. If your business is a restobar, night club, or beer house: stay 200 meters away from public offices, schools, and churches. Bring Health Certificates for your workers, a Working Permit for each worker, and a Fire Safety Certificate. `[appliesTo: Food and Beverage]`
13. If your business is a water refilling station: Certification of Water Potability from the City Health Department, or a Certification of Sanitary Inspection. `[appliesTo: Food and Beverage]`
14. If your business makes food or beauty products: FDA (Food and Drug Administration) License. `[appliesTo: Food and Beverage]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (5)*

1. Sanitary Permit
2. Health Certificate for food workers `[appliesTo: Food and Beverage]`
3. Pest control contract (C) `[appliesTo: Food and Beverage]`
4. Environmental clearance from CENRO (C)
5. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Sole Proprietors (11)*

1. BIR Form 1901
2. Valid government ID
3. DTI Certificate of Business Name Registration
4. Mayor's Permit or Business Permit
5. Invoice option (choose one)
6. Documentary stamp tax
7. Special Power of Attorney and IDs
8. Work visa or Alien Employment Permit
9. DTI Certificate of Authority for BMBE
10. Proof of registration or Permit to Operate
11. Franchise documents

**Must NOT appear**

- Step 1B and its 6 requirements.
- Step 10B and its 14 requirements.
- In Step 5: the 14 line-of-business requirements of other categories (Retail 5, Services 9).
- In Step 8: Health Certificate [Retail version]; Health Certificate [Services version].

### G-02: Sole Proprietorship, Retail

**Profile:** business type = `Sole Proprietorship`, category = `Retail`, city = Pasig City. **Step 1 is 1A. Step 10 is 10A.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1A | DTI Business Name Registration | DTI (Department of Trade and Industry) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 15 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 4 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10A | BIR Business Registration for Sole Proprietors | BIR (Bureau of Internal Revenue) | (none) | 11 |

**Expected requirements, in order**

*Step 1: DTI Business Name Registration (5)*

1. Filipino citizen, at least 18 years old
2. One valid government ID
3. 2 or 3 business names
4. Email address and mobile number
5. Registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (15)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is a pharmacy or drugstore: FDA (Food and Drug Administration) License. `[appliesTo: Retail]`
12. If your business is a pet shop: Animal Certification of Registration from the Bureau of Animal Industry, and Veterinary Clearance from the Pasig City Department of Veterinary Services. `[appliesTo: Retail]`
13. If your business is an LPG dealer or gasoline station: DOE (Department of Energy) Accreditation. `[appliesTo: Retail]`
14. If your business is a pawnshop, money changer, or remittance agency: Certification to Operate from the Bangko Sentral ng Pilipinas. `[appliesTo: Retail]`
15. If your business is an electronics or electrical equipment shop: DTI (Department of Trade and Industry) Accreditation Certificate. `[appliesTo: Retail]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (4)*

1. Sanitary Permit
2. Health Certificate `[appliesTo: Retail]`
3. Environmental clearance from CENRO (C)
4. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Sole Proprietors (11)*

1. BIR Form 1901
2. Valid government ID
3. DTI Certificate of Business Name Registration
4. Mayor's Permit or Business Permit
5. Invoice option (choose one)
6. Documentary stamp tax
7. Special Power of Attorney and IDs
8. Work visa or Alien Employment Permit
9. DTI Certificate of Authority for BMBE
10. Proof of registration or Permit to Operate
11. Franchise documents

**Must NOT appear**

- Step 1B and its 6 requirements.
- Step 10B and its 14 requirements.
- In Step 5: the 13 line-of-business requirements of other categories (F&B 4, Services 9).
- In Step 8: Health Certificate for food workers [Food and Beverage version]; Health Certificate [Services version]; Pest control contract [Food and Beverage version].

### G-03: Sole Proprietorship, Services

**Profile:** business type = `Sole Proprietorship`, category = `Services`, city = Pasig City. **Step 1 is 1A. Step 10 is 10A.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1A | DTI Business Name Registration | DTI (Department of Trade and Industry) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 19 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 4 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10A | BIR Business Registration for Sole Proprietors | BIR (Bureau of Internal Revenue) | (none) | 11 |

**Expected requirements, in order**

*Step 1: DTI Business Name Registration (5)*

1. Filipino citizen, at least 18 years old
2. One valid government ID
3. 2 or 3 business names
4. Email address and mobile number
5. Registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (19)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is an auto repair, electronics, or radio repair shop: DTI (Department of Trade and Industry) Accreditation Certificate. `[appliesTo: Services]`
12. If your business is a junkshop, vulcanizing shop, carwash, or auto repair shop: a lot of at least 100 square meters, plus the lot title or your lease contract and the owner's TCT. `[appliesTo: Services]`
13. If your business exercises a profession: PRC (Professional Regulation Commission) License and PTR (Professional Tax Receipt). `[appliesTo: Services]`
14. If your business is a travel agency: DOT (Department of Tourism) Accreditation. `[appliesTo: Services]`
15. If your business is a school or training center: DepEd (Department of Education) or CHED (Commission on Higher Education) Accreditation. `[appliesTo: Services]`
16. If your business is a recruitment or manpower agency: License to Operate from DOLE (Department of Labor and Employment) or POEA, as the case may be. `[appliesTo: Services]`
17. If your business is a rent-a-car or transport service: LTO (Land Transportation Office) Franchise. `[appliesTo: Services]`
18. If your business is a real estate lessor: Proof of Ownership. `[appliesTo: Services]`
19. If your business is a warehouse or depot: Certification that says what kind of goods you will store. `[appliesTo: Services]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment

*Step 8: Health, Environment, and Fire Permits (4)*

1. Sanitary Permit
2. Health Certificate `[appliesTo: Services]`
3. Environmental clearance from CENRO (C)
4. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Sole Proprietors (11)*

1. BIR Form 1901
2. Valid government ID
3. DTI Certificate of Business Name Registration
4. Mayor's Permit or Business Permit
5. Invoice option (choose one)
6. Documentary stamp tax
7. Special Power of Attorney and IDs
8. Work visa or Alien Employment Permit
9. DTI Certificate of Authority for BMBE
10. Proof of registration or Permit to Operate
11. Franchise documents

**Must NOT appear**

- Step 1B and its 6 requirements.
- Step 10B and its 14 requirements.
- In Step 5: the 9 line-of-business requirements of other categories (F&B 4, Retail 5).
- In Step 8: Health Certificate for food workers [Food and Beverage version]; Health Certificate [Retail version]; Pest control contract [Food and Beverage version].

### G-04: Partnership, Food and Beverage

**Profile:** business type = `Partnership`, category = `Food and Beverage`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 4 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 14 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 5 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (4)*

1. Company name
2. Articles of Partnership
3. Valid IDs and TIN of every owner
4. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (14)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is a restaurant, fast food, canteen, eatery, or catering service that deals with animal meat: Veterinary Clearance from the Pasig City Department of Veterinary Services. `[appliesTo: Food and Beverage]`
12. If your business is a restobar, night club, or beer house: stay 200 meters away from public offices, schools, and churches. Bring Health Certificates for your workers, a Working Permit for each worker, and a Fire Safety Certificate. `[appliesTo: Food and Beverage]`
13. If your business is a water refilling station: Certification of Water Potability from the City Health Department, or a Certification of Sanitary Inspection. `[appliesTo: Food and Beverage]`
14. If your business makes food or beauty products: FDA (Food and Drug Administration) License. `[appliesTo: Food and Beverage]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (5)*

1. Sanitary Permit
2. Health Certificate for food workers `[appliesTo: Food and Beverage]`
3. Pest control contract (C) `[appliesTo: Food and Beverage]`
4. Environmental clearance from CENRO (C)
5. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Recording
3. Articles of Partnership
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles and By-Laws; Treasurer's Affidavit and proof of paid-up capital.
- In Step 5: the 14 line-of-business requirements of other categories (Retail 5, Services 9).
- In Step 8: Health Certificate [Retail version]; Health Certificate [Services version].
- In Step 10: SEC Certificate of Incorporation; Articles and By-Laws.

### G-05: Partnership, Retail

**Profile:** business type = `Partnership`, category = `Retail`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 4 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 15 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 4 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (4)*

1. Company name
2. Articles of Partnership
3. Valid IDs and TIN of every owner
4. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (15)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is a pharmacy or drugstore: FDA (Food and Drug Administration) License. `[appliesTo: Retail]`
12. If your business is a pet shop: Animal Certification of Registration from the Bureau of Animal Industry, and Veterinary Clearance from the Pasig City Department of Veterinary Services. `[appliesTo: Retail]`
13. If your business is an LPG dealer or gasoline station: DOE (Department of Energy) Accreditation. `[appliesTo: Retail]`
14. If your business is a pawnshop, money changer, or remittance agency: Certification to Operate from the Bangko Sentral ng Pilipinas. `[appliesTo: Retail]`
15. If your business is an electronics or electrical equipment shop: DTI (Department of Trade and Industry) Accreditation Certificate. `[appliesTo: Retail]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (4)*

1. Sanitary Permit
2. Health Certificate `[appliesTo: Retail]`
3. Environmental clearance from CENRO (C)
4. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Recording
3. Articles of Partnership
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles and By-Laws; Treasurer's Affidavit and proof of paid-up capital.
- In Step 5: the 13 line-of-business requirements of other categories (F&B 4, Services 9).
- In Step 8: Health Certificate for food workers [Food and Beverage version]; Health Certificate [Services version]; Pest control contract [Food and Beverage version].
- In Step 10: SEC Certificate of Incorporation; Articles and By-Laws.

### G-06: Partnership, Services

**Profile:** business type = `Partnership`, category = `Services`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 4 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 19 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 4 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (4)*

1. Company name
2. Articles of Partnership
3. Valid IDs and TIN of every owner
4. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (19)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is an auto repair, electronics, or radio repair shop: DTI (Department of Trade and Industry) Accreditation Certificate. `[appliesTo: Services]`
12. If your business is a junkshop, vulcanizing shop, carwash, or auto repair shop: a lot of at least 100 square meters, plus the lot title or your lease contract and the owner's TCT. `[appliesTo: Services]`
13. If your business exercises a profession: PRC (Professional Regulation Commission) License and PTR (Professional Tax Receipt). `[appliesTo: Services]`
14. If your business is a travel agency: DOT (Department of Tourism) Accreditation. `[appliesTo: Services]`
15. If your business is a school or training center: DepEd (Department of Education) or CHED (Commission on Higher Education) Accreditation. `[appliesTo: Services]`
16. If your business is a recruitment or manpower agency: License to Operate from DOLE (Department of Labor and Employment) or POEA, as the case may be. `[appliesTo: Services]`
17. If your business is a rent-a-car or transport service: LTO (Land Transportation Office) Franchise. `[appliesTo: Services]`
18. If your business is a real estate lessor: Proof of Ownership. `[appliesTo: Services]`
19. If your business is a warehouse or depot: Certification that says what kind of goods you will store. `[appliesTo: Services]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (4)*

1. Sanitary Permit
2. Health Certificate `[appliesTo: Services]`
3. Environmental clearance from CENRO (C)
4. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Recording
3. Articles of Partnership
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles and By-Laws; Treasurer's Affidavit and proof of paid-up capital.
- In Step 5: the 9 line-of-business requirements of other categories (F&B 4, Retail 5).
- In Step 8: Health Certificate for food workers [Food and Beverage version]; Health Certificate [Retail version]; Pest control contract [Food and Beverage version].
- In Step 10: SEC Certificate of Incorporation; Articles and By-Laws.

### G-07: Corporation, Food and Beverage

**Profile:** business type = `Corporation`, category = `Food and Beverage`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 14 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 5 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (5)*

1. Company name
2. Articles and By-Laws
3. Treasurer's Affidavit and proof of paid-up capital
4. Valid IDs and TIN of every owner
5. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (14)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is a restaurant, fast food, canteen, eatery, or catering service that deals with animal meat: Veterinary Clearance from the Pasig City Department of Veterinary Services. `[appliesTo: Food and Beverage]`
12. If your business is a restobar, night club, or beer house: stay 200 meters away from public offices, schools, and churches. Bring Health Certificates for your workers, a Working Permit for each worker, and a Fire Safety Certificate. `[appliesTo: Food and Beverage]`
13. If your business is a water refilling station: Certification of Water Potability from the City Health Department, or a Certification of Sanitary Inspection. `[appliesTo: Food and Beverage]`
14. If your business makes food or beauty products: FDA (Food and Drug Administration) License. `[appliesTo: Food and Beverage]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (5)*

1. Sanitary Permit
2. Health Certificate for food workers `[appliesTo: Food and Beverage]`
3. Pest control contract (C) `[appliesTo: Food and Beverage]`
4. Environmental clearance from CENRO (C)
5. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Incorporation
3. Articles and By-Laws
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles of Partnership.
- In Step 5: the 14 line-of-business requirements of other categories (Retail 5, Services 9).
- In Step 8: Health Certificate [Retail version]; Health Certificate [Services version].
- In Step 10: SEC Certificate of Recording; Articles of Partnership.

### G-08: Corporation, Retail

**Profile:** business type = `Corporation`, category = `Retail`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 15 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 4 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (5)*

1. Company name
2. Articles and By-Laws
3. Treasurer's Affidavit and proof of paid-up capital
4. Valid IDs and TIN of every owner
5. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (15)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is a pharmacy or drugstore: FDA (Food and Drug Administration) License. `[appliesTo: Retail]`
12. If your business is a pet shop: Animal Certification of Registration from the Bureau of Animal Industry, and Veterinary Clearance from the Pasig City Department of Veterinary Services. `[appliesTo: Retail]`
13. If your business is an LPG dealer or gasoline station: DOE (Department of Energy) Accreditation. `[appliesTo: Retail]`
14. If your business is a pawnshop, money changer, or remittance agency: Certification to Operate from the Bangko Sentral ng Pilipinas. `[appliesTo: Retail]`
15. If your business is an electronics or electrical equipment shop: DTI (Department of Trade and Industry) Accreditation Certificate. `[appliesTo: Retail]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (4)*

1. Sanitary Permit
2. Health Certificate `[appliesTo: Retail]`
3. Environmental clearance from CENRO (C)
4. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Incorporation
3. Articles and By-Laws
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles of Partnership.
- In Step 5: the 13 line-of-business requirements of other categories (F&B 4, Services 9).
- In Step 8: Health Certificate for food workers [Food and Beverage version]; Health Certificate [Services version]; Pest control contract [Food and Beverage version].
- In Step 10: SEC Certificate of Recording; Articles of Partnership.

### G-09: Corporation, Services

**Profile:** business type = `Corporation`, category = `Services`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 19 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 4 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (5)*

1. Company name
2. Articles and By-Laws
3. Treasurer's Affidavit and proof of paid-up capital
4. Valid IDs and TIN of every owner
5. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (19)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is an auto repair, electronics, or radio repair shop: DTI (Department of Trade and Industry) Accreditation Certificate. `[appliesTo: Services]`
12. If your business is a junkshop, vulcanizing shop, carwash, or auto repair shop: a lot of at least 100 square meters, plus the lot title or your lease contract and the owner's TCT. `[appliesTo: Services]`
13. If your business exercises a profession: PRC (Professional Regulation Commission) License and PTR (Professional Tax Receipt). `[appliesTo: Services]`
14. If your business is a travel agency: DOT (Department of Tourism) Accreditation. `[appliesTo: Services]`
15. If your business is a school or training center: DepEd (Department of Education) or CHED (Commission on Higher Education) Accreditation. `[appliesTo: Services]`
16. If your business is a recruitment or manpower agency: License to Operate from DOLE (Department of Labor and Employment) or POEA, as the case may be. `[appliesTo: Services]`
17. If your business is a rent-a-car or transport service: LTO (Land Transportation Office) Franchise. `[appliesTo: Services]`
18. If your business is a real estate lessor: Proof of Ownership. `[appliesTo: Services]`
19. If your business is a warehouse or depot: Certification that says what kind of goods you will store. `[appliesTo: Services]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (4)*

1. Sanitary Permit
2. Health Certificate `[appliesTo: Services]`
3. Environmental clearance from CENRO (C)
4. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Incorporation
3. Articles and By-Laws
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles of Partnership.
- In Step 5: the 9 line-of-business requirements of other categories (F&B 4, Retail 5).
- In Step 8: Health Certificate for food workers [Food and Beverage version]; Health Certificate [Retail version]; Pest control contract [Food and Beverage version].
- In Step 10: SEC Certificate of Recording; Articles of Partnership.

### G-10: One Person Corporation, Food and Beverage

**Profile:** business type = `One Person Corporation`, category = `Food and Beverage`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 14 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 5 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (5)*

1. Company name
2. Articles and By-Laws
3. Treasurer's Affidavit and proof of paid-up capital
4. Valid IDs and TIN of every owner
5. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (14)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is a restaurant, fast food, canteen, eatery, or catering service that deals with animal meat: Veterinary Clearance from the Pasig City Department of Veterinary Services. `[appliesTo: Food and Beverage]`
12. If your business is a restobar, night club, or beer house: stay 200 meters away from public offices, schools, and churches. Bring Health Certificates for your workers, a Working Permit for each worker, and a Fire Safety Certificate. `[appliesTo: Food and Beverage]`
13. If your business is a water refilling station: Certification of Water Potability from the City Health Department, or a Certification of Sanitary Inspection. `[appliesTo: Food and Beverage]`
14. If your business makes food or beauty products: FDA (Food and Drug Administration) License. `[appliesTo: Food and Beverage]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (5)*

1. Sanitary Permit
2. Health Certificate for food workers `[appliesTo: Food and Beverage]`
3. Pest control contract (C) `[appliesTo: Food and Beverage]`
4. Environmental clearance from CENRO (C)
5. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Incorporation
3. Articles and By-Laws
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles of Partnership.
- In Step 5: the 14 line-of-business requirements of other categories (Retail 5, Services 9).
- In Step 8: Health Certificate [Retail version]; Health Certificate [Services version].
- In Step 10: SEC Certificate of Recording; Articles of Partnership.

### G-11: One Person Corporation, Retail

**Profile:** business type = `One Person Corporation`, category = `Retail`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 15 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 4 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (5)*

1. Company name
2. Articles and By-Laws
3. Treasurer's Affidavit and proof of paid-up capital
4. Valid IDs and TIN of every owner
5. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (15)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is a pharmacy or drugstore: FDA (Food and Drug Administration) License. `[appliesTo: Retail]`
12. If your business is a pet shop: Animal Certification of Registration from the Bureau of Animal Industry, and Veterinary Clearance from the Pasig City Department of Veterinary Services. `[appliesTo: Retail]`
13. If your business is an LPG dealer or gasoline station: DOE (Department of Energy) Accreditation. `[appliesTo: Retail]`
14. If your business is a pawnshop, money changer, or remittance agency: Certification to Operate from the Bangko Sentral ng Pilipinas. `[appliesTo: Retail]`
15. If your business is an electronics or electrical equipment shop: DTI (Department of Trade and Industry) Accreditation Certificate. `[appliesTo: Retail]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment 

*Step 8: Health, Environment, and Fire Permits (4)*

1. Sanitary Permit
2. Health Certificate `[appliesTo: Retail]`
3. Environmental clearance from CENRO (C)
4. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Incorporation
3. Articles and By-Laws
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles of Partnership.
- In Step 5: the 13 line-of-business requirements of other categories (F&B 4, Services 9).
- In Step 8: Health Certificate for food workers [Food and Beverage version]; Health Certificate [Services version]; Pest control contract [Food and Beverage version].
- In Step 10: SEC Certificate of Recording; Articles of Partnership.

### G-12: One Person Corporation, Services

**Profile:** business type = `One Person Corporation`, category = `Services`, city = Pasig City. **Step 1 is 1B. Step 10 is 10B.**

**Expected steps in order**

| No. | Seed step | Step name | Agency | Condition note | Req. count |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B | SEC Company Registration | SEC (Securities and Exchange Commission) | (none) | 5 |
| 2 | 2 | Barangay Business Clearance | Barangay hall of your business address | (none) | 6 |
| 3 | 3 | Certificate of Conformance | Pasig City CPDO (City Planning and Development Office), Zoning Division | If your business is inside a mall or in the Ortigas Center, ask CPDO if you still need this. | 8 |
| 4 | 4 | Fire Safety Inspection Certificate for Occupancy | BFP (Bureau of Fire Protection), Pasig City | Only if your place is newly built or renovated. | 1 |
| 5 | 5 | Business Application Form and Documents | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 19 |
| 6 | 6 | Tax Order of Payment | BPLD (Business Permits and Licensing Department), Pasig City Hall | (none) | 1 |
| 7 | 7 | Pay Local Business Taxes and Fees | City Treasurer's Office, Cashier | (none) | 1 |
| 8 | 8 | Health, Environment, and Fire Permits | Pasig BOSS (Business One-Stop Shop), with City Health Department, CENRO (City Environment and Natural Resources Office), and BFP (Bureau of Fire Protection) | (none) | 4 |
| 9 | 9 | Claim Business Permit and Sticker | Pasig BOSS (Business One-Stop Shop), at the BPLD office in Pasig City Hall | (none) | 5 |
| 10 | 10B | BIR Business Registration for Corporations and Partnerships | BIR (Bureau of Internal Revenue) | (none) | 12 |

**Expected requirements, in order**

*Step 1: SEC Company Registration (5)*

1. Company name
2. Articles and By-Laws
3. Treasurer's Affidavit and proof of paid-up capital
4. Valid IDs and TIN of every owner
5. SEC registration fee

*Step 2: Barangay Business Clearance (6)*

1. Barangay clearance for renovation (C)
2. Copy of your DTI or SEC registration (C)
3. Contract of lease or land title (C)
4. Business insurance policy (C)
5. Space use fee (C)
6. Business plate fee (C)

*Step 3: Certificate of Conformance (8)*

1. Tax Declaration of land and building
2. Lease agreement
3. Authorization letter or SPA
4. Barangay clearance
5. Occupancy Permit
6. Certificate of No Objection
7. Photos of your business place
8. Google Map of your place

*Step 4: Fire Safety Inspection Certificate for Occupancy (1)*

1. Fire Safety Inspection Fee

*Step 5: Business Application Form and Documents (19)*

1. Valid government ID
2. Unified Business Application Form
3. DTI or SEC certificate
4. Barangay Business Clearance
5. Certificate of Conformance
6. Fire Safety Inspection Certificate for Occupancy
7. Proof of business location
8. Color photo of your business place
9. Location map
10. Authorization letter and ID
11. If your business is an auto repair, electronics, or radio repair shop: DTI (Department of Trade and Industry) Accreditation Certificate. `[appliesTo: Services]`
12. If your business is a junkshop, vulcanizing shop, carwash, or auto repair shop: a lot of at least 100 square meters, plus the lot title or your lease contract and the owner's TCT. `[appliesTo: Services]`
13. If your business exercises a profession: PRC (Professional Regulation Commission) License and PTR (Professional Tax Receipt). `[appliesTo: Services]`
14. If your business is a travel agency: DOT (Department of Tourism) Accreditation. `[appliesTo: Services]`
15. If your business is a school or training center: DepEd (Department of Education) or CHED (Commission on Higher Education) Accreditation. `[appliesTo: Services]`
16. If your business is a recruitment or manpower agency: License to Operate from DOLE (Department of Labor and Employment) or POEA, as the case may be. `[appliesTo: Services]`
17. If your business is a rent-a-car or transport service: LTO (Land Transportation Office) Franchise. `[appliesTo: Services]`
18. If your business is a real estate lessor: Proof of Ownership. `[appliesTo: Services]`
19. If your business is a warehouse or depot: Certification that says what kind of goods you will store. `[appliesTo: Services]`

*Step 6: Tax Order of Payment (1)*

1. Validated application form and documents 

*Step 7: Pay Local Business Taxes and Fees (1)*

1. Tax Order of Payment

*Step 8: Health, Environment, and Fire Permits (4)*

1. Sanitary Permit
2. Health Certificate `[appliesTo: Services]`
3. Environmental clearance from CENRO (C)
4. Fire Safety Inspection Permit for your business permit

*Step 9: Claim Business Permit and Sticker (5)*

1. Certificate of Conformance (C)
2. Fire Safety Inspection Certificate (C)
3. CENRO clearance (C)
4. Sanitary Permit (C)
5. Application form, Tax Order of Payment, and cedula (C)

*Step 10: BIR Business Registration for Corporations and Partnerships (12)*

1. BIR Form 1903
2. SEC Certificate of Incorporation
3. Articles and By-Laws
4. Mayor's Permit or Business Permit
5. Proof of business address
6. Invoice option (choose one)
7. Documentary stamp tax
8. Special Power of Attorney and IDs
9. Work visa or Alien Employment Permit
10. DTI Certificate of Authority for BMBE
11. Proof of registration or Permit to Operate
12. Franchise documents

**Must NOT appear**

- Step 1A and its 5 requirements.
- Step 10A and its 11 requirements.
- In Step 1, requirements for other business types: Articles of Partnership.
- In Step 5: the 9 line-of-business requirements of other categories (F&B 4, Retail 5).
- In Step 8: Health Certificate for food workers [Food and Beverage version]; Health Certificate [Retail version]; Pest control contract [Food and Beverage version].
- In Step 10: SEC Certificate of Recording; Articles of Partnership.

---

## 5. What the cases cover

| Behavior | Cases that prove it |
| --- | --- |
| Step 1 depends on business type (1A vs 1B) | G-01 to G-03 vs G-04 to G-12 |
| Partnership vs Corporation vs OPC inside Step 1B | G-04 to G-06 vs G-07 to G-12 |
| Corporation and OPC give the same roadmap | G-07 vs G-10, G-08 vs G-11, G-09 vs G-12 |
| Step 10 depends on business type (10A vs 10B) | G-01 to G-03 vs G-04 to G-12 |
| Partnership vs Corporation vs OPC inside Step 10B | G-04 to G-06 vs G-07 to G-12 |
| Category-only requirement in Step 8 (Pest control, Health Certificate variants) | G-01, G-04, G-07, G-10 (F&B) vs the rest |
| Line-of-business rows by category in Step 5 | G-01/04/07/10 (4), G-02/05/08/11 (5), G-03/06/09/12 (9) |
| "All categories" requirements show no `appliesTo` | every case |

