// ─── Municipality Domain → Category → Subcategory Hierarchy ─────────────────
// Single source of truth derived from Municipality_domain_category_subcategory.csv

export interface MunicipalityEntry {
    domain: string;
    category: string;
    subcategories: string[];
}

export const MUNICIPALITY_HIERARCHY: MunicipalityEntry[] = [
    // ── Core Infrastructure Services ──────────────────────────────────────────
    {
        domain: 'Core Infrastructure Services',
        category: 'Roads & Infrastructure',
        subcategories: [
            'Potholes and surface degradation',
            'Road markings and signage',
            'Traffic signals and control devices',
            'Street lighting infrastructure',
            'Sidewalks and pedestrian pathways',
            'Bridges and overpasses',
            'Drainage and stormwater channels',
            'Construction zone management',
            'Obstructions and debris on roadway',
            'Accessibility compliance',
        ],
    },
    {
        domain: 'Core Infrastructure Services',
        category: 'Water Services',
        subcategories: [
            'Water supply interruptions',
            'Water pressure irregularities',
            'Water quality concerns',
            'Water main leaks and bursts',
            'Hydrant maintenance',
            'Sewer blockages',
            'Sewer overflows',
            'Stormwater flooding',
            'Manhole cover damage',
            'Backflow incidents',
        ],
    },
    {
        domain: 'Core Infrastructure Services',
        category: 'Electricity Services',
        subcategories: [
            'Power outages',
            'Voltage fluctuations',
            'Damaged power lines',
            'Streetlight electrical faults',
            'Transformer failures',
            'Exposed electrical infrastructure',
            'Illegal connections',
            'Meter faults',
            'Underground cable faults',
            'Substation issues',
        ],
    },

    // ── Sanitation and Environmental Services ─────────────────────────────────
    {
        domain: 'Sanitation and Environmental Services',
        category: 'Waste Management',
        subcategories: [
            'Missed waste collection',
            'Overflowing public bins',
            'Illegal dumping',
            'Hazardous waste disposal',
            'Recycling service issues',
            'Bulk waste removal',
            'Dead animal removal',
            'Construction debris',
            'Graffiti and litter',
            'Medical waste disposal',
        ],
    },

    // ── Transport and Urban Mobility ──────────────────────────────────────────
    {
        domain: 'Transport and Urban Mobility',
        category: 'Public Transport Operations',
        subcategories: [
            'Public bus operations',
            'Para-transit regulation',
            'Traffic circulation planning',
            'Non-motorized transport infrastructure',
            'Transit shelters and terminals',
            'Smart mobility systems',
        ],
    },
    {
        domain: 'Transport and Urban Mobility',
        category: 'Parking Administration',
        subcategories: [
            'On-street parking control',
            'Off-street parking facilities',
            'Fee collection systems',
            'Illegal parking enforcement',
            'Residential parking permits',
        ],
    },

    // ── Urban Planning and Asset Administration ───────────────────────────────
    {
        domain: 'Urban Planning and Asset Administration',
        category: 'Estate and Land Management',
        subcategories: [
            'Municipal property inventory',
            'Lease management',
            'Land acquisition',
            'Asset disposal',
            'Property mutation',
        ],
    },
    {
        domain: 'Urban Planning and Asset Administration',
        category: 'Procurement and Stores',
        subcategories: [
            'Tendering and bidding',
            'Vendor registration',
            'Inventory control',
            'Contract management',
            'Rate contract administration',
        ],
    },
    {
        domain: 'Urban Planning and Asset Administration',
        category: 'Mechanical and Workshop Services',
        subcategories: [
            'Vehicle maintenance',
            'Equipment repair',
            'Fleet management',
            'Fuel monitoring',
            'Workshop operations',
        ],
    },

    // ── Governance, Citizen Interface and Administration ──────────────────────
    {
        domain: 'Governance, Citizen Interface and Administration',
        category: 'Public Grievance Redressal',
        subcategories: [
            'Complaint registration',
            'Escalation management',
            'Service tracking',
            'Appeal review',
            'Citizen feedback analysis',
        ],
    },
    {
        domain: 'Governance, Citizen Interface and Administration',
        category: 'Internal Audit',
        subcategories: [
            'Financial audit',
            'Compliance audit',
            'Performance audit',
            'Risk assessment',
            'Fraud investigation',
        ],
    },

    // ── Social and Community Development ──────────────────────────────────────
    {
        domain: 'Social and Community Development',
        category: 'Parks & Recreation',
        subcategories: [
            'Playground equipment damage',
            'Park lighting faults',
            'Irrigation system failure',
            'Sports facility maintenance',
            'Vandalism',
            'Public restroom maintenance',
            'Trail and pathway hazards',
            'Tree hazards',
        ],
    },
    {
        domain: 'Social and Community Development',
        category: 'Gender and Child Development',
        subcategories: [
            'Women safety initiatives',
            'Child protection programs',
            'Support centres',
            'Awareness campaigns',
            'Nutritional support',
        ],
    },

    // ── Public Safety and Regulatory Enforcement ──────────────────────────────
    {
        domain: 'Public Safety and Regulatory Enforcement',
        category: 'Public Safety',
        subcategories: [
            'Encroachment or unauthorized use',
        ],
    },
];

