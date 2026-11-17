# "Not sure" Helper Text (US-012-AI-01)

**Ticket:** US-012-AI-01 (AB#121), parent US-012A (AB#37)
**Used by:** US-012-FE-02 (AB#127), the "Not sure" helper on the assessment's type step
**Design:** `docs/design/US-012-UI-01-describe-and-not-sure.html`, Screen 3. This file replaces the design's draft `HELPER` text.

Copy the text below exactly. Source numbers in brackets point to Section 3 and
are not shown in the app.

## 1. Question

> **Ikaw lang ba ang may-ari?**
> Are you the only owner?

Answers: **Yes** / **No**

## 2. Answer text

### Yes

**Title:** Sole Proprietorship fits you

**Reason:** You own the business alone. You register your business name online
with DTI (Department of Trade and Industry). [1] [2]

**Also for one owner:** A One Person Corporation (OPC) also has one owner and
registers with SEC (Securities and Exchange Commission). It keeps your own money
and property safe from the business's debts, as long as you keep the two
separate. [4] [5] [6]

### No

**Partnership:** Two or more people put in money or property and share the
profits. You register it with SEC (Securities and Exchange Commission). [3] [6]

**Corporation:** The business counts as its own "person" under the law, and its
owners each hold shares (parts of the business). You also register it with
SEC. [3] [6]

## 3. Sources

Checked 2026-11-17.

| # | Fact | Source |
|---|---|---|
| 1 | Sole proprietors register a business name with DTI, online through BNRS | DTI, Apply for a Business Name: https://www.dti.gov.ph/dti-business-center/dti-apply-for-a-business-name |
| 2 | Registering with DTI gives a sole proprietorship its legal identity and the right to use its business name | DTI, Business Registration and Permits: https://www.dti.gov.ph/dti-business-center/dti-business-registration-permits |
| 3 | Sole proprietorship: one owner, whose personal assets answer for the business's debts. Partnership: two or more people contribute assets and divide the profits. Corporation: a separate entity, and stock corporations divide capital into shares | DTI (Negosyo Center business types), CMCI Guidelines for Annex A & B: https://cmci.dti.gov.ph/downloads/forms/Guidelines%20for%20Annex%20A%20&%20B.pdf |
| 4 | An OPC is a corporation with a single stockholder, and the stockholder's liability is limited to the capital invested | Same DTI source as #3, and RA 11232 (Revised Corporation Code), Sec. 116 |
| 5 | The single stockholder loses that protection if they can't show the OPC's property is separate from their own | RA 11232, Sec. 130, on the SEC site: https://appointment.sec.gov.ph/wp-content/uploads/2019/11/2019Legislation_RA-11232-REVISED-CORPORATION-CODE-2019.pdf |
| 6 | OPCs and corporations register with SEC through eSPARC. Partnerships are recorded through eSPARC too | SEC eSPARC: https://esparc.sec.gov.ph/application/select-regular |

## 4. Notes for the frontend

- The words "DTI" and "SEC" always appear with their full names the first time
  on a screen, as above.
- "Yes" pre-selects Sole Proprietorship. "No" shows Partnership and Corporation
  side by side. The user can still pick any of the 4 types (US-012-FE-02).
- No fees, processing times, or tax rules here. Those change and belong to the
  roadmap steps (1A and 1B), not to this helper.
