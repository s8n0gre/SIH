/**
 * FIELD MAP: MongoDB Stats  ↔  ServiceNow x_1832142_munici_0_municipality_issues_stats
 *
 * Usage: import this map in Script Includes or Scheduled Jobs.
 * Left  = MongoDB / Node.js field name
 * Right = ServiceNow table column name
 */

var STATS_TABLE = 'x_1832142_munici_0_municipality_issues_stats';

var STATS_FIELD_MAP = {
    // Volume
    total_reports: 'u_total_reports',
    reports_today: 'u_reports_today',        // MongoDB: reportsToday
    reports_this_week: 'u_reports_this_week',    // MongoDB: reportsThisWeek
    reports_this_month: 'u_reports_this_month',   // MongoDB: reportsThisMonth
    reports_last_month: 'u_reports_last_month',   // MongoDB: reportsLastMonth
    growth_rate: 'u_growth_rate',           // MongoDB: growthRate  (Decimal)

    // Breakdown JSONs (stored as String/JSON in ServiceNow)
    reports_by_status: 'u_reports_by_status',     // MongoDB: reportsByStatus    (JSON)
    reports_by_priority: 'u_reports_by_priority',   // MongoDB: reportsByPriority  (JSON)
    reports_by_department: 'u_reports_by_department', // MongoDB: reportsByDepartment (JSON)
    reports_by_category: 'u_reports_by_category',   // MongoDB: reportsByCategory  (JSON)
    reports_by_ward: 'u_reports_by_ward',       // MongoDB: reportsByWard      (JSON)

    // Priority counts
    high_priority_count: 'u_high_priority_count',   // MongoDB: highPriorityCount
    medium_priority_count: 'u_medium_priority_count', // MongoDB: mediumPriorityCount
    low_priority_count: 'u_low_priority_count',    // MongoDB: lowPriorityCount

    // SLA & overdue
    overdue_reports: 'u_overdue_reports',        // MongoDB: overdueReports
    sla_breached_count: 'u_sla_breached_count',     // MongoDB: slaBreachedCount

    // Time metrics (hours, Decimal)
    average_response_time: 'u_average_response_time',   // MongoDB: averageResponseTime
    average_resolution_time: 'u_average_resolution_time', // MongoDB: averageResolutionTime
    median_resolution_time: 'u_median_resolution_time',  // MongoDB: medianResolutionTime

    // Trends & totals
    top_trending_category: 'u_top_trending_category',  // MongoDB: topTrendingCategory
    total_comments: 'u_total_comments',
    total_votes: 'u_total_votes',
    active_users: 'u_active_users',

    // Timestamp
    last_updated: 'u_last_updated'             // MongoDB: lastUpdated
};

// Reverse map: ServiceNow column → MongoDB field
var STATS_REVERSE_MAP = (function () {
    var rev = {};
    for (var k in STATS_FIELD_MAP) {
        rev[STATS_FIELD_MAP[k]] = k;
    }
    return rev;
}());
