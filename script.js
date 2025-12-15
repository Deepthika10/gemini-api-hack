/**
 * Disaster Scene Commander - Main Application
 * ============================================
 * Core application logic and UI management
 */

// Global state
let map = null;
let userMarker = null;
let incidentMarker = null;
let userLocation = { lat: null, lng: null };
let selectedImage = null;
let selectedImageBase64 = null;

// DOM Elements
const elements = {
    imageUpload: null,
    imagePreview: null,
    fieldMessage: null,
    locationDisplay: null,
    submitButton: null,
    sosButton: null,
    mapOverlay: null,
    loadingModal: null,
    loadingStatus: null,
    analysisStatus: null,
    disasterAssessment: null,
    immediateActions: null,
    resourceDeployment: null,
    alertsLog: null
};

/**
 * Initialize application on DOM load
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    getUserLocation();
    addSystemAlert('info', 'Disaster Scene Commander initialized');
});

/**
 * Cache DOM elements
 */
function initializeElements() {
    elements.imageUpload = document.getElementById('image-upload');
    elements.imagePreview = document.getElementById('image-preview');
    elements.fieldMessage = document.getElementById('field-message');
    elements.locationDisplay = document.getElementById('location-display');
    elements.submitButton = document.getElementById('submit-report');
    elements.sosButton = document.getElementById('sos-button');
    elements.mapOverlay = document.getElementById('map-overlay');
    elements.loadingModal = document.getElementById('loading-modal');
    elements.loadingStatus = document.getElementById('loading-status');
    elements.analysisStatus = document.getElementById('analysis-status');
    elements.disasterAssessment = document.getElementById('disaster-assessment');
    elements.immediateActions = document.getElementById('immediate-actions');
    elements.resourceDeployment = document.getElementById('resource-deployment');
    elements.alertsLog = document.getElementById('alerts-log');
}

/**
 * Set up event listeners
 */
function initializeEventListeners() {
    // Image upload handler
    elements.imageUpload.addEventListener('change', handleImageUpload);
    
    // Text input handler
    elements.fieldMessage.addEventListener('input', validateForm);
    
    // Submit button handler
    elements.submitButton.addEventListener('click', handleSubmitReport);
    
    // SOS button handler
    elements.sosButton.addEventListener('click', handleSOSButton);
}

/**
 * Get user's current location using Geolocation API
 */
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation.lat = position.coords.latitude;
                userLocation.lng = position.coords.longitude;
                
                elements.locationDisplay.textContent = 
                    `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`;
                
                initializeMap(userLocation.lat, userLocation.lng);
                addSystemAlert('success', 'Location acquired successfully');
            },
            function(error) {
                console.error('Geolocation error:', error);
                elements.locationDisplay.textContent = 'Location unavailable - using default';
                
                // Use default location
                userLocation = { ...DSC_CONFIG.DEFAULT_LOCATION };
                initializeMap(userLocation.lat, userLocation.lng);
                addSystemAlert('warning', 'Could not get location - using default');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        elements.locationDisplay.textContent = 'Geolocation not supported';
        userLocation = { ...DSC_CONFIG.DEFAULT_LOCATION };
        initializeMap(userLocation.lat, userLocation.lng);
        addSystemAlert('warning', 'Geolocation not supported by browser');
    }
}

/**
 * Initialize Google Map
 */
function initializeMap(lat, lng) {
    const mapContainer = document.getElementById('map');
    
    map = new google.maps.Map(mapContainer, {
        zoom: DSC_CONFIG.DEFAULT_MAP_ZOOM,
        center: { lat, lng },
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        styles: getMapStyles()
    });

    // Add user location marker
    userMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'Your Location',
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
    });

    // Hide map overlay
    elements.mapOverlay.classList.add('hidden');
}

/**
 * Get dark theme map styles
 */
function getMapStyles() {
    return [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] }
    ];
}

