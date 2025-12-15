/**
 * Disaster Scene Commander - Resource Manager
 * ============================================
 * Handles automatic resource deployment and alert triggering
 */

class ResourceManager {
    constructor() {
        this.deployedResources = [];
        this.alerts = [];
        this.resourceMapping = this.initResourceMapping();
    }

    /**
     * Initialize disaster type to resource mapping
     */
    initResourceMapping() {
        return {
            fire: ['FIRE_TRUCK', 'AMBULANCE', 'POLICE'],
            flood: ['RESCUE_TEAM', 'AMBULANCE', 'UTILITY'],
            earthquake: ['RESCUE_TEAM', 'AMBULANCE', 'FIRE_TRUCK', 'UTILITY'],
            building_collapse: ['RESCUE_TEAM', 'FIRE_TRUCK', 'AMBULANCE', 'POLICE'],
            chemical_spill: ['HAZMAT', 'FIRE_TRUCK', 'AMBULANCE', 'POLICE'],
            vehicle_accident: ['AMBULANCE', 'FIRE_TRUCK', 'POLICE'],
            medical_emergency: ['AMBULANCE'],
            explosion: ['FIRE_TRUCK', 'AMBULANCE', 'POLICE', 'HAZMAT'],
            storm_damage: ['UTILITY', 'RESCUE_TEAM', 'AMBULANCE'],
            other: ['AMBULANCE', 'POLICE', 'FIRE_TRUCK']
        };
    }

    /**
     * Process disaster analysis and deploy appropriate resources
     * @param {object} analysis - Gemini analysis result
     * @param {object} location - Incident location
     * @returns {object} Deployment result
     */
    async processDisasterResponse(analysis, location) {
        const deployment = {
            resources: [],
            alerts: [],
            timestamp: new Date().toISOString()
        };

        // Determine resources based on disaster type
        const resourceTypes = this.getRequiredResources(analysis);
        
        // Deploy each resource
        for (const resourceType of resourceTypes) {
            const resource = this.deployResource(resourceType, location, analysis.severity);
            deployment.resources.push(resource);
        }

        // Add helicopter for critical situations with casualties
        if (analysis.severity === 'critical' && 
            (analysis.estimated_casualties?.injured > 0 || analysis.estimated_casualties?.trapped > 0)) {
            const helicopter = this.deployResource('HELICOPTER', location, 'critical');
            deployment.resources.push(helicopter);
        }

        // Generate alerts
        deployment.alerts = this.generateAlerts(analysis, deployment.resources);
        
        // Store deployment
        this.deployedResources = deployment.resources;
        this.alerts = deployment.alerts;

        return deployment;
    }

    /**
     * Get required resources based on disaster type and severity
     */
    getRequiredResources(analysis) {
        const baseResources = this.resourceMapping[analysis.disaster_type] || this.resourceMapping.other;
        let resources = [...baseResources];

        // Add additional resources for critical severity
        if (analysis.severity === 'critical') {
            // Double up on ambulances for critical situations
            if (!resources.includes('RESCUE_TEAM')) {
                resources.push('RESCUE_TEAM');
            }
        }

        // Add resources based on specific hazards
        if (analysis.hazards_identified) {
            const hazards = analysis.hazards_identified.join(' ').toLowerCase();
            
            if (hazards.includes('chemical') || hazards.includes('toxic') || hazards.includes('gas')) {
                if (!resources.includes('HAZMAT')) resources.push('HAZMAT');
            }
            
            if (hazards.includes('electric') || hazards.includes('power') || hazards.includes('utility')) {
                if (!resources.includes('UTILITY')) resources.push('UTILITY');
            }
        }

        return [...new Set(resources)]; // Remove duplicates
    }

