// Shared configuration for the application
export const CONFIG = {
  // Refresh intervals in milliseconds
  REFRESH_INTERVALS: {
    STATS_DASHBOARD: 30000,    // 30 seconds for main dashboard stats
    LEADERBOARD: 30000,        // 30 seconds for leaderboard data
    REPORT_POLLING: 1000,      // 1 second for report polling (existing)
    PAGE_FLIP: 5000           // 5 seconds for book page flipping (existing)
  },
  
  // API endpoints
  API: {
    STATS: '/api/stats',
    GUESSING_GAME: '/api/guessing-game',
    REPORT: '/api/report',
    RESPONSES: '/api/responses'
  },
  
  // UI settings
  UI: {
    LEADERBOARD_DEFAULT_LIMIT: 10,
    LEADERBOARD_MAX_LIMIT: 50
  }
}