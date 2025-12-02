/**
 * Dashboard Configuration
 * Customize colors, refresh intervals, and display settings
 */

export const dashboardConfig = {
  // App Settings
  app: {
    name: "DeepSoul Threat Intelligence",
    subtitle: "Real-time Network Security Monitoring",
    refreshInterval: 30000, // milliseconds (30 seconds)
  },

  // n8n Integration
  n8n: {
    webhookUrl: "", // Add your n8n webhook URL here
    enabled: false, // Set to true when you have a webhook URL
  },

  // Theme Colors (Neon Purple by default)
  theme: {
    primary: "#a855f7",      // purple-500
    secondary: "#ec4899",    // pink-500
    accent: "#06b6d4",       // cyan-500
    background: "#020617",   // slate-950
    cardBg: "#0f172a",       // slate-900
  },

  // Severity Colors
  severityColors: {
    high: {
      text: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-500/50",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)]"
    },
    medium: {
      text: "text-yellow-400",
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/50",
      glow: "shadow-[0_0_20px_rgba(234,179,8,0.6)]"
    },
    low: {
      text: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500/50",
      glow: "shadow-[0_0_20px_rgba(34,197,94,0.6)]"
    }
  },

  // Table Settings
  table: {
    itemsPerPage: 10,
    defaultSort: "Timestamp",
    defaultSortDirection: "desc"
  },

  // Chart Settings
  charts: {
    animationDuration: 1000,
    colors: {
      purple: '#a855f7',
      pink: '#ec4899',
      blue: '#3b82f6',
      cyan: '#06b6d4',
      red: '#ef4444',
      yellow: '#eab308',
      green: '#22c55e',
      orange: '#f97316',
    }
  },

  // Alert Settings
  alerts: {
    showCritical: true,
    showConflicts: true,
    autoDismiss: false,
    autoDismissDelay: 10000 // milliseconds
  },

  // Feature Flags
  features: {
    enableSearch: true,
    enableFilters: true,
    enableExport: false, // Future feature
    enableNotifications: false, // Future feature
    showGeolocation: true,
    showTimeline: true,
  }
};

export default dashboardConfig;

