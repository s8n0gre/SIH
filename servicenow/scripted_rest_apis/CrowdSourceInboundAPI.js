/**
 * SCRIPTED REST API RESOURCE: CrowdSource Inbound API
 * ------------------------------------------------------
 * In ServiceNow, create:
 *   System Web Services → Scripted REST APIs → New
 *     Name: CrowdSource Integration API
 *     API ID: crowdsource_integration
 *
 * Then add THREE Resources (one per table operation):
 *
 *  Resource 1 — Citizen Upsert
 *    HTTP Method: POST
 *    Relative Path: /citizen
 *    Script: (paste CITIZEN block below)
 *
 *  Resource 2 — Report Upsert
 *    HTTP Method: POST
 *    Relative Path: /report
 *    Script: (paste REPORT block below)
 *
 *  Resource 3 — Stats Sync
 *    HTTP Method: POST
 *    Relative Path: /stats
 *    Script: (paste STATS block below)
 *
 * The Base path will become:
 *   https://<your-pdi>.service-now.com/api/<namespace>/crowdsource_integration/...
 *
 * Secure each resource with Basic Auth or OAuth2.
 * The Node.js backend calls these endpoints via the ServiceNowSyncService helper.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Resource 1: POST /citizen
// Paste this as the "Script" for the /citizen resource
// ─────────────────────────────────────────────────────────────────────────────
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var body = request.body.data;
        if (!body) {
            response.setStatus(400);
            response.setBody({ error: 'Request body is required' });
            return;
        }

        var util = new CitizenDetailsUtil();
        var sysId = util.upsertFromMongo(body);

        response.setStatus(200);
        response.setBody({
            success: true,
            sys_id: sysId,
            table: 'x_1832142_munici_0_citizen_details',
            mongo_id: body._id || null
        });

    } catch (e) {
        response.setStatus(500);
        response.setBody({ error: e.message });
    }

})(request, response);


// ─────────────────────────────────────────────────────────────────────────────
// Resource 2: POST /report
// Paste this as the "Script" for the /report resource
// ─────────────────────────────────────────────────────────────────────────────
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var body = request.body.data;
        if (!body) {
            response.setStatus(400);
            response.setBody({ error: 'Request body is required' });
            return;
        }

        var util = new MunicipalIssueReportUtil();
        var sysId = util.upsertFromMongo(body);

        // If status update is the intent, also stamp resolution timestamps
        if (body.status === 'resolved' || body.status === 'closed') {
            util.updateStatus(body._id, body.status, {
                resolvedAt: body.resolvedAt,
                closedAt: body.closedAt,
                resolutionNotes: body.resolutionNotes
            });
        }

        response.setStatus(200);
        response.setBody({
            success: true,
            sys_id: sysId,
            table: 'tx_1832142_munici_0_municipal_issue_report',
            mongo_id: body._id || null,
            ticket_number: body.ticketNumber || null
        });

    } catch (e) {
        response.setStatus(500);
        response.setBody({ error: e.message });
    }

})(request, response);


// ─────────────────────────────────────────────────────────────────────────────
// Resource 3: POST /stats
// Paste this as the "Script" for the /stats resource
// ─────────────────────────────────────────────────────────────────────────────
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var body = request.body.data;
        if (!body) {
            response.setStatus(400);
            response.setBody({ error: 'Request body is required' });
            return;
        }

        var util = new MunicipalityStatsUtil();
        var sysId = util.upsertFromMongo(body);

        response.setStatus(200);
        response.setBody({
            success: true,
            sys_id: sysId,
            table: 'x_1832142_munici_0_municipality_issues_stats'
        });

    } catch (e) {
        response.setStatus(500);
        response.setBody({ error: e.message });
    }

})(request, response);
