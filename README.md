# Disaster Scene Commander (DSC)

Disaster Scene Commander is a multimodal AI-powered command center application designed to assist first responders in analyzing disaster scenes. It leverages Google's Gemini API to process images and field reports, automatically assessing severity, identifying hazards, and deploying appropriate resources.

## 🚀 Features

*   **Multimodal Analysis**: Uses **Gemini 1.5 Flash** (via API) to analyze both images and text descriptions of disaster scenes.
*   **Real-time Assessment**: Automatically determines disaster type, severity level (Critical, High, Medium, Low), and confidence score.
*   **Resource Management**: Automatically suggests and tracks deployed resources (e.g., Fire Trucks, Ambulances, Rescue Teams) based on the specific needs of the incident.
*   **Interactive Map**: Integration with **Google Maps** to pinpoint incident locations and track resource movements (simulated).
*   **Geolocation**: Automatically acquires the user's current coordinates for accurate reporting.
*   **Emergency SOS**: dedicated SOS button for immediate critical response triggering.
*   **Responsive Design**: Mobile-friendly interface suitable for field operations.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, CSS3, JavaScript (ES6+ Modules)
*   **Build Tool**: Vite
*   **AI Model**: Google Gemini 1.5 Flash (via Google Generative AI API)
*   **Maps**: Google Maps JavaScript API
*   **Geocoding**: Geoapify (configured but optional depending on specific implementation)

## 📋 Prerequisites

Before you begin, ensure you have the following keys:

1.  **Gemini API Key**: Get it from [Google AI Studio](https://makersuite.google.com/app/apikey).
2.  **Google Maps API Key**: Get it from [Google Cloud Console](https://console.cloud.google.com/).
3.  **Geoapify API Key**: Get it from [Geoapify](https://www.geoapify.com/) (used for reverse geocoding if enabled).

You also need **Node.js** (v14 or higher) and **npm** installed on your machine.

## ⚙️ Installation & Setup

1.  **Clone the repository** (or download source files):
    ```bash
    git clone <repository-url>
    cd gemini-api-hack
    ```

2.  **Install Dependencies**:
    Initialize the project and install Vite:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root directory. **Do not commit this file to version control.**
    
    ```bash
    touch .env
    ```

    Add your API keys to the `.env` file:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
    VITE_GEOAPIFY_API_KEY=your_geoapify_api_key_here
    ```

## 🚀 Usage

1.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

2.  **Access the Application**:
    Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173/`).

3.  **Submit a Report**:
    *   **Upload/Capture**: Click the camera icon to upload an image of the scene.
    *   **Describe**: Enter a brief text description of the situation.
    *   **Location**: Ensure your location is detected (allow browser permission).
    *   **Analyze**: Click "Analyze & Deploy Resources".

## 📁 Project Structure

```
gemini-api-hack/
├── .env                  # API keys (not in git)
├── config.js             # Configuration & global constants
├── gemini-service.js     # Gemini API integration & prompt logic
├── resource-manager.js   # Resource deployment & alert logic
├── script.js             # Main coordination & UI event handlers
├── index.html            # Application entry point
├── style.css             # Application styling
├── package.json          # Project dependencies & scripts
└── README.md             # Project documentation
```

## ⚠️ Troubleshooting

*   **API Errors**: If you see quota errors (429), the application is configured to use `gemini-1.5-flash-latest` which is free-tier friendly. Ensure your API key has billing enabled if required for higher quotas.
*   **Map Not Loading**: Check if the `VITE_GOOGLE_MAPS_API_KEY` is correct and has the "Maps JavaScript API" enabled in Google Cloud Console.
*   **Geolocation Failed**: Ensure you are testing on `localhost` or `HTTPS`, as modern browsers block geolocation on insecure origins.

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
