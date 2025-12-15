/**
 * Disaster Scene Commander - Configuration
 * =========================================
 * Central configuration file for API keys and system settings
 */

const DSC_CONFIG = {
    // API Keys
    // TODO: Replace with your actual API keys in production
    GEMINI_API_KEY: 'AIzaSyA0mUQtD6fU0yhxWzdpqRSnWECQTo7kae8', // Get from https://makersuite.google.com/app/apikey
    GOOGLE_MAPS_API_KEY: 'AIzaSyAGFzwq8gbZ3SntVfWRdQrH6PYRZjBjgSk',
    GEOAPIFY_API_KEY: 'a25cbe79945f4e79948b1b83df86e468',
    
    // Gemini API Configuration
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    
    // System Settings
    DEFAULT_MAP_ZOOM: 15,
    DEFAULT_LOCATION: { lat: 39.8283, lng: -98.5795 }, // Center of US as fallback
    
    // Severity Levels
    SEVERITY_LEVELS: {
        CRITICAL: 'critical',
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
    },
    
    // Resource Types
    RESOURCE_TYPES: {
        FIRE_TRUCK: { name: 'Fire Truck', icon: 'fa-fire-extinguisher', color: '#d32f2f' },
        AMBULANCE: { name: 'Ambulance', icon: 'fa-ambulance', color: '#1976d2' },
        POLICE: { name: 'Police Unit', icon: 'fa-shield-alt', color: '#1a237e' },
        RESCUE_TEAM: { name: 'Search & Rescue', icon: 'fa-users', color: '#ff6f00' },
        HAZMAT: { name: 'HazMat Team', icon: 'fa-biohazard', color: '#7b1fa2' },
        HELICOPTER: { name: 'Med Helicopter', icon: 'fa-helicopter', color: '#00897b' },
        UTILITY: { name: 'Utility Crew', icon: 'fa-hard-hat', color: '#ffc107' }
    },
    
    // Disaster Type Mappings
    DISASTER_TYPES: {
        FIRE: 'fire',
        FLOOD: 'flood',
        EARTHQUAKE: 'earthquake',
        BUILDING_COLLAPSE: 'building_collapse',
        CHEMICAL_SPILL: 'chemical_spill',
        VEHICLE_ACCIDENT: 'vehicle_accident',
        MEDICAL_EMERGENCY: 'medical_emergency',
        EXPLOSION: 'explosion',
        STORM_DAMAGE: 'storm_damage',
        OTHER: 'other'
    }
};

// Freeze configuration to prevent accidental modifications
Object.freeze(DSC_CONFIG);
Object.freeze(DSC_CONFIG.SEVERITY_LEVELS);
Object.freeze(DSC_CONFIG.RESOURCE_TYPES);
Object.freeze(DSC_CONFIG.DISASTER_TYPES);