/**
 * Handle image upload
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        selectedImage = file;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            elements.imagePreview.style.backgroundImage = `url(${e.target.result})`;
            elements.imagePreview.classList.add('has-image');
            
            // Store base64 for API call (remove data URL prefix)
            selectedImageBase64 = e.target.result.split(',')[1];
        };
        reader.readAsDataURL(file);
        
        addSystemAlert('info', 'Image captured and ready for analysis');
        validateForm();
    }
}

/**
 * Validate form and enable/disable submit button
 */
function validateForm() {
    const hasImage = selectedImage !== null;
    const hasMessage = elements.fieldMessage.value.trim().length > 0;
    const hasLocation = userLocation.lat !== null && userLocation.lng !== null;
    
    elements.submitButton.disabled = !(hasImage && hasMessage && hasLocation);
}

/**
 * Handle report submission
 */
async function handleSubmitReport() {
    if (elements.submitButton.disabled) return;
    
    // Show loading modal
    showLoadingModal('Analyzing disaster scene with AI...');
    
    try {
        // Step 1: Send to Gemini for analysis
        updateLoadingStatus('Processing multimodal input with Gemini AI...');
        
        const analysis = await geminiService.analyzeDisasterScene(
            selectedImageBase64,
            elements.fieldMessage.value,
            userLocation
        );
        
        console.log('Gemini Analysis Result:', analysis);
        
        // Step 2: Process response and deploy resources
        updateLoadingStatus('Deploying emergency resources...');
        
        const deployment = await resourceManager.processDisasterResponse(analysis, userLocation);
        
        // Step 3: Update UI with results
        updateLoadingStatus('Updating command dashboard...');
        
        displayAnalysisResults(analysis);
        displayDeployedResources(deployment.resources);
        displayAlerts(deployment.alerts);
        
        // Add incident marker to map
        addIncidentMarker(userLocation, analysis);
        
        // Hide loading modal
        hideLoadingModal();
        
        addSystemAlert('success', 'Analysis complete - Resources deployed');
        
    } catch (error) {
        console.error('Error processing report:', error);
        hideLoadingModal();
        addSystemAlert('danger', `Error: ${error.message}`);
        alert('Error analyzing disaster scene. Please try again.');
    }
}

/**
 * Display analysis results in UI
 */
