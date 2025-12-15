/**
 * Disaster Scene Commander - Gemini AI Service
 * =============================================
 * Handles multimodal analysis using Google's Gemini API
 */

class GeminiService {
    constructor() {
        this.apiKey = DSC_CONFIG.GEMINI_API_KEY;
        this.apiUrl = DSC_CONFIG.GEMINI_API_URL;
    }

    /**
     * Analyze disaster scene using multimodal input (image + text)
     * @param {string} imageBase64 - Base64 encoded image data
     * @param {string} textMessage - Responder's situation report
     * @param {object} location - GPS coordinates { lat, lng }
     * @returns {Promise<object>} Structured disaster analysis
     */
    async analyzeDisasterScene(imageBase64, textMessage, location) {
        const prompt = this.buildAnalysisPrompt(textMessage, location);

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        },
                        {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.1,
                topK: 32,
                topP: 1,
                maxOutputTokens: 2048
            }
        };

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return this.parseGeminiResponse(data);

        } catch (error) {
            console.error('Gemini Service Error:', error);
            throw error;
        }
    }

    /**
     * Build the analysis prompt for Gemini
     */
    buildAnalysisPrompt(textMessage, location) {
        return `You are an expert disaster response analyst for the Disaster Scene Commander (DSC) system. 
Analyze the provided image and field report to assess the disaster situation.

FIELD REPORT FROM RESPONDER:
"${textMessage}"

LOCATION COORDINATES:
Latitude: ${location.lat}
Longitude: ${location.lng}

INSTRUCTIONS:
1. Carefully examine the image for signs of disaster, damage, hazards, and affected individuals
2. Cross-reference visual observations with the responder's text report
3. Provide a comprehensive assessment in the exact JSON format specified below

RESPONSE FORMAT (respond ONLY with valid JSON, no other text):
{
    "disaster_type": "<one of: fire, flood, earthquake, building_collapse, chemical_spill, vehicle_accident, medical_emergency, explosion, storm_damage, other>",
    "disaster_subtype": "<more specific description>",
    "severity": "<one of: critical, high, medium, low>",
    "confidence_score": <0.0 to 1.0>,
    "scene_description": "<brief description of what is observed>",
    "estimated_casualties": {
        "injured": <estimated number or 0>,
        "trapped": <estimated number or 0>,
        "immediate_danger": <estimated number or 0>
    },
    "hazards_identified": ["<list of identified hazards>"],
    "immediate_actions": [
        {
            "priority": 1,
            "action": "<specific action to take>",
            "reason": "<why this action is critical>"
        },
        {
            "priority": 2,
            "action": "<specific action to take>",
            "reason": "<why this action is important>"
        },
        {
            "priority": 3,
            "action": "<specific action to take>",
            "reason": "<why this action is needed>"
        }
    ],
    "resources_needed": ["<list of resource types needed>"],
    "special_considerations": "<any special notes for responders>"
}`;
    }

    /**
     * Parse and validate Gemini's response
     */
    parseGeminiResponse(data) {
        try {
            // Extract text content from Gemini response
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                throw new Error('No content in Gemini response');
            }

            // Extract JSON from response (handle potential markdown formatting)
            let jsonString = textContent;

            // Remove markdown code blocks if present
            const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                jsonString = jsonMatch[1];
            }

            // Parse JSON
            const analysis = JSON.parse(jsonString.trim());

            // Validate required fields
            this.validateAnalysis(analysis);

            return analysis;

        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            // Return a default analysis structure on parse failure
            return this.getDefaultAnalysis();
        }
    }

    /**
     * Validate the analysis object has required fields
     */
    validateAnalysis(analysis) {
        const requiredFields = ['disaster_type', 'severity', 'immediate_actions'];

        for (const field of requiredFields) {
            if (!analysis[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (!Array.isArray(analysis.immediate_actions) || analysis.immediate_actions.length < 1) {
            throw new Error('immediate_actions must be an array with at least 1 action');
        }
    }

    /**
     * Get default analysis structure for fallback
     */
    getDefaultAnalysis() {
        return {
            disaster_type: 'other',
            disaster_subtype: 'Unable to determine',
            severity: 'medium',
            confidence_score: 0.0,
            scene_description: 'Analysis could not be completed. Manual assessment required.',
            estimated_casualties: {
                injured: 0,
                trapped: 0,
                immediate_danger: 0
            },
            hazards_identified: ['Unknown - proceed with caution'],
            immediate_actions: [
                {
                    priority: 1,
                    action: 'Dispatch first responders for manual assessment',
                    reason: 'Automated analysis failed - human evaluation needed'
                },
                {
                    priority: 2,
                    action: 'Establish safety perimeter',
                    reason: 'Prevent additional casualties until situation is assessed'
                },
                {
                    priority: 3,
                    action: 'Prepare multi-agency response',
                    reason: 'Unknown disaster type may require varied resources'
                }
            ],
            resources_needed: ['Assessment Team', 'First Responders'],
            special_considerations: 'Automated analysis failed. Exercise extreme caution.'
        };
    }

    /**
     * Analyze text-only report (fallback when no image available)
     */
    async analyzeTextOnly(textMessage, location) {
        const prompt = `You are an expert disaster response analyst. Based ONLY on the following text report, 
provide a disaster assessment.

FIELD REPORT: "${textMessage}"
LOCATION: Lat ${location.lat}, Lng ${location.lng}

Respond with the same JSON structure as a full analysis, but note lower confidence due to lack of visual data.`;

        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048
            }
        };

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            return this.parseGeminiResponse(data);
        } catch (error) {
            console.error('Text analysis error:', error);
            return this.getDefaultAnalysis();
        }
    }
}

// Create global instance attached to window for module access
window.geminiService = new GeminiService();
