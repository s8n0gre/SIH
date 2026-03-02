/**
 * BUSINESS RULE: BR_IssueReport_OnAfterUpdate
 * Table   : tx_1832142_munici_0_municipal_issue_report
 * When    : After → Update
 * Advanced: checked
 * Condition: current.u_status.changes() || current.u_priority.changes() ||
 *            current.u_assigned_to.changes() || current.u_resolution_notes.changes()
 *
 * Fires when key fields on an existing report change in ServiceNow and syncs
 * the delta back to MongoDB.
 *
 * In ServiceNow:
 *   System Definition → Business Rules → New
 *   Name      : BR_IssueReport_OnAfterUpdate
 *   Table     : tx_1832142_munici_0_municipal_issue_report
 *   When      : after
 *   Update    : ✔
 *   Condition : current.u_status.changes() || current.u_priority.changes() ||
 *               current.u_assigned_to.changes()
 *   Script    : (paste below)
 */
(function executeRule(current, previous) {

    var mongoId = current.getValue('u_mongo_id');
    if (!mongoId) return; // record not yet linked to MongoDB

    var delta = { _id: mongoId };

    // Only send changed fields
    if (current.u_status.changes()) delta.status = current.getValue('u_status');
    if (current.u_priority.changes()) delta.priority = current.getValue('u_priority');
    if (current.u_urgency.changes()) delta.urgency = current.getValue('u_urgency');
    if (current.u_assigned_to.changes()) delta.assignedTo = current.getValue('u_assigned_to');
    if (current.u_assignment_group_id.changes()) delta.assignmentGroupId = current.getValue('u_assignment_group_id');
    if (current.u_resolution_notes.changes()) {
        delta.resolutionNotes = current.getValue('u_resolution_notes');
        delta.resolutionCategory = current.getValue('u_resolution_category');
        delta.closureCode = current.getValue('u_closure_code');
    }
    if (current.u_citizen_satisfaction_rating.changes())
        delta.citizenSatisfactionRating = parseInt(current.getValue('u_citizen_satisfaction_rating'), 10);
    if (current.u_escalation_level.changes())
        delta.escalationLevel = parseInt(current.getValue('u_escalation_level'), 10);

    // Auto-stamp resolved/closed timestamps
    var newStatus = current.getValue('u_status');
    if (newStatus === 'resolved' && !previous.getValue('u_resolved_at')) {
        delta.resolvedAt = new Date().toISOString();
    }
    if (newStatus === 'closed' && !previous.getValue('u_closed_at')) {
        delta.closedAt = new Date().toISOString();
    }

    delta.updatedAt = new Date().toISOString();

    _patchMongo('/api/reports/' + mongoId + '/from-servicenow', delta);

})(current, previous);


function _patchMongo(path, payload) {
    var mongoBase = gs.getProperty('x_1832142_munici_0.mongo_api_base', 'http://localhost:5000');
    var apiKey = gs.getProperty('x_1832142_munici_0.mongo_api_key', '');

    var rm = new sn_ws.RESTMessageV2();
    rm.setEndpoint(mongoBase + path);
    rm.setHttpMethod('PATCH');
    rm.setRequestHeader('Content-Type', 'application/json');
    if (apiKey) rm.setRequestHeader('x-api-key', apiKey);
    rm.setRequestBody(JSON.stringify(payload));

    try {
        var response = rm.execute();
        if (response.getStatusCode() >= 400) {
            gs.error('IssueReport update → MongoDB sync failed. Status: ' + response.getStatusCode() + ' Body: ' + response.getBody());
        }
    } catch (e) {
        gs.error('IssueReport update → MongoDB sync error: ' + e.message);
    }
}
