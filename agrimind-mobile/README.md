# AgriMind Mobile Frontend

A cross-platform mobile application for **AgriMind** built with **React Native + Expo**, consuming the existing AgriMind Express backend, MongoDB, and AI/ML system with zero modifications to the existing infrastructure.

---

## 📱 Features

- **Branding & Visual Parity**: Matches the web application's SeaGreen (`#2E8B57`) and SandyBrown (`#F4A460`) color palette, cards, typography, and layout hierarchy adapted for mobile screens.
- **Session-Based Authentication**: Seamlessly integrates with Express-session and `connect.sid` cookie system via an Axios interceptor without modifying backend auth or requiring JWT refactors.
- **AI Crop Recommendation**: Exact input payload (`soilPh`, `nitrogen`, `phosphorus`, `potassium`, `temperature`, `humidity`, `rainfall`, `area`, `state`, `city`, `season`, `pastCrop`) calling `POST /api/recommend` with full agronomic reasoning, SHAP / model explanation, dynamic APMC market economics, and visual charts.
- **Fertilizer Guidance**: `POST /api/fertilizer/recommend` with soil status, nutrient priorities, recommended fertilizers, and alternatives.
- **Smart Irrigation**: `POST /api/irrigation/check` evaluating moisture percentage against threshold values for 43 crops.
- **Live Karnataka Market Prices**: District-level APMC commodity prices (`/api/market-prices/districts` and `/api/market-prices?district=...`).
- **Platform Analytics**: Interactive visualization of most recommended crops, seasonal demands, fertilizer recommendations, and NPK nutrient balance (`/api/analytics`).
- **Recommendation History & PDF Reports**: Past consultations list (`/api/recommend/:userId`) with 1-click native PDF downloading and sharing (`/recommendation/pdf/:id`).
- **Profile Management**: View and edit personal details, camera and gallery photo upload (`/profile/update`).
- **AI Agricultural Assistant**: Interactive chat widget with suggestions and intelligent agronomic responses.
- **Multilingual Support**: Instant language switching between **English**, **Hindi (हिन्दी)**, and **Kannada (ಕನ್ನಡ)**.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure the AgriMind backend server is running:
```bash
# In the project root (e:\agrimind)
node app.js
```
The server typically runs on `http://localhost:3000`.

### 2. Configure API Endpoint
Edit `agrimind-mobile/.env` or configure inside the app:
- **Android Emulator**: `http://10.0.2.2:3000` (maps to host computer's `localhost:3000`)
- **iOS Simulator**: `http://localhost:3000`
- **Physical Phone (Expo Go)**: `http://<YOUR_COMPUTER_LOCAL_IP>:3000` (e.g. `http://192.168.1.10:3000`, computer and phone on same Wi-Fi).

*Note: You can also tap the Settings icon on the Login or Profile screens to change the Backend Host URL dynamically without rebuilding!*

### 3. Start the Expo Development Server
```bash
cd agrimind-mobile
npx expo start
```

- Press `a` to open in Android Emulator
- Press `i` to open in iOS Simulator
- Scan the QR code using the **Expo Go** app on your physical Android or iPhone.
