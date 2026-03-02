/**
 * ServiceNow Sync Service  (CommonJS — backend/ scope)
 * ─────────────────────────────────────────────────────────
 * Uses the ServiceNow TABLE API  (/api/now/table/...)
 * Field names verified against sys_dictionary on PDI dev287320.
 *
 * Table name corrections (verified by direct GET):
 *   citizen : x_1832142_munici_0_citizen_details          ✅ has custom fields
 *   report  : x_1832142_munici_0_municipal_issue_report   ✅ table exists (add fields in Studio)
 *   stats   : x_1832142_munici_0_municipality_issues_stats ✅ table exists (add fields in Studio)
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

// ── Tables ────────────────────────────────────────────────────────────────────
const TABLES = {
    citizen: 'x_1832142_munici_0_citizen_details',
    report: 'x_1832142_munici_0_municipal_issue_report',
    stats: 'x_1832142_munici_0_municipality_issues_stats'
};

// ── Config ────────────────────────────────────────────────────────────────────
const SN_INSTANCE = (process.env.SERVICENOW_INSTANCE || '').replace(/\/$/, '');
const SN_USER = process.env.SERVICENOW_USER || 'admin';
const SN_PASSWORD = process.env.SERVICENOW_PASSWORD || '';
const AUTH = Buffer.from(`${SN_USER}:${SN_PASSWORD}`).toString('base64');

// ── Low-level HTTP helper ─────────────────────────────────────────────────────
function _req(method, path, body) {
    return new Promise((resolve) => {
        if (!SN_INSTANCE) {
            return resolve({ skipped: true });
        }

        const fullUrl = `${SN_INSTANCE}${path}`;
        const useHttps = fullUrl.startsWith('https');
        const urlObj = new URL(fullUrl);
        const payload = body ? JSON.stringify(body) : '';

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (useHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method,
            headers: {
                'Authorization': `Basic ${AUTH}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const transport = useHttps ? https : http;
        const req = transport.request(options, (res) => {
            let data = '';
            res.on('data', c => (data += c));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (_) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (err) => {
            console.error('[SN Sync] Network error:', err.message);
            resolve({ status: 0, error: err.message });
        });

        req.write(payload);
        req.end();
    });
}

// ── Upsert: GET by lookup field → PATCH or POST ───────────────────────────────
async function _upsert(table, lookupField, lookupValue, snDoc, label) {
    const encodedVal = encodeURIComponent(lookupValue);
    const lookupPath = `/api/now/table/${table}?sysparm_query=${lookupField}=${encodedVal}&sysparm_fields=sys_id&sysparm_limit=1`;
    const lookup = await _req('GET', lookupPath, null);
    const existing = lookup.body?.result?.[0];

    if (existing?.sys_id) {
        const res = await _req('PATCH', `/api/now/table/${table}/${existing.sys_id}`, snDoc);
        if (res.status >= 200 && res.status < 300) {
            console.log(`[SN Sync] ✅ ${label} updated  → sys_id=${existing.sys_id}`);
        } else {
            console.error(`[SN Sync] ❌ ${label} PATCH HTTP ${res.status}:`, JSON.stringify(res.body).substring(0, 200));
        }
        return res;
    } else {
        const res = await _req('POST', `/api/now/table/${table}`, snDoc);
        if (res.status === 201) {
            console.log(`[SN Sync] ✅ ${label} created  → sys_id=${res.body?.result?.sys_id}`);
        } else {
            console.error(`[SN Sync] ❌ ${label} POST HTTP ${res.status}:`, JSON.stringify(res.body).substring(0, 200));
        }
        return res;
    }
}

// ── Field mappers (column names verified from sys_dictionary) ─────────────────

/**
 * citizen_details verified fields:
 * id, username, email, phonenumber, address, role, badges, level,
 * isapproved, isactive, isverified, banned, reputationpoints,
 * lastloginat, failedloginattempts, profileimageurl
 */
function _mapCitizen(u) {
    const arr = a => (Array.isArray(a) ? a.join(',') : (a || ''));
    return {
        id: String(u._id || ''),        // ServiceNow element for MongoDB _id
        username: u.username || '',
        email: u.email || '',
        phonenumber: u.phoneNumber || '',
        address: u.address || '',
        role: u.role || 'citizen',
        badges: arr(u.badges),
        level: u.level || 'Citizen',
        isapproved: !!u.isApproved,
        isactive: !!u.isActive,
        isverified: !!u.isVerified,
        banned: !!u.banned,
        reputationpoints: u.reputationPoints || 0,
        lastloginat: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString().replace('T', ' ').slice(0, 19) : '',
        failedloginattempts: u.failedLoginAttempts || 0,
        profileimageurl: u.profileImageUrl || ''
        // wardId, zoneId, municipalityId, departmentId, permissions, mfaEnabled:
        // add these fields in ServiceNow Studio first, then add them here
    };
}

/**
 * municipal_issue_report — table exists but custom fields not yet defined on PDI.
 * These field names follow the same lowercase pattern; add matching fields in Studio.
 */
