/**
 * BUSINESS RULE: BR_CitizenDetails_OnAfterInsert
 * Table   : x_1832142_munici_0_citizen_details
 * When    : After → Insert
 * Advanced: checked
 *
 * Fires when a new citizen is created INSIDE ServiceNow and pushes the record
 * back to MongoDB via the Node.js REST API (outbound sync).
 *
 * In ServiceNow:
 *   System Definition → Business Rules → New
 *   Name   : BR_CitizenDetails_OnAfterInsert
 *   Table  : x_1832142_munici_0_citizen_details
 *   When   : after
 *   Insert : ✔
 *   Script : (paste below)
 */
(function executeRule(current, previous) {

    // Only push to MongoDB if the record did not originate from MongoDB (avoid loops)
    if (current.getValue('u_mongo_id')) return; // already synced from Mongo

    var mongoPayload = {
        username: current.getValue('u_username'),
        email: current.getValue('u_email'),
        phoneNumber: current.getValue('u_phone_number'),
        address: current.getValue('u_address'),
        wardId: current.getValue('u_ward_id'),
        zoneId: current.getValue('u_zone_id'),
        municipalityId: current.getValue('u_municipality_id'),
        departmentId: current.getValue('u_department_id'),
        role: current.getValue('u_role') || 'citizen',
        isApproved: current.getValue('u_is_approved') === 'true',
        isActive: current.getValue('u_is_active') === 'true',
        isVerified: current.getValue('u_is_verified') === 'true',
        banned: current.getValue('u_banned') === 'true',
        reputationPoints: parseInt(current.getValue('u_reputation_points'), 10) || 0,
        level: current.getValue('u_level') || 'Citizen',
        profileImageUrl: current.getValue('u_profile_image_url'),
        _snSysId: current.getUniqueValue() // tag with ServiceNow sys_id
    };

    _pushToMongo('/api/users/from-servicenow', mongoPayload, current);

})(current, previous);


/**
 * Helper: POST payload to Node.js backend
 * @param {String} path    - API path on the Node.js backend (e.g. '/api/users/from-servicenow')
 * @param {Object} payload - JSON body
 * @param {GlideRecord} gr - current GlideRecord (so we can write back the returned _id)
 */
function _pushToMongo(path, payload, gr) {
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
            var responseBody = JSON.parse(response.getBody());
            // Write MongoDB _id back to the ServiceNow record
            if (responseBody._id) {
                gr.setValue('u_mongo_id', responseBody._id);
                gr.autoSysFields(false);
                gr.update();
            }
        } else {
            gs.error('CitizenDetails → MongoDB sync failed. Status: ' + statusCode + ' Body: ' + response.getBody());
        }
    } catch (e) {
        gs.error('CitizenDetails → MongoDB sync error: ' + e.message);
    }
}
