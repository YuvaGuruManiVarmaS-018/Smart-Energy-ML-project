# ⚡ VoltIQ — Smart Energy Management Platform (Family-Owned Properties)
### B.Tech AIML Capstone Project
**Title:** *"Machine Learning-Based Smart Energy Consumption Prediction and Optimization System"*

A full-stack, enterprise-grade energy intelligence platform designed for family accounts managing multiple residential, commercial, and industrial properties (e.g., *Family Villa*, *Corporate Office*, *Retail Supermarket*, *Logistics Warehouse*).

---

## 🏛️ System Architecture

```text
Smart-Energy-ML/
│
├── frontend/                        # React 18, Vite, React Router v6, Recharts, Lucide
│   ├── src/
│   │   ├── components/              # Sidebar, Navbar (with Mode Switcher & Sim controls)
│   │   ├── layouts/                 # MainLayout (Protected multi-property shell)
│   │   ├── context/                 # AppContext (Auth, Operating Mode, Simulation State)
│   │   ├── services/                # api.js (JWT authenticated API client + endpoints)
│   │   ├── styles/                  # index.css (3D glassmorphic styling, glows, animations)
│   │   ├── pages/                   # 15 Dedicated Application Pages
│   │   │   ├── AuthPage.jsx         # 3D Glassmorphic Login & Family Registration
│   │   │   ├── DashboardPage.jsx    # Dynamic Multi-Property Family Dashboard (₹ Bill, kW)
│   │   │   ├── Module1DataPage.jsx  # [MODULE 1] Schema Auto-Detection, Cleaning & Quality
│   │   │   ├── Module2MLPage.jsx    # [MODULE 2] 3-Model Benchmark (LR, DT, RF) & Analytics
│   │   │   ├── Module3OptPage.jsx   # [MODULE 3] Recommendations, ₹ Tariff & Deployment
│   │   │   ├── FacultyDemoPage.jsx  # [FACULTY VIVA] 11-Stage Interactive Walkthrough
│   │   │   ├── MLExperimentsPage.jsx# [ML BENCHMARK] Multi-Model Metrics & Active Champion Switch
│   │   │   ├── SystemActivityPage.jsx# [LIVE MONITOR] Immutable SQLite Backend Event Logs
│   │   │   ├── IoTDevicesPage.jsx   # [MODE C: IOT] Smart Meter Node Registry & Ingest Tester
│   │   │   ├── PropertiesPage.jsx   # 3D Property Portfolio Management
│   │   │   ├── FamilyMembersPage.jsx# Family Members, Roles & Invite Codes
│   │   │   ├── AppliancesPage.jsx   # Connected Equipment & Wattage Catalog
│   │   │   ├── EnergyHistoryPage.jsx# Telemetry Audit Trail & Anomaly Flags
│   │   │   ├── ReportsPage.jsx      # Downloadable Energy Audit Reports
│   │   │   ├── NotificationsPage.jsx# Real-time Grid & Anomaly Alerts
│   │   │   └── SettingsPage.jsx     # Property Tariff Settings in ₹/kWh
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                         # FastAPI, SQLite, Scikit-learn, PyJWT, Bcrypt
│   ├── main.py                      # ASGI App, CORS, Lifespan Startup & Seed
│   ├── database/
│   │   ├── db.py                    # SQLite Relational Database Engine (15 Tables) + log_activity
│   │   └── seed_data.py             # Pre-seeded Sharma Family & 4 Properties + Telemetry
│   ├── auth/
│   │   ├── security.py              # Bcrypt password hashing & JWT token encoding
│   │   └── dependencies.py          # Property-level multi-tenant authorization
│   ├── models/
│   │   └── schemas.py               # Pydantic Schemas for validation
│   ├── routes/
│   │   ├── auth_routes.py           # /api/auth (register, login, me, logout)
│   │   ├── family_routes.py         # /api/family (properties, members, appliances)
│   │   ├── module1_routes.py        # /api/dataset (upload, preprocess, preview, download)
│   │   ├── module2_routes.py        # /api/model (train, metrics, predict, set-active)
│   │   ├── module3_routes.py        # /api/optimize (audit, recommendations, status)
│   │   ├── dashboard_routes.py      # /api/dashboard (multi-property summary)
│   │   ├── reports_routes.py        # /api/reports (audit reports & CSV downloads)
│   │   ├── iot_routes.py            # /api/iot (devices, ingest, status)
│   │   ├── simulation_routes.py     # /api/simulation (start, pause, resume, stop, reset)
│   │   └── activity_routes.py       # /api/activity (logs, clear)
│   ├── services/
│   │   ├── preprocessing_service.py # Dynamic CSV schema inspector & data cleaner
│   │   ├── ml_engine.py             # Train & benchmark Linear Regression, Decision Tree, RF
│   │   ├── optimization_service.py  # Property-specific heuristic recommendations
│   │   └── simulation_service.py    # Live dynamic telemetry generation engine
│   └── requirements.txt
│
├── ml/
│   ├── saved_models/                # Serialized .joblib artifacts per property
│   └── notebooks/
│       └── 01_exploration.ipynb     # Kaggle 100k smart home EDA notebook
│
├── dataset/
│   ├── smart_home_energy_consumption_large.csv # Kaggle 100k benchmark dataset
│   ├── user_uploads/                # Ingested custom CSV datasets
│   └── cleaned_datasets/            # Cleaned, deduplicated CSV exports
│
├── README.md
└── .gitignore
```

