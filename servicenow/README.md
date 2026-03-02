# ServiceNow PDI Integration

This folder contains all JavaScript artefacts to connect the CrowdSource application to a **ServiceNow PDI instance**.

## Table Mapping

| App Concept | MongoDB Collection | ServiceNow Table |
|---|---|---|
| Citizen / User | `users` | `x_1832142_munici_0_citizen_details` |
| Municipal Report | `reports` | `tx_1832142_munici_0_municipal_issue_report` |
| Platform Stats | `stats` | `x_1832142_munici_0_municipality_issues_stats` |

---

## Folder Structure

```
servicenow/
├── README.md                          ← This file
├── field_maps/
│   ├── citizen_details_fields.js      ← User ↔ ServiceNow field map
│   ├── issue_report_fields.js         ← Report ↔ ServiceNow field map
│   └── stats_fields.js                ← Stats ↔ ServiceNow field map
├── script_includes/
│   ├── CitizenDetailsUtil.js          ← Script Include: CRUD citizen_details
│   ├── MunicipalIssueReportUtil.js    ← Script Include: CRUD issue_report
│   └── MunicipalityStatsUtil.js       ← Script Include: read/write stats
├── scripted_rest_apis/
│   └── CrowdSourceInboundAPI.js       ← Scripted REST API (receives webhook from Node.js)
├── business_rules/
│   ├── BR_CitizenDetails_OnAfterInsert.js
│   ├── BR_IssueReport_OnAfterInsert.js
│   └── BR_IssueReport_OnAfterUpdate.js
└── scheduled_jobs/
    └── SJ_SyncStatsFromMongo.js
```

---

## How To Deploy to ServiceNow PDI

### 1. Script Includes
Navigate to **System Definition → Script Includes** and create one record per file in `script_includes/`. Set:
- **Name**: filename without `.js` (e.g. `CitizenDetailsUtil`)
- **API Name**: same as Name
- **Accessible from**: All application scopes
- **Script**: paste contents

### 2. Scripted REST API
Navigate to **System Web Services → Scripted REST APIs → New**.
- **Name**: `CrowdSource Integration API`
- **API ID**: `crowdsource_integration`
Add a **Resource** for each endpoint defined in `CrowdSourceInboundAPI.js`.

### 3. Business Rules
Navigate to **System Definition → Business Rules → New** for each file in `business_rules/`.

### 4. Scheduled Jobs
Navigate to **System Definition → Scheduled Jobs → New** for the stats sync job.

### 5. Node.js Environment Variable
Add to `backend/.env`:
```
SERVICENOW_INSTANCE=https://yourpdi.service-now.com
SERVICENOW_USER=admin
SERVICENOW_PASSWORD=yourpassword
```

---

## Field Naming Convention in ServiceNow

ServiceNow custom table fields in scope `x_1832142_munici_0` are accessed as-is (e.g. `gr.username`, `gr.email`). All field names use **snake_case** matching the MongoDB schema exactly where possible.
