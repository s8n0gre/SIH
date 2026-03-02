/**
 * SCRIPT INCLUDE: MunicipalIssueReportUtil
 * Table: tx_1832142_munici_0_municipal_issue_report
 *
 * Paste this entire file under:
 *   System Definition → Script Includes → New
 *   Name: MunicipalIssueReportUtil
 *   Accessible from: All application scopes
 */
var MunicipalIssueReportUtil = Class.create();
MunicipalIssueReportUtil.prototype = {

    initialize: function () { },

    TABLE: 'tx_1832142_munici_0_municipal_issue_report',

    /**
     * Create or update an issue report from a MongoDB Report document.
     * @param {Object} mongoReport - Raw MongoDB Report document (camelCase)
     * @returns {String} sys_id of the created/updated ServiceNow record
     */
    upsertFromMongo: function (mongoReport) {
        var gr = new GlideRecord(this.TABLE);
        var isNew = true;

        if (mongoReport._id) {
            gr.addQuery('u_mongo_id', mongoReport._id.toString());
            gr.query();
            if (gr.next()) {
                isNew = false;
            } else {
                gr.initialize();
            }
        } else {
            gr.initialize();
        }

        // Identification
        this._set(gr, 'u_mongo_id', mongoReport._id);
        this._set(gr, 'u_ticket_number', mongoReport.ticketNumber);
        this._set(gr, 'u_title', mongoReport.title);
        this._set(gr, 'u_description', mongoReport.description);

        // Categorisation
        this._set(gr, 'u_category', mongoReport.category);
        this._set(gr, 'u_sub_category', mongoReport.subCategory);

        // Routing
        this._set(gr, 'u_department_id', mongoReport.departmentId);
        this._set(gr, 'u_reported_by', mongoReport.reportedBy);
        this._set(gr, 'u_ward_id', mongoReport.wardId);
        this._set(gr, 'u_zone_id', mongoReport.zoneId);
        this._set(gr, 'u_municipality_id', mongoReport.municipalityId);

        // Location (flat)
        this._set(gr, 'u_location_address', mongoReport.locationAddress);
        this._setNum(gr, 'u_latitude', mongoReport.latitude);
        this._setNum(gr, 'u_longitude', mongoReport.longitude);

        // Prioritisation
        this._set(gr, 'u_impact', mongoReport.impact);
        this._set(gr, 'u_urgency', mongoReport.urgency);
        this._set(gr, 'u_priority', mongoReport.priority);

        // Status & assignment
        this._set(gr, 'u_status', mongoReport.status);
        this._set(gr, 'u_assignment_group_id', mongoReport.assignmentGroupId);
        this._set(gr, 'u_assigned_to', mongoReport.assignedTo);

        // SLA
        this._set(gr, 'u_sla_id', mongoReport.slaId);
        this._setDate(gr, 'u_sla_deadline', mongoReport.slaDeadline);
        this._setNum(gr, 'u_escalation_level', mongoReport.escalationLevel);

        // Media (arrays → comma-separated)
        this._set(gr, 'u_images', this._arrayToList(mongoReport.images));
        this._set(gr, 'u_attachments', this._arrayToList(mongoReport.attachments));

        // AI analysis
        this._set(gr, 'u_ai_detected_category', mongoReport.aiDetectedCategory);
        this._set(gr, 'u_ai_severity_prediction', mongoReport.aiSeverityPrediction);
        this._setNum(gr, 'u_ai_confidence_score', mongoReport.aiConfidenceScore);
        this._set(gr, 'u_ai_recommendation', mongoReport.aiRecommendation);
        this._set(gr, 'u_ai_model_version', mongoReport.aiModelVersion);

        // Engagement
        this._setNum(gr, 'u_upvotes', mongoReport.upvotes);
        this._setNum(gr, 'u_downvotes', mongoReport.downvotes);
        this._set(gr, 'u_unique_voter_ids', this._arrayToList(mongoReport.uniqueVoterIds));
        this._setNum(gr, 'u_views', mongoReport.views);
        this._setNum(gr, 'u_engagement_score', mongoReport.engagementScore);

        // Comments & timeline (append summarised text; full history kept in Mongo)
        if (mongoReport.comments && mongoReport.comments.length) {
            var commentSummary = mongoReport.comments.map(function (c) {
                return '[' + (c.timestamp || '') + '] ' + (c.text || '');
            }).join('\n---\n');
            this._set(gr, 'u_comments', commentSummary);
        }
        if (mongoReport.timeline && mongoReport.timeline.length) {
            var timelineSummary = mongoReport.timeline.map(function (t) {
                return '[' + (t.timestamp || '') + '] ' + (t.action || '') + ': ' + (t.notes || '');
            }).join('\n---\n');
            this._set(gr, 'u_timeline', timelineSummary);
        }

        // Resolution
        this._set(gr, 'u_resolution_notes', mongoReport.resolutionNotes);
        this._set(gr, 'u_resolution_category', mongoReport.resolutionCategory);
        this._set(gr, 'u_closure_code', mongoReport.closureCode);
        this._setDate(gr, 'u_resolved_at', mongoReport.resolvedAt);
        this._setDate(gr, 'u_closed_at', mongoReport.closedAt);
        this._setNum(gr, 'u_citizen_satisfaction_rating', mongoReport.citizenSatisfactionRating);
        this._setNum(gr, 'u_reopened_count', mongoReport.reopenedCount);

        // Flags
        this._setBool(gr, 'u_is_anonymous', mongoReport.isAnonymous);
        this._setBool(gr, 'u_trending', mongoReport.trending);

        // Timestamps
        this._setDate(gr, 'u_created_at', mongoReport.createdAt);
        this._setDate(gr, 'u_updated_at', mongoReport.updatedAt);

        var sysId = isNew ? gr.insert() : (gr.update(), gr.getUniqueValue());
        return sysId;
    },

    /**
     * Update only the status (and optionally resolution fields) of a report.
     * @param {String} mongoId
     * @param {String} newStatus
     * @param {Object} extra  - optional { resolvedAt, closedAt, resolutionNotes }
     */
    updateStatus: function (mongoId, newStatus, extra) {
        var gr = new GlideRecord(this.TABLE);
        gr.addQuery('u_mongo_id', mongoId);
        gr.query();
        if (!gr.next()) return false;

        gr.setValue('u_status', newStatus);
        if (extra) {
            if (extra.resolvedAt) this._setDate(gr, 'u_resolved_at', extra.resolvedAt);
            if (extra.closedAt) this._setDate(gr, 'u_closed_at', extra.closedAt);
            if (extra.resolutionNotes) gr.setValue('u_resolution_notes', extra.resolutionNotes);
        }
        gr.update();
        return true;
    },

    /**
     * Read a report and return it as a plain JS object using MongoDB-style names.
     * @param {String} mongoId
     * @returns {Object|null}
     */
    getByMongoId: function (mongoId) {
        var gr = new GlideRecord(this.TABLE);
        gr.addQuery('u_mongo_id', mongoId);
        gr.query();
        if (!gr.next()) return null;
        return this._toObject(gr);
    },

    deleteByMongoId: function (mongoId) {
        var gr = new GlideRecord(this.TABLE);
        gr.addQuery('u_mongo_id', mongoId);
        gr.query();
        if (gr.next()) gr.deleteRecord();
    },

    // ── Private helpers ─────────────────────────────────────────────────────

    _set: function (gr, field, value) {
        if (!gs.nil(value)) gr.setValue(field, value.toString());
    },
    _setBool: function (gr, field, value) {
        gr.setValue(field, value ? true : false);
    },
    _setNum: function (gr, field, value) {
        if (!gs.nil(value)) gr.setValue(field, parseFloat(value));
    },
    _setDate: function (gr, field, value) {
        if (!gs.nil(value)) {
            var gdt = new GlideDateTime();
            gdt.setValue(new Date(value).toISOString().replace('T', ' ').substring(0, 19));
            gr.setValue(field, gdt);
        }
    },
    _arrayToList: function (arr) {
        if (!arr || !arr.length) return '';
        return arr.join(',');
    },

    _toObject: function (gr) {
        return {
            _id: gr.getValue('u_mongo_id'),
            ticketNumber: gr.getValue('u_ticket_number'),
            title: gr.getValue('u_title'),
            description: gr.getValue('u_description'),
            category: gr.getValue('u_category'),
            subCategory: gr.getValue('u_sub_category'),
            departmentId: gr.getValue('u_department_id'),
            reportedBy: gr.getValue('u_reported_by'),
            wardId: gr.getValue('u_ward_id'),
            zoneId: gr.getValue('u_zone_id'),
            municipalityId: gr.getValue('u_municipality_id'),
            locationAddress: gr.getValue('u_location_address'),
            latitude: parseFloat(gr.getValue('u_latitude')) || 0,
            longitude: parseFloat(gr.getValue('u_longitude')) || 0,
            impact: gr.getValue('u_impact'),
            urgency: gr.getValue('u_urgency'),
            priority: gr.getValue('u_priority'),
            status: gr.getValue('u_status'),
            assignmentGroupId: gr.getValue('u_assignment_group_id'),
            assignedTo: gr.getValue('u_assigned_to'),
            slaId: gr.getValue('u_sla_id'),
            slaDeadline: gr.getValue('u_sla_deadline'),
            escalationLevel: parseInt(gr.getValue('u_escalation_level'), 10) || 0,
            images: (gr.getValue('u_images') || '').split(',').filter(Boolean),
            attachments: (gr.getValue('u_attachments') || '').split(',').filter(Boolean),
            aiDetectedCategory: gr.getValue('u_ai_detected_category'),
            aiSeverityPrediction: gr.getValue('u_ai_severity_prediction'),
            aiConfidenceScore: parseFloat(gr.getValue('u_ai_confidence_score')) || 0,
            aiRecommendation: gr.getValue('u_ai_recommendation'),
            aiModelVersion: gr.getValue('u_ai_model_version'),
            upvotes: parseInt(gr.getValue('u_upvotes'), 10) || 0,
            downvotes: parseInt(gr.getValue('u_downvotes'), 10) || 0,
            uniqueVoterIds: (gr.getValue('u_unique_voter_ids') || '').split(',').filter(Boolean),
            views: parseInt(gr.getValue('u_views'), 10) || 0,
            engagementScore: parseFloat(gr.getValue('u_engagement_score')) || 0,
            resolutionNotes: gr.getValue('u_resolution_notes'),
            resolutionCategory: gr.getValue('u_resolution_category'),
            closureCode: gr.getValue('u_closure_code'),
            resolvedAt: gr.getValue('u_resolved_at'),
            closedAt: gr.getValue('u_closed_at'),
            citizenSatisfactionRating: parseInt(gr.getValue('u_citizen_satisfaction_rating'), 10) || 0,
            reopenedCount: parseInt(gr.getValue('u_reopened_count'), 10) || 0,
            isAnonymous: gr.getValue('u_is_anonymous') === 'true',
            trending: gr.getValue('u_trending') === 'true',
            createdAt: gr.getValue('u_created_at'),
            updatedAt: gr.getValue('u_updated_at'),
            _sysId: gr.getUniqueValue()
        };
    },

    type: 'MunicipalIssueReportUtil'
};