---

## ⚡ Three Operating Modes

VoltIQ supports three distinct operational modes for academic presentation and real-world evaluation:

### 1. Mode A: Real Dataset Mode (`DATASET`)
- Users upload authentic smart meter CSV datasets or explore the bundled Kaggle 100,000-record benchmark.
- Performs schema-agnostic column detection, missing value imputation, deduplication, and Z-score anomaly detection ($|Z| > 3.0$).
- All dashboard metrics (kWh, ₹ cost, highest consumer) are calculated from authentic SQLite database records.

### 2. Mode B: Live Simulation Mode (`SIMULATION`)
- Simulates dynamic, time-based energy telemetry when physical IoT meters are unavailable.
- Modulates realistic compressor duty cycles, HVAC daytime loads, lighting schedules, and equipment baseloads across property types (*Residential House*, *Family-Owned Office*, *Supermarket*, *Warehouse*, *Restaurant*).
- Live controls: **Start**, **Pause**, **Resume**, **Stop**, and **Reset**.
- Displays an explicit **`LIVE SIMULATION (DATA SOURCE: SYNTHETIC REAL-TIME ENGINE)`** label.

### 3. Mode C: Real-Time Hardware IoT Integration (`IOT`)
- Provides a dedicated REST/MQTT hardware ingestion gateway (`POST /api/iot/ingest`).
- Device enrollment generates cryptographic API keys for ESP32 microcontrollers, Modbus RS485 meters, and Raspberry Pi gateway nodes.
- **Academic Integrity Rule:** Explicitly displays **`NOT CONNECTED`** when physical hardware is not actively transmitting readings within 60 seconds (never fakes physical sensor pings).

---

## 🎯 The Three Main Project Modules

### 🔹 Module 1: Data Collection, Integration & Adaptive Preprocessing
- **Schema-Agnostic Ingestion:** Upload any CSV. The engine dynamically maps energy, timestamps, ambient temperature, and appliances without hardcoded column names.
- **Data Cleaning:** Imputes missing values, purges duplicate records, and flags Z-score anomalies.
- **Feature Engineering:** Extracts hour of day, day of week, month, and weekend status.
- **Export:** Computes a 0–100% Data Quality Score and allows 1-click download of cleaned datasets.

### 🔹 Module 2: Energy Consumption Prediction & Analytics
- **Multi-Model Benchmark:** Trains and rigorously compares three algorithms:
  1. **Linear Regression** (Baseline parametric model)
  2. **Decision Tree Regressor** (Non-linear decision tree)
  3. **Random Forest Regressor** (Ensemble bagging method)
