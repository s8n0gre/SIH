/**
 * FIELD MAP: MongoDB Users  ↔  ServiceNow x_1832142_munici_0_citizen_details
 *
 * Usage: import this map in Script Includes or Transform Maps.
 * Left  = MongoDB / Node.js field name
 * Right = ServiceNow table column name
 */

var CITIZEN_DETAILS_TABLE = 'x_1832142_munici_0_citizen_details';

var CITIZEN_DETAILS_FIELD_MAP = {
    // Core identity
    _id: 'u_mongo_id',          // String  – stored so we can look up by Mongo _id
    username: 'u_username',
    email: 'u_email',
    password: 'u_password_hash',     // Encrypted / hashed value only
    phone_number: 'u_phone_number',      // MongoDB: phoneNumber
    address: 'u_address',

    // Organisational references
    ward_id: 'u_ward_id',
    zone_id: 'u_zone_id',
    municipality_id: 'u_municipality_id',
    department_id: 'u_department_id',

    // Role & permissions
    role: 'u_role',              // citizen | department_admin | system_admin
    permissions: 'u_permissions',       // Glide List (comma-separated string)

    // Status flags
    is_approved: 'u_is_approved',       // MongoDB: isApproved
    is_active: 'u_is_active',         // MongoDB: isActive
    is_verified: 'u_is_verified',       // MongoDB: isVerified
    banned: 'u_banned',

    // Reputation
    reputation_points: 'u_reputation_points', // MongoDB: reputationPoints
    badges: 'u_badges',            // Glide List
    level: 'u_level',             // Citizen | Contributor | Champion | Leader

    // Security
    last_login_at: 'u_last_login_at',          // MongoDB: lastLoginAt
    failed_login_attempts: 'u_failed_login_attempts',  // MongoDB: failedLoginAttempts
    mfa_enabled: 'u_mfa_enabled',            // MongoDB: mfaEnabled

    // Profile
    profile_image_url: 'u_profile_image_url', // MongoDB: profileImageUrl

    // Timestamps
    created_at: 'u_created_at',        // MongoDB: createdAt
    updated_at: 'u_updated_at'         // MongoDB: updatedAt
};

// Reverse map: ServiceNow column → MongoDB field
var CITIZEN_DETAILS_REVERSE_MAP = (function () {
    var rev = {};
    for (var k in CITIZEN_DETAILS_FIELD_MAP) {
        rev[CITIZEN_DETAILS_FIELD_MAP[k]] = k;
    }
    return rev;
}());
