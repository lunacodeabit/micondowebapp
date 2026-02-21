# Mi Condo: Ecosystem Roles & Responsibility Blueprint

This document defines the operational workflows for the three key roles in the Mi Condo SaaS ecosystem and identifies the architectural gaps needed for market dominance in the Dominican Republic.

---

## 1. Role Responsibilities: Step-by-Step

### 👑 SuperAdmin (Mi Condo - SaaS Level)
*The platform owner and orchestrator.*

1.  **PMC Lifecycle Management**: Create and verify Property Management Companies (PMCs). Manage their subscription tiers (Basic, Pro, Enterprise).
2.  **Market Intelligence (Dominican Republic)**: Update global legal/civil codes in the RAG brain (Elisa) so all PMCs benefit from compliant legal advice.
3.  **Cross-Tenant Monitoring**: Use the Elisa AI Dashboard to detect systemic issues or training needs for the AI across all condos.
4.  **SaaS Monetization**: Generate billing for PMCs based on unit count or feature set. Manage platform-level revenue.
5.  **Audit & Compliance**: Provide an immutable log of transactions for legal disputes, acting as the "Final Source of Truth."

### 🏢 Admin / PMC (Property Management Company)
*The service provider using Mi Condo to manage their portfolio.*

1.  **Condo Onboarding**: Set up new buildings, upload unit lists, and configure initial balances.
2.  **Financial Operations**:
    *   **Daily**: Verify "Payment Notifications" from residents and match with bank entries.
    *   **Monthly**: Execute "Maintenance Fee Generation" (automatically charging units).
    *   **Ad-Hoc**: Create "Extraordinary Fees" for specific projects (repairs, painting).
3.  **Reporting Schedule**:
    *   **The Monthly Close**: Generate the **"Informe de Ingresos y Egresos"** (PDF) and the **"Estado de CxC"** (Aging Report).
    *   **Annual/Bi-Annual**: Generate the **"Informe de Presupuesto vs Real"** (Budgeting).
4.  **Governance (Assemblies)**:
    *   **Step 1**: Schedule Ordinary/Extraordinary Assembly.
    *   **Step 2**: Distribute digital invitations with the Agenda (Orden del Día).
    *   **Step 3**: Track Quorum (presence verification).
    *   **Step 4**: Conduct Digital Voting on key points.
    *   **Step 5**: Generate and distribute the **"Acta de Asamblea"** (Minutes).
5.  **Logistics**: Manage Maintenance Incidents (Ticketing) and Common Area Reservations.

### 🏠 Resident (Owner / Tenant)
*The end-user and beneficiary of the management.*

1.  **Financial Clarity**: Verify personal "Estado de Cuenta" (Account Statement) directly in the app.
2.  **Seamless Payments**: Report payments by uploading a photo of the receipt/transfer (verified by PMC).
3.  **Self-Service (Elisa AI)**: Query rules, request guest access codes, or ask legal questions without calling the manager.
4.  **Civic Participation**: Vote in digital assemblies and download official documents/actas.

---

## 2. Comparison & Gap Analysis (Current vs. Ideal)

| Feature Area | Current State (✅) | Missing / Gaps (🚧) |
| :--- | :--- | :--- |
| **Multi-Tenancy** | Air-tight RLS isolation, `company_id` hierarchy. | — |
| **Finance** | Transactions, Basic Fees, Payment notifications. | **Recurrent fee automation**, Bank reconciliation. |
| **Reporting** | Ingresos/Egresos PDF, Aging PDF. | **Budget vs. Actual**, Cash Flow Projections, Custom Excel Exports. |
| **Governance** | Communications (Title/Text). | **Assemblies Module**, Quorum tracking, **Digital Voting**, Meeting Minutes generator. |
| **Resident App** | Account history, basic dashboard. | **Integrated Voting UI**, Automated Reminders for debt via WhatsApp. |
| **SuperAdmin** | Elisa Monitoring Dashboard. | **SaaS Billing engine**, PMC Subscription management, Master DR Legal Updates. |

---

## 3. What is missing to have "Everything"?

To be the #1 SaaS in the Dominican Republic, the priority roadmap should be:

1.  **The Assembly Engine**: This is the "Glue" of legal management. We need a way to schedule meetings, record attendance, and allow residents to vote on-app.
2.  **Budgeting & Transparency**: Dominican owners care deeply about "Where is the money going?". A comparison between what was budgeted vs what was spent is the ultimate transparency tool.
3.  **WhatsApp / Bot Interaction**: Expanding Elisa beyond the web app. Integration with WhatsApp (via yCloud/n8n) to allow residents to report payments or get info via chat.
4.  **SaaS Billing (The Business)**: A dashboard for YOU to charge the PMCs automatically.

> [!IMPORTANT]
> **Conclusion**: The architecture is 100% ready for these modules thanks to the RLS isolation work. We have the "Foundation" (Isolation + Core Finance); now we need to build the "High-Value Modules" (Assemblies + Budgeting + Bot Integration).