function _mapReport(r) {
    const arr = a => (Array.isArray(a) ? a.join(',') : (a || ''));
    return {
        ticketnumber: r.ticketNumber || '',
        title: r.title || '',
        description: r.description || '',
        category: r.category || '',
        subcategory: r.subCategory || '',
        departmentid: r.departmentId || '',
        reportedby: String(r.reportedBy?._id || r.reportedBy || ''),
        wardid: r.wardId || '',
        zoneid: r.zoneId || '',
        municipalityid: r.municipalityId || '',
        locationaddress: r.locationAddress || '',
        latitude: r.latitude || 0,
        longitude: r.longitude || 0,
        impact: r.impact || 'medium',
        urgency: r.urgency || 'medium',
        priority: r.priority || 'medium',
        status: r.status || 'open',
        assignmentgroupid: r.assignmentGroupId || '',
        assignedto: String(r.assignedTo || ''),
        slaid: r.slaId || '',
        sladeadline: r.slaDeadline ? new Date(r.slaDeadline).toISOString().replace('T', ' ').slice(0, 19) : '',
        escalationlevel: r.escalationLevel || 0,
        images: arr(r.images),
        aidetectedcategory: r.aiDetectedCategory || '',
        aiseverityprediction: r.aiSeverityPrediction || '',
        aiconfidencescore: r.aiConfidenceScore || 0,
        upvotes: r.upvotes || 0,
        downvotes: r.downvotes || 0,
        views: r.views || 0,
        isanonymous: !!r.isAnonymous,
        trending: !!r.trending,
        mongo_id: String(r._id || '')           // link back field
    };
}

/**
 * municipality_issues_stats — table exists but custom fields not yet defined on PDI.
 */
function _mapStats(s) {
    const json = o => JSON.stringify(o || {});
    return {
        totalreports: s.totalReports || 0,
        reportstoday: s.reportsToday || 0,
        reportsthisweek: s.reportsThisWeek || 0,
        reportsthismonth: s.reportsThisMonth || 0,
        reportslastmonth: s.reportsLastMonth || 0,
        growthrate: s.growthRate || 0,
        reportsbystatus: json(s.reportsByStatus),
        reportsbypriority: json(s.reportsByPriority),
        reportsbydepartment: json(s.reportsByDepartment),
        reportsbycategory: json(s.reportsByCategory),
        highprioritycount: s.highPriorityCount || 0,
        mediumprioritycount: s.mediumPriorityCount || 0,
        lowprioritycount: s.lowPriorityCount || 0,
        overduereports: s.overdueReports || 0,
        slabreachedcount: s.slaBreachedCount || 0,
        averageresolutiontime: s.averageResolutionTime || 0,
        medianresolutiontime: s.medianResolutionTime || 0,
        toptrendingcategory: s.topTrendingCategory || '',
        totalcomments: s.totalComments || 0,
        totalvotes: s.totalVotes || 0,
        activeusers: s.activeUsers || 0
    };
}

// ── Public API ────────────────────────────────────────────────────────────────

async function pushCitizen(mongoUser) {
    try {
        if (!SN_INSTANCE) return;
        const doc = mongoUser.toObject ? mongoUser.toObject() : mongoUser;
        return await _upsert(TABLES.citizen, 'id', String(doc._id), _mapCitizen(doc), `Citizen(${doc.username})`);
    } catch (e) {
        console.error('[SN Sync] pushCitizen error:', e.message);
    }
}

async function pushReport(mongoReport) {
    try {
        if (!SN_INSTANCE) return;
        const doc = mongoReport.toObject ? mongoReport.toObject() : mongoReport;
        return await _upsert(TABLES.report, 'mongo_id', String(doc._id), _mapReport(doc), `Report(${doc.ticketNumber || doc._id})`);
    } catch (e) {
        console.error('[SN Sync] pushReport error:', e.message);
    }
}

async function pushStats(mongoStats) {
    try {
        if (!SN_INSTANCE) return;
        const doc = mongoStats.toObject ? mongoStats.toObject() : mongoStats;
        const snDoc = _mapStats(doc);

        // Stats = single row — get the first existing record
        const lookup = await _req('GET', `/api/now/table/${TABLES.stats}?sysparm_fields=sys_id&sysparm_limit=1`, null);
        const existing = lookup.body?.result?.[0];

        if (existing?.sys_id) {
            const res = await _req('PATCH', `/api/now/table/${TABLES.stats}/${existing.sys_id}`, snDoc);
            if (res.status >= 200 && res.status < 300) {
                console.log(`[SN Sync] ✅ Stats updated  → sys_id=${existing.sys_id}`);
            } else {
                console.error(`[SN Sync] ❌ Stats PATCH HTTP ${res.status}:`, JSON.stringify(res.body).substring(0, 200));
            }
        } else {
            const res = await _req('POST', `/api/now/table/${TABLES.stats}`, snDoc);
            if (res.status === 201) {
                console.log(`[SN Sync] ✅ Stats created  → sys_id=${res.body?.result?.sys_id}`);
            } else {
                console.error(`[SN Sync] ❌ Stats POST HTTP ${res.status}:`, JSON.stringify(res.body).substring(0, 200));
            }
        }
    } catch (e) {
        console.error('[SN Sync] pushStats error:', e.message);
    }
}

module.exports = { pushCitizen, pushReport, pushStats };
