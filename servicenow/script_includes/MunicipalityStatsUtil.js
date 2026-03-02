/**
 * SCRIPT INCLUDE: MunicipalityStatsUtil
 * Table: x_1832142_munici_0_municipality_issues_stats
 *
 * Paste this entire file under:
 *   System Definition → Script Includes → New
 *   Name: MunicipalityStatsUtil
 *   Accessible from: All application scopes
 */
var MunicipalityStatsUtil = Class.create();
MunicipalityStatsUtil.prototype = {

    initialize: function () { },

    TABLE: 'x_1832142_munici_0_municipality_issues_stats',

    /**
     * Write the latest stats from MongoDB into ServiceNow.
     * The stats table holds a SINGLE row (upsert on the first record).
     * @param {Object} mongoStats - Raw MongoDB Stats document (camelCase)
     * @returns {String} sys_id
     */
    upsertFromMongo: function (mongoStats) {
        var gr = new GlideRecord(this.TABLE);
        gr.query();
        var isNew = !gr.next();
        if (isNew) gr.initialize();

        // Volume
        this._setNum(gr, 'u_total_reports', mongoStats.totalReports);
        this._setNum(gr, 'u_reports_today', mongoStats.reportsToday);
        this._setNum(gr, 'u_reports_this_week', mongoStats.reportsThisWeek);
        this._setNum(gr, 'u_reports_this_month', mongoStats.reportsThisMonth);
        this._setNum(gr, 'u_reports_last_month', mongoStats.reportsLastMonth);
        this._setNum(gr, 'u_growth_rate', mongoStats.growthRate);

        // Breakdowns (JSON → stored as string)
        this._setJson(gr, 'u_reports_by_status', mongoStats.reportsByStatus);
        this._setJson(gr, 'u_reports_by_priority', mongoStats.reportsByPriority);
        this._setJson(gr, 'u_reports_by_department', mongoStats.reportsByDepartment);
        this._setJson(gr, 'u_reports_by_category', mongoStats.reportsByCategory);
        this._setJson(gr, 'u_reports_by_ward', mongoStats.reportsByWard);

        // Priority counts
        this._setNum(gr, 'u_high_priority_count', mongoStats.highPriorityCount);
        this._setNum(gr, 'u_medium_priority_count', mongoStats.mediumPriorityCount);
        this._setNum(gr, 'u_low_priority_count', mongoStats.lowPriorityCount);

        // SLA & overdue
        this._setNum(gr, 'u_overdue_reports', mongoStats.overdueReports);
        this._setNum(gr, 'u_sla_breached_count', mongoStats.slaBreachedCount);

        // Time metrics (hours, Decimal)
        this._setNum(gr, 'u_average_response_time', mongoStats.averageResponseTime);
        this._setNum(gr, 'u_average_resolution_time', mongoStats.averageResolutionTime);
        this._setNum(gr, 'u_median_resolution_time', mongoStats.medianResolutionTime);

        // Trends & totals
        this._set(gr, 'u_top_trending_category', mongoStats.topTrendingCategory);
        this._setNum(gr, 'u_total_comments', mongoStats.totalComments);
        this._setNum(gr, 'u_total_votes', mongoStats.totalVotes);
        this._setNum(gr, 'u_active_users', mongoStats.activeUsers);

        // Timestamp
        this._setDate(gr, 'u_last_updated', mongoStats.lastUpdated || new Date());

        return isNew ? gr.insert() : (gr.update(), gr.getUniqueValue());
    },

    /**
     * Read the current stats row and return it as a plain JS object.
     * @returns {Object|null}
     */
    getCurrent: function () {
        var gr = new GlideRecord(this.TABLE);
        gr.setLimit(1);
        gr.orderByDesc('u_last_updated');
        gr.query();
        if (!gr.next()) return null;
        return this._toObject(gr);
    },

    // ── Private helpers ─────────────────────────────────────────────────────

    _set: function (gr, field, value) {
        if (!gs.nil(value)) gr.setValue(field, value.toString());
    },
    _setNum: function (gr, field, value) {
        if (!gs.nil(value)) gr.setValue(field, parseFloat(value));
    },
    _setJson: function (gr, field, obj) {
        if (!gs.nil(obj)) gr.setValue(field, JSON.stringify(obj));
    },
    _setDate: function (gr, field, value) {
        if (!gs.nil(value)) {
            var gdt = new GlideDateTime();
            gdt.setValue(new Date(value).toISOString().replace('T', ' ').substring(0, 19));
            gr.setValue(field, gdt);
        }
    },

    _toObject: function (gr) {
        var parseJson = function (str) {
            if (!str) return {};
            try { return JSON.parse(str); } catch (e) { return {}; }
        };
        return {
            totalReports: parseInt(gr.getValue('u_total_reports'), 10) || 0,
            reportsToday: parseInt(gr.getValue('u_reports_today'), 10) || 0,
            reportsThisWeek: parseInt(gr.getValue('u_reports_this_week'), 10) || 0,
            reportsThisMonth: parseInt(gr.getValue('u_reports_this_month'), 10) || 0,
            reportsLastMonth: parseInt(gr.getValue('u_reports_last_month'), 10) || 0,
            growthRate: parseFloat(gr.getValue('u_growth_rate')) || 0,
            reportsByStatus: parseJson(gr.getValue('u_reports_by_status')),
            reportsByPriority: parseJson(gr.getValue('u_reports_by_priority')),
            reportsByDepartment: parseJson(gr.getValue('u_reports_by_department')),
            reportsByCategory: parseJson(gr.getValue('u_reports_by_category')),
            reportsByWard: parseJson(gr.getValue('u_reports_by_ward')),
            highPriorityCount: parseInt(gr.getValue('u_high_priority_count'), 10) || 0,
            mediumPriorityCount: parseInt(gr.getValue('u_medium_priority_count'), 10) || 0,
            lowPriorityCount: parseInt(gr.getValue('u_low_priority_count'), 10) || 0,
            overdueReports: parseInt(gr.getValue('u_overdue_reports'), 10) || 0,
            slaBreachedCount: parseInt(gr.getValue('u_sla_breached_count'), 10) || 0,
            averageResponseTime: parseFloat(gr.getValue('u_average_response_time')) || 0,
            averageResolutionTime: parseFloat(gr.getValue('u_average_resolution_time')) || 0,
            medianResolutionTime: parseFloat(gr.getValue('u_median_resolution_time')) || 0,
            topTrendingCategory: gr.getValue('u_top_trending_category'),
            totalComments: parseInt(gr.getValue('u_total_comments'), 10) || 0,
            totalVotes: parseInt(gr.getValue('u_total_votes'), 10) || 0,
            activeUsers: parseInt(gr.getValue('u_active_users'), 10) || 0,
            lastUpdated: gr.getValue('u_last_updated'),
            _sysId: gr.getUniqueValue()
        };
    },

    type: 'MunicipalityStatsUtil'
};
