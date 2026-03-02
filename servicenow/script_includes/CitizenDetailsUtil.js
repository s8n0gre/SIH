/**
 * SCRIPT INCLUDE: CitizenDetailsUtil
 * Table: x_1832142_munici_0_citizen_details
 *
 * Paste this entire file under:
 *   System Definition → Script Includes → New
 *   Name: CitizenDetailsUtil
 *   Accessible from: All application scopes
 */
var CitizenDetailsUtil = Class.create();
CitizenDetailsUtil.prototype = {

    initialize: function () { },

    TABLE: 'x_1832142_munici_0_citizen_details',

    /**
     * Create or update a citizen record from a MongoDB payload object.
     * @param {Object} mongoUser  - Raw MongoDB User document (camelCase field names)
     * @returns {String} sys_id of the created/updated ServiceNow record
     */
    upsertFromMongo: function (mongoUser) {
        var gr = new GlideRecord(this.TABLE);
        var isNew = true;

        // Try to find existing record by MongoDB _id
        if (mongoUser._id) {
            gr.addQuery('u_mongo_id', mongoUser._id.toString());
            gr.query();
            if (gr.next()) {
                isNew = false;
            } else {
                gr.initialize();
            }
        } else {
            gr.initialize();
        }

        // Core identity
        this._set(gr, 'u_mongo_id', mongoUser._id);
        this._set(gr, 'u_username', mongoUser.username);
        this._set(gr, 'u_email', mongoUser.email);
        this._set(gr, 'u_password_hash', mongoUser.password);       // hashed only
        this._set(gr, 'u_phone_number', mongoUser.phoneNumber);
        this._set(gr, 'u_address', mongoUser.address);

        // Organisational
        this._set(gr, 'u_ward_id', mongoUser.wardId);
        this._set(gr, 'u_zone_id', mongoUser.zoneId);
        this._set(gr, 'u_municipality_id', mongoUser.municipalityId);
        this._set(gr, 'u_department_id', mongoUser.departmentId);

        // Role & permissions
        this._set(gr, 'u_role', mongoUser.role);
        this._set(gr, 'u_permissions', this._arrayToList(mongoUser.permissions));

        // Status flags
        this._setBool(gr, 'u_is_approved', mongoUser.isApproved);
        this._setBool(gr, 'u_is_active', mongoUser.isActive);
        this._setBool(gr, 'u_is_verified', mongoUser.isVerified);
        this._setBool(gr, 'u_banned', mongoUser.banned);

        // Reputation
        this._setNum(gr, 'u_reputation_points', mongoUser.reputationPoints);
        this._set(gr, 'u_badges', this._arrayToList(mongoUser.badges));
        this._set(gr, 'u_level', mongoUser.level);

        // Security
        this._setDate(gr, 'u_last_login_at', mongoUser.lastLoginAt);
        this._setNum(gr, 'u_failed_login_attempts', mongoUser.failedLoginAttempts);
        this._setBool(gr, 'u_mfa_enabled', mongoUser.mfaEnabled);

        // Profile
        this._set(gr, 'u_profile_image_url', mongoUser.profileImageUrl);

        // Timestamps
        this._setDate(gr, 'u_created_at', mongoUser.createdAt);
        this._setDate(gr, 'u_updated_at', mongoUser.updatedAt);

        var sysId = isNew ? gr.insert() : (gr.update(), gr.getUniqueValue());
        return sysId;
    },

    /**
     * Read a citizen record and return it as a plain JavaScript object
     * using MongoDB-style field names.
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

    /**
     * Delete a citizen record by Mongo _id.
     */
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
            username: gr.getValue('u_username'),
            email: gr.getValue('u_email'),
            phoneNumber: gr.getValue('u_phone_number'),
            address: gr.getValue('u_address'),
            wardId: gr.getValue('u_ward_id'),
            zoneId: gr.getValue('u_zone_id'),
            municipalityId: gr.getValue('u_municipality_id'),
            departmentId: gr.getValue('u_department_id'),
            role: gr.getValue('u_role'),
            permissions: (gr.getValue('u_permissions') || '').split(',').filter(Boolean),
            isApproved: gr.getValue('u_is_approved') === 'true',
            isActive: gr.getValue('u_is_active') === 'true',
            isVerified: gr.getValue('u_is_verified') === 'true',
            banned: gr.getValue('u_banned') === 'true',
            reputationPoints: parseInt(gr.getValue('u_reputation_points'), 10) || 0,
            badges: (gr.getValue('u_badges') || '').split(',').filter(Boolean),
            level: gr.getValue('u_level'),
            lastLoginAt: gr.getValue('u_last_login_at'),
            failedLoginAttempts: parseInt(gr.getValue('u_failed_login_attempts'), 10) || 0,
            mfaEnabled: gr.getValue('u_mfa_enabled') === 'true',
            profileImageUrl: gr.getValue('u_profile_image_url'),
            createdAt: gr.getValue('u_created_at'),
            updatedAt: gr.getValue('u_updated_at'),
            _sysId: gr.getUniqueValue()
        };
    },

    type: 'CitizenDetailsUtil'
};
