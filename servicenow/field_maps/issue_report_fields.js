/**
 * FIELD MAP: MongoDB Reports  ↔  ServiceNow tx_1832142_munici_0_municipal_issue_report
 *
 * Usage: import this map in Script Includes or Transform Maps.
 * Left  = MongoDB / Node.js field name
 * Right = ServiceNow table column name
 */

var ISSUE_REPORT_TABLE = 'x_1832142_munici_0_municipal_issue_report';

var ISSUE_REPORT_FIELD_MAP = {
    // Identification
    _id: 'u_mongo_id',          // MongoDB ObjectId string
    ticket_number: 'u_ticket_number',     // MongoDB: ticketNumber  e.g. TKT-1234567890
    title: 'u_title',
    description: 'u_description',       // HTML (Journal Input equivalent)

    // Categorisation
    category: 'u_category',
    sub_category: 'u_sub_category',      // MongoDB: subCategory

    // Routing
    department_id: 'u_department_id',     // MongoDB: departmentId
    reported_by: 'u_reported_by',       // MongoDB: reportedBy  (Mongo _id → citizen sys_id)
    ward_id: 'u_ward_id',
    zone_id: 'u_zone_id',
    municipality_id: 'u_municipality_id',

    // Location (flat)
    location_address: 'u_location_address',  // MongoDB: locationAddress
    latitude: 'u_latitude',
    longitude: 'u_longitude',

    // Prioritisation
    impact: 'u_impact',            // low | medium | high | critical
    urgency: 'u_urgency',           // low | medium | high | critical
    priority: 'u_priority',          // low | medium | high | urgent

    // Status & Assignment
    status: 'u_status',            // open | assigned | in_progress | resolved | closed
    assignment_group_id: 'u_assignment_group_id', // MongoDB: assignmentGroupId
    assigned_to: 'u_assigned_to',       // MongoDB: assignedTo (Mongo _id)

    // SLA
    sla_id: 'u_sla_id',
    sla_deadline: 'u_sla_deadline',      // MongoDB: slaDeadline
    escalation_level: 'u_escalation_level',  // MongoDB: escalationLevel (Integer)

    // Media
    images: 'u_images',            // Comma-separated URLs
    attachments: 'u_attachments',       // Comma-separated URLs

    // AI Analysis (flat)
    ai_detected_category: 'u_ai_detected_category',    // MongoDB: aiDetectedCategory
    ai_severity_prediction: 'u_ai_severity_prediction',  // MongoDB: aiSeverityPrediction
    ai_confidence_score: 'u_ai_confidence_score',     // MongoDB: aiConfidenceScore  (Decimal)
    ai_recommendation: 'u_ai_recommendation',       // MongoDB: aiRecommendation  (HTML)
    ai_model_version: 'u_ai_model_version',        // MongoDB: aiModelVersion

    // Engagement
    upvotes: 'u_upvotes',
    downvotes: 'u_downvotes',
    unique_voter_ids: 'u_unique_voter_ids',  // MongoDB: uniqueVoterIds (Glide List)
    views: 'u_views',
    engagement_score: 'u_engagement_score', // MongoDB: engagementScore (Decimal)

    // Comments & Timeline (Journal fields - append-only in ServiceNow)
    comments: 'u_comments',          // Journal Input
    timeline: 'u_timeline',          // Journal Input

    // Resolution
    resolution_notes: 'u_resolution_notes',         // MongoDB: resolutionNotes  (HTML)
    resolution_category: 'u_resolution_category',      // MongoDB: resolutionCategory
    closure_code: 'u_closure_code',             // MongoDB: closureCode
    resolved_at: 'u_resolved_at',              // MongoDB: resolvedAt
    closed_at: 'u_closed_at',                // MongoDB: closedAt
    citizen_satisfaction_rating: 'u_citizen_satisfaction_rating', // Integer 1–5
    reopened_count: 'u_reopened_count',           // MongoDB: reopenedCount

    // Flags
    is_anonymous: 'u_is_anonymous',      // MongoDB: isAnonymous
    trending: 'u_trending',

    // Timestamps
    created_at: 'u_created_at',        // MongoDB: createdAt
    updated_at: 'u_updated_at'         // MongoDB: updatedAt
};

// Reverse map: ServiceNow column → MongoDB field
var ISSUE_REPORT_REVERSE_MAP = (function () {
    var rev = {};
    for (var k in ISSUE_REPORT_FIELD_MAP) {
        rev[ISSUE_REPORT_FIELD_MAP[k]] = k;
    }
    return rev;
}());
