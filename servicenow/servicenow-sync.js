/**
 * ServiceNow Sync Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Node.js helper that pushes MongoDB data to the ServiceNow PDI via the
 * Scripted REST API we created in ServiceNow.
 *
 * Location: backend/servicenow-sync.js
 *
 * Usage in server.js (after saving a record):
 *
 *   const snSync = require('./servicenow-sync');
 *   await snSync.pushCitizen(user);
 *   await snSync.pushReport(report);
 *   await snSync.pushStats(stats);
 */

require('dotenv').config();
const https = require('https');
const http = require('http');
const url = require('url');

// ── Config (populated via .env) ───────────────────────────────────────────────
const SN_INSTANCE = process.env.SERVICENOW_INSTANCE || '';  // e.g. https://dev12345.service-now.com
const SN_USER = process.env.SERVICENOW_USER || 'admin';
const SN_PASSWORD = process.env.SERVICENOW_PASSWORD || '';
const SN_API_NS = process.env.SERVICENOW_API_NS || 'x_1832142_munici_0'; // scope prefix

// Base endpoint for our Scripted REST API:
//   https://<pdi>.service-now.com/api/<namespace>/crowdsource_integration/<resource>
const API_BASE = `${SN_INSTANCE}/api/${SN_API_NS}/crowdsource_integration`;

// ── Internal HTTP helper ──────────────────────────────────────────────────────
function _request(endpoint, payload) {
    return new Promise((resolve, reject) => {
        if (!SN_INSTANCE) {
            console.warn('[SN Sync] SERVICENOW_INSTANCE not set — skipping sync.');
            return resolve({ skipped: true });
        }

        const parsed = url.parse(endpoint);
        const body = JSON.stringify({ data: payload });
        const authBuffer = Buffer.from(`${SN_USER}:${SN_PASSWORD}`).toString('base64');

        const options = {
            hostname: parsed.hostname,
            port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
            path: parsed.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Authorization': `Basic ${authBuffer}`
            }
        };

        const transport = parsed.protocol === 'https:' ? https : http;
        const req = transport.request(options, (res) => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        console.error(`[SN Sync] HTTP ${res.statusCode}: ${data}`);
                        resolve({ error: true, status: res.statusCode, body: data });
                    }
                } catch (_) {
                    resolve({ error: true, body: data });
                }
            });
        });

        req.on('error', (err) => {
            console.error('[SN Sync] Request error:', err.message);
            resolve({ error: true, message: err.message }); // never block the main flow
        });

        req.write(body);
        req.end();
    });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Push a MongoDB User document to ServiceNow citizen_details table.
 * @param {Object} mongoUser  - Mongoose user doc (plain object or Mongoose doc)
 */
async function pushCitizen(mongoUser) {
    const doc = mongoUser.toObject ? mongoUser.toObject() : mongoUser;
    const result = await _request(`${API_BASE}/citizen`, doc);
    if (!result.skipped && !result.error) {
        console.log(`[SN Sync] ✅ Citizen synced: _id=${doc._id} → sys_id=${result.sys_id}`);
    }
    return result;
}

/**
 * Push a MongoDB Report document to ServiceNow municipal_issue_report table.
 * @param {Object} mongoReport - Mongoose report doc
 */
async function pushReport(mongoReport) {
    const doc = mongoReport.toObject ? mongoReport.toObject() : mongoReport;
    const result = await _request(`${API_BASE}/report`, doc);
    if (!result.skipped && !result.error) {
        console.log(`[SN Sync] ✅ Report synced: _id=${doc._id} ticket=${doc.ticketNumber} → sys_id=${result.sys_id}`);
    }
    return result;
}

/**
 * Push a MongoDB Stats document to ServiceNow municipality_issues_stats table.
 * @param {Object} mongoStats - Plain stats object
 */
async function pushStats(mongoStats) {
    const doc = mongoStats.toObject ? mongoStats.toObject() : mongoStats;
    const result = await _request(`${API_BASE}/stats`, doc);
    if (!result.skipped && !result.error) {
        console.log(`[SN Sync] ✅ Stats synced → sys_id=${result.sys_id}`);
    }
    return result;
}

module.exports = { pushCitizen, pushReport, pushStats };