    /**
     * Deploy a single resource
     */
    deployResource(resourceType, location, severity) {
        const resourceConfig = DSC_CONFIG.RESOURCE_TYPES[resourceType];
        
        if (!resourceConfig) {
            console.warn(`Unknown resource type: ${resourceType}`);
            return null;
        }

        const resource = {
            id: this.generateResourceId(),
            type: resourceType,
            name: resourceConfig.name,
            icon: resourceConfig.icon,
            status: 'dispatched',
            dispatchTime: new Date().toISOString(),
            estimatedArrival: this.calculateETA(severity),
            destination: location
        };

        console.log(`[DISPATCH] ${resource.name} dispatched to location`);
        return resource;
    }

    /**
     * Generate unique resource ID
     */
    generateResourceId() {
        return `RSC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Calculate estimated time of arrival based on severity
     */
    calculateETA(severity) {
        const baseMinutes = {
            critical: 5,
            high: 8,
            medium: 12,
            low: 15
        };

        const minutes = baseMinutes[severity] || 10;
        const eta = new Date(Date.now() + minutes * 60 * 1000);
        return eta.toISOString();
    }

    /**
     * Generate system alerts based on analysis
     */
    generateAlerts(analysis, resources) {
        const alerts = [];
        const timestamp = new Date();

        // Main incident alert
        alerts.push({
            id: this.generateAlertId(),
            type: this.getAlertType(analysis.severity),
            timestamp: timestamp.toISOString(),
            message: `${analysis.disaster_type.replace('_', ' ').toUpperCase()} detected - Severity: ${analysis.severity.toUpperCase()}`
        });

        // Casualty alert
        if (analysis.estimated_casualties) {
            const { injured, trapped, immediate_danger } = analysis.estimated_casualties;
            if (injured > 0 || trapped > 0 || immediate_danger > 0) {
                alerts.push({
                    id: this.generateAlertId(),
                    type: 'danger',
                    timestamp: new Date(timestamp.getTime() + 100).toISOString(),
                    message: `Casualties reported: ${injured} injured, ${trapped} trapped, ${immediate_danger} in immediate danger`
                });
            }
        }

        // Resource dispatch alerts
        resources.filter(r => r).forEach((resource, index) => {
            alerts.push({
                id: this.generateAlertId(),
                type: 'success',
                timestamp: new Date(timestamp.getTime() + 200 + (index * 100)).toISOString(),
                message: `${resource.name} dispatched - ETA: ${this.formatETA(resource.estimatedArrival)}`
            });
        });

        // Hazard warnings
        if (analysis.hazards_identified && analysis.hazards_identified.length > 0) {
            alerts.push({
                id: this.generateAlertId(),
                type: 'warning',
                timestamp: new Date(timestamp.getTime() + 500).toISOString(),
                message: `Hazards identified: ${analysis.hazards_identified.slice(0, 3).join(', ')}`
            });
        }

        return alerts;
    }

    /**
     * Get alert type based on severity
     */
    getAlertType(severity) {
        const mapping = {
            critical: 'danger',
            high: 'warning',
            medium: 'info',
            low: 'info'
        };
        return mapping[severity] || 'info';
    }

    /**
     * Generate unique alert ID
     */
    generateAlertId() {
        return `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }

    /**
     * Format ETA for display
     */
    formatETA(isoString) {
        const eta = new Date(isoString);
        const now = new Date();
        const diffMinutes = Math.round((eta - now) / 60000);
        return `${diffMinutes} min`;
    }

    /**
     * Get deployed resources
     */
    getDeployedResources() {
        return this.deployedResources;
    }

    /**
     * Get all alerts
     */
    getAlerts() {
        return this.alerts;
    }

    /**
     * Trigger SOS emergency response
     */
    triggerSOSResponse(location) {
        const sosAnalysis = {
            disaster_type: 'other',
            severity: 'critical',
            estimated_casualties: {
                injured: 1,
                trapped: 0,
                immediate_danger: 1
            },
            hazards_identified: ['Unknown emergency']
        };

        return this.processDisasterResponse(sosAnalysis, location);
    }
}

// Create global instance
const resourceManager = new ResourceManager();
