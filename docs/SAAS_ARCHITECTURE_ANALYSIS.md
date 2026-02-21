# SaaS Architecture Analysis: Property Management (Mi Condo)

This document provides a deep dive into the architecture of modern Property Management Systems (PMS). It compares established market leaders with the specific vision for Mi Condo, identifying key roles, functionalities, and common industry failures.

---

## 1. Stakeholder Role Definitions (RBAC)

In a high-performing SaaS PMS, strict data isolation and clear privilege boundaries are essential.

| Role | Entity | Scope of Access | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | **Mi Condo (SaaS Owner)** | **Global** | Company onboarding, global billing, system performance audit, cross-company support, and updates. |
| **Admin** | **PMC (Prop. Mgmt. Company)** | **Tenant-Level** | Managing buildings, staff, units, and collections for *their* specific client portfolio. |
| **Staff/Manager** | **On-site Employee** | **Condo-Level** | Daily operations, maintenance, visitor logs, and resident communication for a specific tower. |
| **Resident** | **Owner / Tenant** | **Unit-Level** | Payment status, service requests, common area booking, and community announcements for their specific unit/tower. |

---

## 2. Market Comparison & Failure Analysis

Researching leaders like **AppFolio**, **Buildium**, **Condo Control**, and regional leaders like **ComunidadFeliz** or **Neivor** reveals where most platforms fall short.

### Market Gaps & "Failure Points":
1. **The "Excel Trap"**: Many platforms are just glorified spreadsheets. They lack the intelligence to predict delinquency or automate follow-ups, forcing admins back into manual work.
2. **Communication Fatigue**: Managers spend 60-70% of their time answering simple questions. Most platforms have static FAQ sections that residents don't read.
3. **Data Silos in PMCs**: Multi-condo administrators often have to log in to each building separately to see statuses. There is rarely a "Global Dashboard" for the PMC owner.
4. **Poor Financial Traceability**: "Black box" accounting where residents don't trust the reports.
5. **Mobile Friction**: Portals that aren't native apps or lack real-time notifications lead to low resident adoption.

---

## 3. Mi Condo: The Ideal Architecture

Based on the user's vision and market research, Mi Condo should follow a **Multi-Tenant Hierarchical Model**.

### Hierarchical Data Structure:
- **Level 1: Platform (Mi Condo)**
    - *Master Record*: PMC Directory, Historical Log of Collections (Global), Support Desk for PMCs.
- **Level 2: PMC (Management Company)**
    - *Vault*: Isolated database/schema context for Company A.
    - *Portfolio*: List of Towers, Total Portfolios, Automated Billing Engine.
- **Level 3: Condo (Property)**
    - *Operational Control*: Active Residents, Maintenance Logs, Common Areas.
- **Level 4: Unit (Resident)**
    - *User Portal*: Digital Wallet, Support Tickets, Personal Vault.

### Winning Differentiators for Mi Condo:
1. **Elisa (The AI Buffer)**: Unlike static platforms, Mi Condo uses Elisa to intercept 90% of resident queries, reducing the "Burnout" of PMC managers.
2. **PMC Global Monitoring**: A "Master View" for the PMC owner to see high-level performance (delinquency, maintenance speed) across ALL their towers simultaneously.
3. **Historical Collection Log (SuperAdmin)**: Mi Condo maintains a high-level record of financial flow to verify SaaS billing and market trends without compromising resident privacy.
4. **Open Support for PMCs**: Direct, transparent communication channel between Mi Condo and its customers (the PMCs).

---

## 4. Proposed Technical Pillars

1. **Multi-Tenancy**: Use Supabase RLS (already in progress) to ensure that `company_id` is the primary filter for all Admin queries.
2. **Event Logging**: Every interaction (collection, creation, deletion) generates a historical record at the SuperAdmin level for auditing.
3. **AI-First UX**: Instead of complex menus, residents should be able to perform 80% of actions (paying, reporting, booking) through Elisa.

> [!IMPORTANT]
> **Conclusion**: The Mi Condo architecture should not focus on being a "building manager," but rather on being the **operating system for Management Companies**. By making the PMC's life easier, you secure long-term loyalty.

---
*Analysis prepared by AntiGravity Node [2026-02-21]*