// ─── Derived helper collections ───────────────────────────────────────────────

/** All unique domain names */
export const DOMAINS: string[] = [...new Set(MUNICIPALITY_HIERARCHY.map(e => e.domain))];

/** All unique category names */
export const CATEGORIES: string[] = MUNICIPALITY_HIERARCHY.map(e => e.category);

/** All unique category names + "Other" fallback */
export const CATEGORIES_WITH_OTHER: string[] = [...CATEGORIES, 'Other'];

/** Map: category → domain */
export const CATEGORY_TO_DOMAIN: Record<string, string> = Object.fromEntries(
    MUNICIPALITY_HIERARCHY.map(e => [e.category, e.domain])
);

/** Given a domain, return its categories */
export function getCategoriesForDomain(domain: string): string[] {
    return MUNICIPALITY_HIERARCHY
        .filter(e => e.domain === domain)
        .map(e => e.category);
}

/** Given a category, return its subcategories */
export function getSubcategoriesForCategory(category: string): string[] {
    return MUNICIPALITY_HIERARCHY.find(e => e.category === category)?.subcategories ?? [];
}

/** Given text, return the matching category (for AI keyword matching) */
export function inferCategoryFromText(text: string): string {
    const t = text.toLowerCase();
    if (t.match(/pothole|road|street|pavement|asphalt|highway|bridge|sidewalk|traffic signal|signage|drainage/))
        return 'Roads & Infrastructure';
    if (t.match(/water|leak|pipe|drain|sewer|flood|tap|supply|hydrant|manhole|backflow/))
        return 'Water Services';
    if (t.match(/electric|power|light|lamp|bulb|pole|wire|outage|transformer|voltage|meter|substation/))
        return 'Electricity Services';
    if (t.match(/trash|garbage|waste|bin|litter|dump|rubbish|recycl|dead animal|graffiti|medical waste/))
        return 'Waste Management';
    if (t.match(/park|tree|garden|playground|bench|grass|plant|recreation|sport|restroom|trail|irrigation/))
        return 'Parks & Recreation';
    if (t.match(/safety|danger|crime|security|accident|hazard|emergency|encroach/))
        return 'Public Safety';
    if (t.match(/bus|transit|transport|para.transit|shelter|terminal|mobility/))
        return 'Public Transport Operations';
    if (t.match(/parking|park.*car|illegal park/))
        return 'Parking Administration';
    if (t.match(/grievance|complaint|appeal|feedback/))
        return 'Public Grievance Redressal';
    if (t.match(/audit|financial|compliance|fraud|risk/))
        return 'Internal Audit';
    if (t.match(/land|lease|property|asset|mutation|acquisition/))
        return 'Estate and Land Management';
    if (t.match(/procurement|vendor|tender|contract|inventory|rate contract/))
        return 'Procurement and Stores';
    if (t.match(/vehicle|fleet|workshop|equipment|fuel/))
        return 'Mechanical and Workshop Services';
    if (t.match(/women|child|gender|nutrition|support centre|awareness/))
        return 'Gender and Child Development';
    return 'Roads & Infrastructure'; // safe default
}
