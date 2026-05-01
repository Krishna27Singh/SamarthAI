# 🌍 SamarthAI — Intelligent Disaster Response & Coordination Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

SamarthAI is an AI-powered logistics and field coordination platform built for NGOs and volunteers. It bridges the gap between administrative command centers and on-the-ground responders during crises, providing real-time data ingestion, predictive resource mapping, and optimized volunteer dispatch routing.

---

## ✨ Key Features

- **🔐 Role-Based Access Control (RBAC):** Secure, distinct portals for NGO Administrators (Command Center) and Field Volunteers (Mobile App).
- **🗺️ Predictive Resources Map:** Real-time Leaflet integration displaying critical zones, active regions, and live volunteer tracking.
- **🤖 AI-Assisted Dispatch:** Intelligent matching of emergencies to volunteers based on location, capabilities (e.g., medical, rescue), and urgency.
- **🔥 Heatmap & Anomaly Detection:** Python-based ML engine (XGBoost/SHAP) predicting resource shortages and detecting fraudulent or duplicate supply requests.
- **📱 Mobile-First Field App:** A responsive, native-feeling app layout for volunteers to receive smart itineraries and report real-time status.

---

## 🏗️ Architecture & Tech Stack

SamarthAI is built using a modern microservices architecture:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS | The UI application containing both the NGO Dashboard and Volunteer Field App. |
| **Backend** | Node.js, Express.js | The core business logic API handling user management, dispatch logic, and Firebase auth. |
| **ML Service** | Python, FastAPI, XGBoost | The machine learning engine handling heatmap generation, AI recommendations, and anomalies. |
| **Database/Auth** | Firebase | Authentication and real-time data storage. |
| **Infrastructure**| Docker, Docker Compose | Containerization for seamless local development and deployment. |

---

## 📂 Project Structure
```text
SamarthAI/
├── frontend/               # React + Vite Client
│   ├── src/
│   │   ├── components/     # Reusable UI elements
│   │   ├── pages/          # Auth, Command Center, Field App
│   │   └── services/       # API calling logic
│   └── Dockerfile          # Multi-stage Nginx build
├── backend/                # Node.js API
│   ├── src/
│   │   ├── controllers/    # Route logic
│   │   ├── routes/         # Express routers
│   │   └── services/       # Core business logic
│   └── Dockerfile          # Node Alpine build
├── ml_service/             # Python ML Engine
│   ├── core/               # App configuration
│   ├── routers/            # FastAPI endpoints
│   ├── services/           # ML Models, SHAP explainers
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Python slim build
└── docker-compose.yml      # Master orchestration file