function displayAnalysisResults(analysis) {
    // Update analysis status
    elements.analysisStatus.innerHTML = `
        <p style="color: var(--success-color);">
            <i class="fas fa-check-circle"></i> Analysis Complete
        </p>
    `;
    
    // Show and populate disaster assessment
    elements.disasterAssessment.classList.remove('hidden');
    
    document.getElementById('disaster-type').textContent = 
        analysis.disaster_type.replace('_', ' ').toUpperCase();
    
    const severityBadge = document.getElementById('disaster-severity');
    severityBadge.textContent = analysis.severity.toUpperCase();
    severityBadge.className = `severity-badge ${analysis.severity}`;
    
    document.getElementById('analysis-confidence').textContent = 
        `${Math.round((analysis.confidence_score || 0.8) * 100)}%`;
    
    // Show and populate immediate actions
    elements.immediateActions.classList.remove('hidden');
    
    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = '';
    
    analysis.immediate_actions.forEach((action, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="action-number">${index + 1}</span>
            <div>
                <strong>${action.action}</strong>
                <br><small style="color: var(--text-secondary);">${action.reason}</small>
            </div>
        `;
        actionsList.appendChild(li);
    });
}

/**
 * Display deployed resources
 */
function displayDeployedResources(resources) {
    elements.resourceDeployment.classList.remove('hidden');
    
    const resourcesList = document.getElementById('resources-list');
    resourcesList.innerHTML = '';
    
    resources.filter(r => r).forEach(resource => {
        const div = document.createElement('div');
        div.className = `resource-item ${resource.status}`;
        div.innerHTML = `
            <i class="fas ${resource.icon}"></i>
            <span>${resource.name}</span>
            <small style="margin-left: auto; color: var(--success-color);">
                ETA: ${resourceManager.formatETA(resource.estimatedArrival)}
            </small>
        `;
        resourcesList.appendChild(div);
    });
}

/**
 * Display alerts in the alerts log
 */
function displayAlerts(alerts) {
    alerts.forEach(alert => {
        addSystemAlert(alert.type, alert.message);
    });
}

/**
 * Add a system alert to the log
 */
function addSystemAlert(type, message) {
    const alertsLog = elements.alertsLog || document.getElementById('alerts-log');
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-item ${type}`;
    
    const time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    alertDiv.innerHTML = `
        <span class="alert-time">${time}</span>
        <span class="alert-message">${message}</span>
    `;
    
    // Add to top of alerts log
    if (alertsLog.firstChild) {
        alertsLog.insertBefore(alertDiv, alertsLog.firstChild);
    } else {
        alertsLog.appendChild(alertDiv);
    }
    
    // Limit alerts to 20
    while (alertsLog.children.length > 20) {
        alertsLog.removeChild(alertsLog.lastChild);
    }
}

/**
 * Add incident marker to map
 */
function addIncidentMarker(location, analysis) {
    // Remove existing incident marker if any
    if (incidentMarker) {
        incidentMarker.setMap(null);
    }
    
    // Determine marker color based on severity
    const markerColors = {
        critical: 'red',
        high: 'orange',
        medium: 'yellow',
        low: 'green'
    };
    
    const color = markerColors[analysis.severity] || 'red';
    
    incidentMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: `${analysis.disaster_type} - ${analysis.severity}`,
        icon: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
        animation: google.maps.Animation.DROP
    });
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="color: #333; padding: 5px;">
                <strong>${analysis.disaster_type.replace('_', ' ').toUpperCase()}</strong><br>
                Severity: ${analysis.severity.toUpperCase()}<br>
                ${analysis.scene_description || ''}
            </div>
        `
    });
    
    incidentMarker.addListener('click', () => {
        infoWindow.open(map, incidentMarker);
    });
    
    // Center map on incident
    map.panTo(location);
}

/**
 * Handle SOS button click
 */
async function handleSOSButton() {
    if (!userLocation.lat || !userLocation.lng) {
        alert('Cannot send SOS - Location not available!');
        return;
    }
    
    const confirmed = confirm(
        'EMERGENCY SOS ALERT\n\n' +
        'This will immediately dispatch emergency services to your location.\n\n' +
        'Are you sure you want to send an SOS alert?'
    );
    
    if (confirmed) {
        showLoadingModal('Sending SOS Alert...');
        addSystemAlert('danger', 'SOS EMERGENCY ALERT TRIGGERED');
        
        try {
            updateLoadingStatus('Dispatching emergency resources...');
            
            const deployment = await resourceManager.triggerSOSResponse(userLocation);
            
            displayDeployedResources(deployment.resources);
            displayAlerts(deployment.alerts);
            
            // Add SOS marker
            addSOSMarker(userLocation);
            
            hideLoadingModal();
            
            alert(
                'SOS ALERT SENT!\n\n' +
                'Emergency services have been notified.\n' +
                'Stay calm and await assistance.\n\n' +
                `Resources dispatched: ${deployment.resources.length}`
            );
            
        } catch (error) {
            hideLoadingModal();
            addSystemAlert('danger', 'SOS dispatch error - retry immediately');
            alert('Error sending SOS. Please call emergency services directly!');
        }
    }
}

/**
 * Add SOS marker to map
 */
function addSOSMarker(location) {
    const sosMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: 'SOS EMERGENCY',
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        animation: google.maps.Animation.BOUNCE
    });
    
    // Stop bouncing after 3 seconds
    setTimeout(() => {
        sosMarker.setAnimation(null);
    }, 3000);
}

/**
 * Show loading modal
 */
function showLoadingModal(message) {
    elements.loadingModal.classList.remove('hidden');
    if (message) {
        elements.loadingStatus.textContent = message;
    }
}

/**
 * Hide loading modal
 */
function hideLoadingModal() {
    elements.loadingModal.classList.add('hidden');
}

/**
 * Update loading status message
 */
function updateLoadingStatus(message) {
    elements.loadingStatus.textContent = message;
}
