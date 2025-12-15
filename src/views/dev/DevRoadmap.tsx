import React, { useState } from "react";
import { Icon } from "../../components/ui/Icon";

// ===========================================
// TYPES
// ===========================================
type RoadmapStatus = "completed" | "in-progress" | "bug" | "planned" | "future";
type RoadmapCategory =
  | "security"
  | "feature"
  | "ui"
  | "backend"
  | "testing"
  | "deployment"
  | "documentation";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  category: RoadmapCategory;
  priority: "critical" | "high" | "medium" | "low";
  dateCompleted?: string;
  dateAdded: string;
  linkedFiles?: string[];
}

interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  targetDate?: string;
  items: RoadmapItem[];
}

// ===========================================
// ROADMAP DATA - Update this as you progress!
// ===========================================
const ROADMAP_DATA: RoadmapPhase[] = [
  {
    id: "phase-1",
    name: "🔐 Phase 1: Security Hardening",
    description: "Critical security fixes before any public deployment",
    targetDate: "2024-12-14",
    items: [
      {
        id: "sec-001",
        title: "Remove hardcoded Super Admin UID",
        description:
          "Move SUPER_ADMIN_UID to environment variable (VITE_SUPER_ADMIN_UID)",
        status: "completed",
        category: "security",
        priority: "critical",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: ["src/context/AuthContext.tsx"],
      },
      {
        id: "sec-002",
        title: "Remove hardcoded Company ID",
        description:
          "Dynamic companyId from AuthContext instead of hardcoded value",
        status: "completed",
        category: "security",
        priority: "critical",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: [
          "src/context/CondoContext.tsx",
          "src/context/AuthContext.tsx",
        ],
      },
      {
        id: "sec-003",
        title: "Create Firestore Security Rules",
        description:
          "Implement proper security rules for multi-tenant isolation",
        status: "completed",
        category: "security",
        priority: "critical",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: ["firestore.rules"],
      },
      {
        id: "sec-004",
        title: "Create Storage Security Rules",
        description: "Implement storage rules for file uploads",
        status: "completed",
        category: "security",
        priority: "critical",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: ["storage.rules"],
      },
      {
        id: "sec-005",
        title: "Environment Variables Setup",
        description:
          "Create .env.example template and configure Firebase with env vars",
        status: "completed",
        category: "security",
        priority: "high",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: [
          ".env.example",
          "src/firebaseConfig.ts",
          "src/vite-env.d.ts",
        ],
      },
      {
        id: "sec-006",
        title: "Multi-tenant Data Isolation",
        description: "Admins only see condos from their company",
        status: "completed",
        category: "security",
        priority: "critical",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: ["src/context/CondoContext.tsx"],
      },
    ],
  },
  {
    id: "phase-1b",
    name: "🎛️ Phase 1.5: SuperAdmin Dashboard",
    description: "Complete SuperAdmin portal with billing and communications",
    targetDate: "2024-12-14",
    items: [
      {
        id: "sa-001",
        title: "Ver Clientes Button Fix",
        description: "Modal showing condos for each company with unit counts",
        status: "completed",
        category: "feature",
        priority: "high",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: ["src/views/admin/SuperAdminDashboard.tsx"],
      },
      {
        id: "sa-002",
        title: "SaaS Metrics Dashboard",
        description:
          "KPIs: Total clients, active, grace period, MRR, upcoming renewals",
        status: "completed",
        category: "feature",
        priority: "high",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: ["src/views/admin/SuperAdminDashboard.tsx"],
      },
      {
        id: "sa-003",
        title: "Tab Navigation System",
        description: "Tabs for Companies, Billing, and Communications",
        status: "completed",
        category: "ui",
        priority: "medium",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: ["src/views/admin/SuperAdminDashboard.tsx"],
      },
      {
        id: "sa-004",
        title: "Billing/Payment Tracking",
        description: "Register payments, view history, monthly totals",
        status: "completed",
        category: "feature",
        priority: "critical",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: [
          "src/views/admin/SuperAdminDashboard.tsx",
          "src/types/index.ts",
        ],
      },
      {
        id: "sa-005",
        title: "Announcements System",
        description: "Publish global announcements to all clients",
        status: "completed",
        category: "feature",
        priority: "high",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: [
          "src/views/admin/SuperAdminDashboard.tsx",
          "src/types/index.ts",
        ],
      },
      {
        id: "sa-006",
        title: "New TypeScript Types",
        description: "SaasPayment, SaasAnnouncement, SaasMessage types",
        status: "completed",
        category: "backend",
        priority: "medium",
        dateAdded: "2024-12-14",
        dateCompleted: "2024-12-14",
        linkedFiles: ["src/types/index.ts"],
      },
    ],
  },
  {
    id: "phase-2",
    name: "🧪 Phase 2: Testing & Quality",
    description: "Automated testing to ensure reliability",
    targetDate: "2024-12-21",
    items: [
      {
        id: "test-001",
        title: "Setup Vitest Testing Framework",
        description: "Install and configure Vitest for unit testing",
        status: "planned",
        category: "testing",
        priority: "critical",
        dateAdded: "2024-12-14",
        linkedFiles: ["package.json", "vitest.config.ts"],
      },
      {
        id: "test-002",
        title: "Unit Tests for Finance Utils",
        description:
          "Test recalculateBalances and calculateAgingBalances functions",
        status: "planned",
        category: "testing",
        priority: "high",
        dateAdded: "2024-12-14",
        linkedFiles: ["src/utils/finance.ts"],
      },
      {
        id: "test-003",
        title: "Unit Tests for Date Utils",
        description: "Test date formatting and manipulation functions",
        status: "planned",
        category: "testing",
        priority: "medium",
        dateAdded: "2024-12-14",
        linkedFiles: ["src/utils/date.ts"],
      },
      {
        id: "test-004",
        title: "Integration Tests for Auth Flow",
        description: "Test login, logout, and role detection",
        status: "future",
        category: "testing",
        priority: "high",
        dateAdded: "2024-12-14",
        linkedFiles: ["src/context/AuthContext.tsx"],
      },
    ],
  },
  {
    id: "phase-3",
    name: "💰 Phase 3: SaaS Monetization",
    description: "Payment integration and billing features",
    targetDate: "2025-01-15",
    items: [
      {
        id: "pay-001",
        title: "Stripe Integration",
        description: "Integrate Stripe for subscription billing",
        status: "future",
        category: "feature",
        priority: "critical",
        dateAdded: "2024-12-14",
      },
      {
        id: "pay-002",
        title: "Subscription Plans UI",
        description: "Create pricing page and plan selection",
        status: "future",
        category: "ui",
        priority: "high",
        dateAdded: "2024-12-14",
      },
      {
        id: "pay-003",
        title: "Billing Portal",
        description: "Customer billing history and invoice management",
        status: "future",
        category: "feature",
        priority: "medium",
        dateAdded: "2024-12-14",
      },
      {
        id: "pay-004",
        title: "Grace Period Automation",
        description: "Auto-deactivate companies after grace period expires",
        status: "future",
        category: "backend",
        priority: "high",
        dateAdded: "2024-12-14",
      },
    ],
  },
  {
    id: "phase-4",
    name: "📧 Phase 4: Communications",
    description: "Email and notification services",
    targetDate: "2025-01-30",
    items: [
      {
        id: "comm-001",
        title: "Email Service Integration",
        description: "Integrate SendGrid or AWS SES for transactional emails",
        status: "future",
        category: "backend",
        priority: "high",
        dateAdded: "2024-12-14",
      },
      {
        id: "comm-002",
        title: "Payment Reminder Emails",
        description: "Automated payment reminders to residents",
        status: "future",
        category: "feature",
        priority: "medium",
        dateAdded: "2024-12-14",
      },
      {
        id: "comm-003",
        title: "Push Notifications",
        description: "Firebase Cloud Messaging for mobile notifications",
        status: "future",
        category: "feature",
        priority: "low",
        dateAdded: "2024-12-14",
      },
    ],
  },
  {
    id: "phase-5",
    name: "🚀 Phase 5: Production Launch",
    description: "Final preparations for public launch",
    targetDate: "2025-02-15",
    items: [
      {
        id: "launch-001",
        title: "Performance Optimization",
        description: "Code splitting, lazy loading, bundle optimization",
        status: "future",
        category: "deployment",
        priority: "high",
        dateAdded: "2024-12-14",
      },
      {
        id: "launch-002",
        title: "Error Monitoring (Sentry)",
        description: "Integrate Sentry for error tracking in production",
        status: "future",
        category: "deployment",
        priority: "high",
        dateAdded: "2024-12-14",
      },
      {
        id: "launch-003",
        title: "Analytics Dashboard",
        description: "Usage analytics for SuperAdmin",
        status: "future",
        category: "feature",
        priority: "medium",
        dateAdded: "2024-12-14",
      },
      {
        id: "launch-004",
        title: "Documentation & Help Center",
        description: "User documentation and FAQ",
        status: "future",
        category: "documentation",
        priority: "medium",
        dateAdded: "2024-12-14",
      },
    ],
  },
  {
    id: "bugs",
    name: "🐛 Known Bugs & Issues",
    description: "Bugs that need to be fixed",
    items: [
      {
        id: "bug-001",
        title: "Resident lookup scalability",
        description:
          "Current implementation loops through all condos to find resident - needs optimization for 100+ condos",
        status: "bug",
        category: "backend",
        priority: "medium",
        dateAdded: "2024-12-14",
        linkedFiles: ["src/context/AuthContext.tsx"],
      },
    ],
  },
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================
const getStatusConfig = (status: RoadmapStatus) => {
  const configs = {
    completed: {
      icon: "check-circle",
      color: "text-green-400",
      bg: "bg-green-500/20",
      label: "Completado",
    },
    "in-progress": {
      icon: "loader",
      color: "text-blue-400",
      bg: "bg-blue-500/20",
      label: "En Progreso",
    },
    bug: {
      icon: "bug",
      color: "text-red-400",
      bg: "bg-red-500/20",
      label: "Bug",
    },
    planned: {
      icon: "clock",
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
      label: "Planificado",
    },
    future: {
      icon: "calendar",
      color: "text-neutral-400",
      bg: "bg-neutral-500/20",
      label: "Futuro",
    },
  };
  return configs[status];
};

const getPriorityConfig = (priority: string) => {
  const configs: Record<string, { color: string; label: string }> = {
    critical: { color: "text-red-400", label: "Crítico" },
    high: { color: "text-orange-400", label: "Alto" },
    medium: { color: "text-yellow-400", label: "Medio" },
    low: { color: "text-neutral-400", label: "Bajo" },
  };
  return configs[priority];
};

const getCategoryConfig = (category: RoadmapCategory) => {
  const configs = {
    security: { icon: "shield", color: "text-red-400" },
    feature: { icon: "star", color: "text-purple-400" },
    ui: { icon: "layout", color: "text-pink-400" },
    backend: { icon: "database", color: "text-blue-400" },
    testing: { icon: "flask-conical", color: "text-green-400" },
    deployment: { icon: "rocket", color: "text-orange-400" },
    documentation: { icon: "book-open", color: "text-cyan-400" },
  };
  return configs[category];
};

// ===========================================
// COMPONENTS
// ===========================================
const ProgressBar = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-400">
          {completed} de {total} tareas
        </span>
        <span className="text-white font-bold">{percentage}%</span>
      </div>
      <div className="w-full bg-neutral-700 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const RoadmapItemCard = ({ item }: { item: RoadmapItem }) => {
  const statusConfig = getStatusConfig(item.status);
  const priorityConfig = getPriorityConfig(item.priority);
  const categoryConfig = getCategoryConfig(item.category);

  return (
    <div
      className={`p-4 rounded-lg border border-neutral-700 ${statusConfig.bg} hover:border-neutral-600 transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon
              name={statusConfig.icon}
              className={`w-5 h-5 ${statusConfig.color}`}
            />
            <h4 className="font-semibold text-white">{item.title}</h4>
          </div>
          <p className="text-sm text-neutral-400 mb-3">{item.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full bg-neutral-800 ${categoryConfig.color} flex items-center gap-1`}
            >
              <Icon name={categoryConfig.icon} className="w-3 h-3" />
              {item.category}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full bg-neutral-800 ${priorityConfig.color}`}
            >
              {priorityConfig.label}
            </span>
            {item.dateCompleted && (
              <span className="text-xs text-green-400">
                ✓ {item.dateCompleted}
              </span>
            )}
          </div>
          {item.linkedFiles && item.linkedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.linkedFiles.map((file) => (
                <code
                  key={file}
                  className="text-xs bg-neutral-800 px-2 py-0.5 rounded text-cyan-400"
                >
                  {file}
                </code>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PhaseCard = ({
  phase,
  isExpanded,
  onToggle,
}: {
  phase: RoadmapPhase;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const completedCount = phase.items.filter(
    (i) => i.status === "completed"
  ).length;
  const totalCount = phase.items.length;
  const hasCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div
      className={`bg-neutral-900 rounded-xl border ${hasCompleted ? "border-green-500/50" : "border-neutral-700"} overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${hasCompleted ? "bg-green-500/20" : "bg-neutral-800"}`}
          >
            {hasCompleted ? (
              <Icon name="check" className="w-6 h-6 text-green-400" />
            ) : (
              <span className="text-xl">{phase.name.split(" ")[0]}</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">
              {phase.name.substring(phase.name.indexOf(" ") + 1)}
            </h3>
            <p className="text-sm text-neutral-400">{phase.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-neutral-400">
              {completedCount}/{totalCount} completadas
            </div>
            {phase.targetDate && (
              <div className="text-xs text-neutral-500">
                Meta: {phase.targetDate}
              </div>
            )}
          </div>
          <Icon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            className="w-5 h-5 text-neutral-400"
          />
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-neutral-800">
          <div className="mb-4">
            <ProgressBar completed={completedCount} total={totalCount} />
          </div>
          <div className="grid gap-3">
            {phase.items.map((item) => (
              <RoadmapItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================
export const DevRoadmap = ({ onClose }: { onClose?: () => void }) => {
  const [expandedPhases, setExpandedPhases] = useState<string[]>([
    "phase-1",
    "bugs",
  ]);
  const [filter, setFilter] = useState<RoadmapStatus | "all">("all");

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((id) => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  // Calculate overall stats
  const allItems = ROADMAP_DATA.flatMap((p) => p.items);
  const stats = {
    total: allItems.length,
    completed: allItems.filter((i) => i.status === "completed").length,
    inProgress: allItems.filter((i) => i.status === "in-progress").length,
    bugs: allItems.filter((i) => i.status === "bug").length,
    planned: allItems.filter((i) => i.status === "planned").length,
    future: allItems.filter((i) => i.status === "future").length,
  };

  const overallProgress = Math.round((stats.completed / stats.total) * 100);

  // Determine launch readiness
  const criticalItems = allItems.filter((i) => i.priority === "critical");
  const criticalCompleted = criticalItems.filter(
    (i) => i.status === "completed"
  ).length;
  const isLaunchReady =
    criticalCompleted === criticalItems.length && stats.bugs === 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon name="map" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Development Roadmap</h1>
              <p className="text-sm text-neutral-400">
                Mi Condo - SaaS Progress Tracker
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Launch Readiness Banner */}
        <div
          className={`mb-8 p-6 rounded-xl border ${isLaunchReady ? "bg-green-500/10 border-green-500/50" : "bg-yellow-500/10 border-yellow-500/50"}`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${isLaunchReady ? "bg-green-500/20" : "bg-yellow-500/20"}`}
            >
              <Icon
                name={isLaunchReady ? "rocket" : "alert-triangle"}
                className={`w-8 h-8 ${isLaunchReady ? "text-green-400" : "text-yellow-400"}`}
              />
            </div>
            <div className="flex-1">
              <h2
                className={`text-2xl font-bold ${isLaunchReady ? "text-green-400" : "text-yellow-400"}`}
              >
                {isLaunchReady
                  ? "🚀 Ready for Launch!"
                  : "⚠️ Not Production Ready"}
              </h2>
              <p className="text-neutral-300">
                {isLaunchReady
                  ? "All critical items completed and no known bugs!"
                  : `${criticalItems.length - criticalCompleted} critical items pending, ${stats.bugs} bugs to fix`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {overallProgress}%
              </div>
              <div className="text-sm text-neutral-400">Overall Progress</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "Completados",
              value: stats.completed,
              color: "text-green-400",
              icon: "check-circle",
            },
            {
              label: "En Progreso",
              value: stats.inProgress,
              color: "text-blue-400",
              icon: "loader",
            },
            {
              label: "Bugs",
              value: stats.bugs,
              color: "text-red-400",
              icon: "bug",
            },
            {
              label: "Planificados",
              value: stats.planned,
              color: "text-yellow-400",
              icon: "clock",
            },
            {
              label: "Futuros",
              value: stats.future,
              color: "text-neutral-400",
              icon: "calendar",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-neutral-900 rounded-xl p-4 border border-neutral-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon name={stat.icon} className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm text-neutral-400">{stat.label}</span>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Phases */}
        <div className="space-y-4">
          {ROADMAP_DATA.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isExpanded={expandedPhases.includes(phase.id)}
              onToggle={() => togglePhase(phase.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-neutral-500 text-sm">
          <p>Last updated: December 14, 2024</p>
          <p className="mt-1">
            Edit{" "}
            <code className="text-cyan-400">src/views/dev/DevRoadmap.tsx</code>{" "}
            to update the roadmap
          </p>
        </footer>
      </main>
    </div>
  );
};

export default DevRoadmap;
