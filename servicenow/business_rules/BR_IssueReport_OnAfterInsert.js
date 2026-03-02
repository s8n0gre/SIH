/**
 * BUSINESS RULE: BR_IssueReport_OnAfterInsert
 * Table   : tx_1832142_munici_0_municipal_issue_report
 * When    : After → Insert
 * Advanced: checked
 *
 * Fires when a new report is created INSIDE ServiceNow and pushes it to MongoDB.
 *
 * In ServiceNow:
 *   System Definition → Business Rules → New
 *   Name   : BR_IssueReport_OnAfterInsert
 *   Table  : tx_1832142_munici_0_municipal_issue_report
 *   When   : after
 *   Insert : ✔
 *   Script : (paste below)
 */
(function executeRule(current, previous) {

    if (current.getValue('u_mongo_id')) return; // already ingested from Mongo

    var mongoPayload = {
        ticketNumber: current.getValue('u_ticket_number'),
        title: current.getValue('u_title'),
        description: current.getValue('u_description'),
        category: current.getValue('u_category'),
        subCategory: current.getValue('u_sub_category'),
        departmentId: current.getValue('u_department_id'),
        reportedBy: current.getValue('u_reported_by'),
        wardId: current.getValue('u_ward_id'),
        zoneId: current.getValue('u_zone_id'),
        municipalityId: current.getValue('u_municipality_id'),
        locationAddress: current.getValue('u_location_address'),
        latitude: parseFloat(current.getValue('u_latitude')) || 0,
        longitude: parseFloat(current.getValue('u_longitude')) || 0,
        impact: current.getValue('u_impact') || 'medium',
        urgency: current.getValue('u_urgency') || 'medium',
        priority: current.getValue('u_priority') || 'medium',
        status: current.getValue('u_status') || 'open',
        assignmentGroupId: current.getValue('u_assignment_group_id'),
        assignedTo: current.getValue('u_assigned_to'),
        slaId: current.getValue('u_sla_id'),
        isAnonymous: current.getValue('u_is_anonymous') === 'true',
        _snSysId: current.getUniqueValue()
    };

    _pushReportToMongo('/api/reports/from-servicenow', mongoPayload, current);

})(current, previous);


function _pushReportToMongo(path, payload, gr) {
    var mongoBase = gs.getProperty('x_1832142_munici_0.mongo_api_base', 'http://localhost:5000');
    var apiKey = gs.getProperty('x_1832142_munici_0.mongo_api_key', '');

    var rm = new sn_ws.RESTMessageV2();
    rm.setEndpoint(mongoBase + path);
    rm.setHttpMethod('POST');
    rm.setRequestHeader('Content-Type', 'application/json');
    if (apiKey) rm.setRequestHeader('x-api-key', apiKey);
    rm.setRequestBody(JSON.stringify(payload));

    try {
        var response = rm.execute();
        var statusCode = response.getStatusCode();
        if (statusCode >= 200 && statusCode < 300) {
            var body = JSON.parse(response.getBody());
            if (body._id) {
                gr.setValue('u_mongo_id', body._id);
                if (body.ticketNumber) gr.setValue('u_ticket_number', body.ticketNumber);
                gr.autoSysFields(false);
                gr.update();
            }
        } else {
            gs.error('IssueReport → MongoDB sync failed. Status: ' + statusCode + ' Body: ' + response.getBody());
        }
    } catch (e) {
        gs.error('IssueReport → MongoDB sync error: ' + e.message);
    }
}