- **Authentic Statistical Metrics:** Displays verified **MAE**, **MSE**, **RMSE**, and **$R^2$ Score** on holdout test data (no fabricated percentages). If not trained, displays an explicit *"Model Not Trained"* empty state.
- **Active Champion Switching:** Evaluators can switch which trained model is active for real-time inference.
- **Interactive Visualizations:** Actual vs. Predicted curves and real-time future prediction simulator with 95% confidence intervals.

### 🔹 Module 3: Energy Optimization, Smart Recommendations & Deployment
- **Peak-Demand Detection:** Identifies critical tariff windows (18:00 - 22:00 @ ₹ surcharge) and unusual compressor/hvac cycles.
- **Property-Type Tailored Recommendations:** Customized for Residential Villas, Corporate Offices, Supermarkets, and Warehouses.
- **Tariff in ₹/kWh:** Computes verified potential savings in **Indian Rupees (₹)**.
- **Task Progression:** Toggles recommendation states (**Pending $\rightarrow$ In Progress $\rightarrow$ Completed**) and logs achieved savings.
- **System Diagnostics:** Complete capstone deployment diagnostic monitor.

---

## 🎓 Faculty Demonstration & Viva Evaluation Page (`/demo`)

Built specifically for project viva examination, featuring an **11-stage interactive walkthrough**:
1. Multi-Tenant Household Security & Cryptographic JWT Bearer Protocol
2. Module 1: Adaptive CSV Schema Detection
3. Module 1: Data Preprocessing & Statistical Quality Scoring ($Q = 100 - P$)
4. Module 2: Multi-Model Machine Learning Benchmark ($R^2$, RMSE, MAE)
5. Module 2: Live Inference & Confidence Interval Engine ($CI_{95\%}$)
6. Module 3: Peak-Load (18:00–22:00) Demand Analysis
7. Module 3: Smart Recommendations & INR Savings
8. Mode B: Dynamic Real-Time Simulation Engine
9. Mode C: IoT Smart Meter Gateway Architecture
10. Capstone System Deployment & Infrastructure Diagnostics
11. Real-Time Backend Audit Trail & Event Verification

---

## 👥 Family Roles & Property Access Security

Strict backend multi-tenant data isolation ensures users cannot access properties belonging to other households:

| Role | Access Scope | Permissions |
| :--- | :--- | :--- |
| **Family Admin** | All Family Properties | Add/remove properties, invite/revoke members, modify ₹ tariffs, upload data |
| **Property Manager** | Assigned Properties | View & upload energy records, trigger ML training, manage equipment |
| **Family Member** | Permitted Properties | Viewer access to real-time consumption, predictions, and recommendations |

### ⚡ Pre-seeded Demo Credentials (for Evaluation)
- 👑 **Family Admin:** `admin@sharma-family.com` / `admin123`
- 🏢 **Property Manager:** `manager@sharma-family.com` / `manager123`
- 👤 **Family Member:** `priya@sharma-family.com` / `member123`
- 🔑 **Household Passkey:** `SHARMA-ENERGY-2026`

---

## 🚀 Exact Commands to Run Locally

### 1. Start the FastAPI Backend
From the project root:
```powershell
python -m uvicorn backend.main:app --reload --port 8000
```
- API Server: `http://localhost:8000`
- Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`

### 2. Start the Frontend Dashboard
In a second terminal:
```powershell
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Technology Stack
- **Frontend:** React 18, Vite, React Router v6, Recharts, Lucide Icons, Glassmorphic 3D CSS
- **Backend:** Python 3.12, FastAPI, Uvicorn, SQLite (15 Relational Tables)
- **Security:** PyJWT, Bcrypt password hashing, Bearer Token authorization
- **Machine Learning:** Scikit-learn (Linear Regression, Decision Tree, Random Forest), Pandas, NumPy, Joblib

---



## 📜 License
MIT License.
