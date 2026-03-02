/**
 * SCHEDULED JOB: SJ_SyncStatsFromMongo
 * ----------------------------------------
 * Pulls the latest stats from the MongoDB backend every 15 minutes and
 * writes them into the ServiceNow stats table.
 *
 * In ServiceNow:
 *   System Definition → Scheduled Jobs → New
 *   Name       : SJ_SyncStatsFromMongo
 *   Run        : Periodically
 *   Repeat Interval: 0 days 0 hours 15 minutes
 *   Script     : (paste below)
 */
(function execute() {

    var mongoBase = gs.getProperty('x_1832142_munici_0.mongo_api_base', 'http://localhost:5000');
    var apiKey = gs.getProperty('x_1832142_munici_0.mongo_api_key', '');

    // ── Step 1: Fetch stats from MongoDB ──────────────────────────────────────
    var rm = new sn_ws.RESTMessageV2();
    rm.setEndpoint(mongoBase + '/api/stats/global');
    rm.setHttpMethod('GET');
    rm.setRequestHeader('Content-Type', 'application/json');
    if (apiKey) rm.setRequestHeader('x-api-key', apiKey);

    var stats;
    try {
        var response = rm.execute();
        if (response.getStatusCode() !== 200) {
            gs.error('SJ_SyncStatsFromMongo: Failed to fetch stats. HTTP ' + response.getStatusCode());
            return;
        }
        stats = JSON.parse(response.getBody());
    } catch (e) {
        gs.error('SJ_SyncStatsFromMongo: Error fetching stats - ' + e.message);
        return;
    }

    // ── Step 2: Write into ServiceNow ─────────────────────────────────────────
    try {
        var util = new MunicipalityStatsUtil();
        var sysId = util.upsertFromMongo(stats);
        gs.info('SJ_SyncStatsFromMongo: Stats synced successfully. sys_id=' + sysId +
            ' | totalReports=' + stats.totalReports +
            ' | reportsToday=' + stats.reportsToday);
    } catch (e) {
        gs.error('SJ_SyncStatsFromMongo: Error writing to ServiceNow - ' + e.message);
    }

})();
