/**
 * Disaster Scene Commander - Configuration
 * =========================================
 * Central configuration file for API keys and system settings
 */

// Attach to window for global access since this is a module now
window.DSC_CONFIG = {
    // API Keys
    // Keys are loaded from .env file via Vite
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    GEOAPIFY_API_KEY: import.meta.env.VITE_GEOAPIFY_API_KEY,

    // Gemini API Configuration
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',

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
Object.freeze(window.DSC_CONFIG);
Object.freeze(window.DSC_CONFIG.SEVERITY_LEVELS);
Object.freeze(window.DSC_CONFIG.RESOURCE_TYPES);
Object.freeze(window.DSC_CONFIG.DISASTER_TYPES);
